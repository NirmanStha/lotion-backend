import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { AccessControlService } from 'src/access-control/access-control.service';
import { PagePermissionEnum } from 'src/access-control/enums/permission.enum';
import { APIResponse } from 'src/common/dtos/api-response.dto';
import { Page } from 'src/page/entities/page.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePagePremissionDto } from './dto/create-page-premission.dto';
import { PagePremissionResponseDto } from './dto/page-premission.response.dto';
import { PagePremission, PageRole } from './entities/page-premission.entity';

@Injectable()
export class PagePremissionService {
  constructor(
    @InjectRepository(PagePremission)
    private readonly pagePermissionRepo: Repository<PagePremission>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly accessControlService: AccessControlService,
  ) {}

  private toResponse(permission: PagePremission): PagePremissionResponseDto {
    return plainToInstance(PagePremissionResponseDto, permission, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Sharing a page is governed by page:share, which neither VIEWER nor
   * GUEST holds - so a page owner, workspace editor, or workspace owner can
   * grant access, and nobody who only received access can re-share it.
   */
  private async assertCanShare(pageId: string, userId: string) {
    const canShare = await this.accessControlService.canAccessPage(
      PagePermissionEnum.SHARE,
      userId,
      pageId,
    );

    if (!canShare) {
      throw new ForbiddenException(
        'You do not have permission to share this page',
      );
    }
  }

  /**
   * Grants a user access to a single page. This is the only writer for
   * PagePremission, and therefore the mechanism behind the guest layer in
   * AccessControlService.canAccessPage.
   *
   * `grantedById` is taken from the authenticated caller rather than the
   * request body: the DTO field exists for the signature but accepting it
   * would let a caller forge an audit trail.
   */
  async create(dto: CreatePagePremissionDto, userId: string) {
    await this.assertCanShare(dto.pageId, userId);

    const [page, user] = await Promise.all([
      this.pageRepo.findOne({ where: { id: dto.pageId } }),
      this.userRepo.findOne({ where: { id: dto.userId } }),
    ]);

    if (!page) {
      throw new NotFoundException(`Page with ID ${dto.pageId} not found`);
    }

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    if (dto.userId === userId) {
      throw new BadRequestException(
        'You already have access to this page as its owner or a workspace member',
      );
    }

    const existing = await this.pagePermissionRepo.findOne({
      where: { page: { id: dto.pageId }, user: { id: dto.userId } },
    });

    if (existing) {
      // Re-granting is an update, not a conflict - the caller most likely
      // wants to change the role rather than create a duplicate.
      existing.role = dto.role;
      const updated = await this.pagePermissionRepo.save(existing);

      return APIResponse.success(
        'Page permission updated successfully',
        this.toResponse(updated),
      );
    }

    const permission = this.pagePermissionRepo.create({
      page: { id: page.id },
      user: { id: user.id },
      role: dto.role,
      grantedby: { id: userId },
    });

    const saved = await this.pagePermissionRepo.save(permission);
    const reloaded = await this.pagePermissionRepo.findOne({
      where: { id: saved.id },
      relations: ['page', 'user', 'grantedby'],
    });

    return APIResponse.success(
      'Page shared successfully',
      this.toResponse(reloaded!),
    );
  }

  /**
   * Permissions granted on a page by anyone the caller can share with.
   * Non-privileged callers get only the empty list rather than a 403, so
   * the endpoint doubles as a safe "who can see this" check.
   */
  async findAllByPage(pageId: string, userId: string) {
    const canShare = await this.accessControlService.canAccessPage(
      PagePermissionEnum.SHARE,
      userId,
      pageId,
    );

    if (!canShare) {
      return APIResponse.success('No page permissions found', []);
    }

    const permissions = await this.pagePermissionRepo.find({
      where: { page: { id: pageId } },
      relations: ['page', 'user', 'grantedby'],
    });

    return APIResponse.success(
      'Page permissions retrieved successfully',
      permissions.map((permission) => this.toResponse(permission)),
    );
  }

  async findOne(id: string, userId: string) {
    const permission = await this.pagePermissionRepo.findOne({
      where: { id },
      relations: ['page', 'user', 'grantedby'],
    });

    if (!permission) {
      throw new NotFoundException(`Page permission with ID ${id} not found`);
    }

    // You may read a grant if you can share the page or if it is your own.
    if (permission.user.id !== userId) {
      await this.assertCanShare(permission.page.id, userId);
    }

    return APIResponse.success(
      'Page permission retrieved successfully',
      this.toResponse(permission),
    );
  }

  async update(id: string, role: PageRole, userId: string) {
    const permission = await this.pagePermissionRepo.findOne({
      where: { id },
      relations: ['page'],
    });

    if (!permission) {
      throw new NotFoundException(`Page permission with ID ${id} not found`);
    }

    await this.assertCanShare(permission.page.id, userId);

    permission.role = role;
    const saved = await this.pagePermissionRepo.save(permission);
    const reloaded = await this.pagePermissionRepo.findOne({
      where: { id: saved.id },
      relations: ['page', 'user', 'grantedby'],
    });

    return APIResponse.success(
      'Page permission updated successfully',
      this.toResponse(reloaded!),
    );
  }

  /**
   * Revoking requires page:share. The page creator cannot be left without
   * access through this path either: layer 1 of canAccessPage grants them
   * access regardless, so revoking a grant is safe.
   */
  async remove(id: string, userId: string) {
    const permission = await this.pagePermissionRepo.findOne({
      where: { id },
      relations: ['page'],
    });

    if (!permission) {
      throw new NotFoundException(`Page permission with ID ${id} not found`);
    }

    await this.assertCanShare(permission.page.id, userId);

    await this.pagePermissionRepo.remove(permission);

    return APIResponse.success('Page permission revoked successfully');
  }
}
