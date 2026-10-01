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
import {
  PagePermissionEnum,
  WorkspacePermission,
} from 'src/access-control/enums/permission.enum';
import { APIResponse } from 'src/common/dtos/api-response.dto';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { MovePageDto } from './dto/move-page.dto';
import { PageResponseDto } from './dto/page.response.dto';
import { TransferPageDto } from './dto/transfer-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from './entities/page.entity';

/** Guards against unbounded recursion when walking the page tree. */
const MAX_PAGE_TREE_DEPTH = 20;

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    private readonly accessControlService: AccessControlService,
  ) {}

  /**
   * TypeORM accepts an id-only object for a relation, but the entity type
   * demands a full instance. Cast keeps the intent explicit at the few sites
   * that assign a relation by id.
   */
  private ref<T>(id: string): T {
    return { id } as T;
  }

  private toResponse(page: Page): PageResponseDto {
    return plainToInstance(PageResponseDto, page, {
      excludeExtraneousValues: true,
    });
  }

  private async findPageOrFail(pageId: string): Promise<Page> {
    const page = await this.pageRepo.findOne({
      where: { id: pageId },
      relations: ['workspace', 'parentPage', 'createdBy'],
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${pageId} not found`);
    }

    return page;
  }

  /**
   * Guards every page mutation. The guard/policy layer covers the common CRUD
   * routes; operations that need more than a single permission (move, transfer)
   * call this directly.
   */
  private async assertCanAccessPage(
    permission: PagePermissionEnum,
    userId: string,
    pageId: string,
  ): Promise<Page> {
    const page = await this.findPageOrFail(pageId);

    const allowed = await this.accessControlService.canAccessPage(
      permission,
      userId,
      pageId,
    );

    if (!allowed) {
      throw new ForbiddenException(
        `You do not have permission to perform "${permission}" on this page`,
      );
    }

    return page;
  }

  /**
   * Root-level page creation and promotion both require write access to the
   * workspace. canAccessPage cannot answer this: there is no page yet (or the
   * page is being detached from the hierarchy).
   */
  private async assertCanWriteInWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const canWrite = await this.accessControlService.canAccessWorkspace(
      userId,
      workspaceId,
      WorkspacePermission.UPDATE,
    );

    if (!canWrite) {
      throw new ForbiddenException(
        'You do not have permission to create root-level pages in this workspace',
      );
    }
  }

  async create(dto: CreatePageDto, userId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: dto.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Workspace with ID ${dto.workspaceId} not found`,
      );
    }

    let parentPage: Page | undefined;

    if (dto.parentPageId) {
      parentPage = await this.findPageOrFail(dto.parentPageId);

      // A parent from a different workspace would produce a page that belongs
      // to two workspaces at once - reject rather than silently reparenting.
      if (parentPage.workspace.id !== dto.workspaceId) {
        throw new BadRequestException(
          'Parent page belongs to a different workspace',
        );
      }

      const canCreateSubPage = await this.accessControlService.canAccessPage(
        PagePermissionEnum.CREATE_SUBPAGE,
        userId,
        parentPage.id,
      );

      if (!canCreateSubPage) {
        throw new ForbiddenException(
          'You do not have permission to create a sub-page here',
        );
      }
    } else {
      // Top-level page: the user must be able to write in the workspace.
      await this.assertCanWriteInWorkspace(userId, dto.workspaceId);
    }

    const page = this.pageRepo.create({
      title: dto.title,
      icon: dto.icon,
      coverImage: dto.coverImage,
      content: dto.content ?? {},
      workspace: { id: dto.workspaceId },
      createdBy: { id: userId },
      parentPage: parentPage ? { id: parentPage.id } : null,
      isPublished: false,
      isArchived: false,
      inheritPermissions: dto.inheritPermissions ?? true,
    });

    const saved = await this.pageRepo.save(page);
    const reloaded = await this.findPageOrFail(saved.id);

    return APIResponse.success(
      'Page created successfully',
      this.toResponse(reloaded),
    );
  }

  /**
   * Pages in a workspace the caller can read. Archived pages are excluded
   * unless explicitly requested.
   */
  async findAllByWorkspace(
    workspaceId: string,
    userId: string,
    includeArchived = false,
  ) {
    const canRead = await this.accessControlService.canAccessWorkspace(
      userId,
      workspaceId,
      WorkspacePermission.READ,
    );

    if (!canRead) {
      throw new ForbiddenException(
        'You do not have permission to view pages in this workspace',
      );
    }

    const pages = await this.pageRepo.find({
      where: { workspace: { id: workspaceId } },
      relations: ['createdBy'],
      order: { createdAt: 'ASC' },
    });

    const visible = await this.filterReadable(pages, userId);
    const filtered = includeArchived
      ? visible
      : visible.filter((page) => !page.isArchived);

    return APIResponse.success(
      'Pages retrieved successfully',
      filtered.map((page) => this.toResponse(page)),
    );
  }

  /**
   * Resolves READ per page. A workspace-level READ is not sufficient here:
   * a GUEST reaches a workspace with no workspace permissions at all and
   * only sees pages shared with them individually.
   */
  private async filterReadable(pages: Page[], userId: string): Promise<Page[]> {
    const results = await Promise.all(
      pages.map((page) =>
        this.accessControlService.canAccessPage(
          PagePermissionEnum.READ,
          userId,
          page.id,
        ),
      ),
    );

    return pages.filter((_, index) => results[index]);
  }

  async findOne(pageId: string, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.READ,
      userId,
      pageId,
    );

    return APIResponse.success(
      'Page retrieved successfully',
      this.toResponse(page),
    );
  }

  /**
   * Returns the page hierarchy for a workspace as nested DTOs. Only branches
   * the caller can read are included, and each level recurses at most
   * MAX_PAGE_TREE_DEPTH deep.
   */
  async findTree(workspaceId: string, userId: string) {
    const canRead = await this.accessControlService.canAccessWorkspace(
      userId,
      workspaceId,
      WorkspacePermission.READ,
    );

    if (!canRead) {
      throw new ForbiddenException(
        'You do not have permission to view pages in this workspace',
      );
    }

    const pages = await this.pageRepo.find({
      where: { workspace: { id: workspaceId } },
      relations: ['createdBy'],
      order: { createdAt: 'ASC' },
    });

    const visible = await this.filterReadable(pages, userId);
    const byParent = new Map<string | null, Page[]>();

    for (const page of visible) {
      const parentId = page.parentPage?.id ?? null;
      const bucket = byParent.get(parentId) ?? [];
      bucket.push(page);
      byParent.set(parentId, bucket);
    }

    const build = (parentId: string | null, depth: number) => {
      const children = byParent.get(parentId) ?? [];

      return children.map((page) => {
        const dto = this.toResponse(page) as PageResponseDto & {
          subPages?: PageResponseDto[];
        };
        dto.subPages =
          depth < MAX_PAGE_TREE_DEPTH ? build(page.id, depth + 1) : [];
        return dto;
      });
    };

    return APIResponse.success(
      'Page tree retrieved successfully',
      build(null, 0),
    );
  }

  async update(pageId: string, dto: UpdatePageDto, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.UPDATE,
      userId,
      pageId,
    );

    // A GUEST or page-level VIEWER may hold UPDATE but must not be able to
    // flip publishing or archiving state - those carry their own permissions.
    if (dto.isPublished !== undefined && dto.isPublished !== page.isPublished) {
      await this.assertCanAccessPage(
        PagePermissionEnum.PUBLISH,
        userId,
        pageId,
      );
    }

    if (dto.isArchived !== undefined && dto.isArchived !== page.isArchived) {
      await this.assertCanAccessPage(
        PagePermissionEnum.ARCHIVE,
        userId,
        pageId,
      );
    }

    // Assign field by field rather than Object.assign: the DTO is the contract
    // for what may change, and an explicit list keeps a future DTO field from
    // silently becoming writable through this path.
    if (dto.title !== undefined) page.title = dto.title;
    if (dto.icon !== undefined) page.icon = dto.icon;
    if (dto.coverImage !== undefined) page.coverImage = dto.coverImage;
    if (dto.content !== undefined) page.content = dto.content;
    if (dto.inheritPermissions !== undefined) {
      page.inheritPermissions = dto.inheritPermissions;
    }
    if (dto.isPublished !== undefined) page.isPublished = dto.isPublished;
    if (dto.isArchived !== undefined) page.isArchived = dto.isArchived;

    const saved = await this.pageRepo.save(page);
    const reloaded = await this.findPageOrFail(saved.id);

    return APIResponse.success(
      'Page updated successfully',
      this.toResponse(reloaded),
    );
  }

  async setArchived(pageId: string, isArchived: boolean, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.ARCHIVE,
      userId,
      pageId,
    );

    page.isArchived = isArchived;
    const saved = await this.pageRepo.save(page);
    const reloaded = await this.findPageOrFail(saved.id);

    return APIResponse.success(
      isArchived
        ? 'Page archived successfully'
        : 'Page unarchived successfully',
      this.toResponse(reloaded),
    );
  }

  async setPublished(pageId: string, isPublished: boolean, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.PUBLISH,
      userId,
      pageId,
    );

    page.isPublished = isPublished;
    const saved = await this.pageRepo.save(page);
    const reloaded = await this.findPageOrFail(saved.id);

    return APIResponse.success(
      isPublished
        ? 'Page published successfully'
        : 'Page unpublished successfully',
      this.toResponse(reloaded),
    );
  }

  /**
   * Reparents a page within its own workspace. Rejects moves that would
   * detach the page from the tree root or create a cycle, since the entity
   * models hierarchy through a self-referencing relation.
   */
  async move(pageId: string, dto: MovePageDto, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.MOVE,
      userId,
      pageId,
    );

    // `parentPageId` must be present. An omitted field and an explicit null
    // mean different things, and with skipUndefinedProperties an omitted
    // field would otherwise be read as "promote to root" and skip the
    // destination check entirely.
    if (dto.parentPageId === undefined) {
      throw new BadRequestException('parentPageId is required');
    }

    const newParentId = dto.parentPageId;

    if (newParentId === pageId) {
      throw new BadRequestException('A page cannot be its own parent');
    }

    if (newParentId === null) {
      // Promoting to a root page is a root-level creation, so it needs the
      // same workspace write access that creating a root page requires.
      await this.assertCanWriteInWorkspace(userId, page.workspace.id);
    }

    if (newParentId) {
      const newParent = await this.findPageOrFail(newParentId);

      if (newParent.workspace.id !== page.workspace.id) {
        throw new BadRequestException(
          'Cannot move a page into a different workspace. Use the transfer endpoint.',
        );
      }

      const canCreateSubPage = await this.accessControlService.canAccessPage(
        PagePermissionEnum.CREATE_SUBPAGE,
        userId,
        newParentId,
      );

      if (!canCreateSubPage) {
        throw new ForbiddenException(
          'You do not have permission to move a page under this parent',
        );
      }

      if (await this.isDescendant(page.id, newParentId)) {
        throw new BadRequestException(
          'Cannot move a page beneath one of its own descendants',
        );
      }
    }

    page.parentPage = newParentId ? this.ref<Page>(newParentId) : null;
    const saved = await this.pageRepo.save(page);
    const reloaded = await this.findPageOrFail(saved.id);

    return APIResponse.success(
      'Page moved successfully',
      this.toResponse(reloaded),
    );
  }

  /** Walks up from `candidateId` looking for `pageId` to detect a cycle. */
  private async isDescendant(
    pageId: string,
    candidateId: string,
    depth = 0,
  ): Promise<boolean> {
    if (depth > MAX_PAGE_TREE_DEPTH) {
      // A chain this deep is already pathological; refuse rather than guess.
      throw new BadRequestException('Page hierarchy is too deep to move');
    }

    const candidate = await this.pageRepo.findOne({
      where: { id: candidateId },
      relations: ['parentPage'],
    });

    if (!candidate?.parentPage) {
      return false;
    }

    if (candidate.parentPage.id === pageId) {
      return true;
    }

    return this.isDescendant(pageId, candidate.parentPage.id, depth + 1);
  }

  /**
   * Collects the page and every descendant beneath it.
   *
   * Transferring only the root would leave descendants pointing at a page in
   * the new workspace while they remain members of the old one. Since pages
   * are listed and tree-built per workspace, that silently orphans the
   * subtree - it disappears from the destination's tree and is no longer
   * reachable from the source.
   */
  private async collectSubtree(pageId: string, depth = 0): Promise<Page[]> {
    if (depth > MAX_PAGE_TREE_DEPTH) {
      throw new BadRequestException('Page hierarchy is too deep to transfer');
    }

    const children = await this.pageRepo.find({
      where: { parentPage: { id: pageId } },
    });

    const descendants: Page[] = [];
    for (const child of children) {
      descendants.push(
        child,
        ...(await this.collectSubtree(child.id, depth + 1)),
      );
    }

    return descendants;
  }

  async transfer(pageId: string, dto: TransferPageDto, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.MOVE,
      userId,
      pageId,
    );

    const destination = await this.workspaceRepo.findOne({
      where: { id: dto.workspaceId },
    });

    if (!destination) {
      throw new NotFoundException(
        `Workspace with ID ${dto.workspaceId} not found`,
      );
    }

    // An omitted parentPageId would otherwise be read as "detach to root",
    // skipping the destination authorization below.
    if (
      dto.parentPageId === undefined &&
      dto.workspaceId === page.workspace.id
    ) {
      throw new BadRequestException('parentPageId is required');
    }

    const newParentId = dto.parentPageId ?? null;

    if (newParentId === pageId) {
      throw new BadRequestException('A page cannot be its own parent');
    }

    if (newParentId) {
      const newParent = await this.findPageOrFail(newParentId);

      if (newParent.workspace.id !== dto.workspaceId) {
        throw new BadRequestException(
          'Destination parent page belongs to a different workspace',
        );
      }

      if (await this.isDescendant(page.id, newParentId)) {
        throw new BadRequestException(
          'Cannot move a page beneath one of its own descendants',
        );
      }
    }

    // Descendants travel with the root, so the caller must be able to move
    // every page in the subtree - not just the one named in the URL.
    const subtree = await this.collectSubtree(pageId);

    const moveAllowed = await Promise.all(
      [page, ...subtree].map((p) =>
        this.accessControlService.canAccessPage(
          PagePermissionEnum.MOVE,
          userId,
          p.id,
        ),
      ),
    );

    if (moveAllowed.some((allowed) => !allowed)) {
      throw new ForbiddenException(
        'You do not have permission to move the entire page subtree',
      );
    }

    if (newParentId) {
      const canCreateSubPage = await this.accessControlService.canAccessPage(
        PagePermissionEnum.CREATE_SUBPAGE,
        userId,
        newParentId,
      );

      if (!canCreateSubPage) {
        throw new ForbiddenException(
          'You do not have permission to move a page under this parent',
        );
      }
    } else {
      await this.assertCanWriteInWorkspace(userId, dto.workspaceId);
    }

    // Root and descendants must land together or not at all.
    await this.pageRepo.manager.transaction(async (manager) => {
      await manager.update(
        Page,
        subtree.map((p) => p.id),
        {
          workspace: this.ref<Workspace>(dto.workspaceId),
        },
      );

      page.workspace = this.ref<Workspace>(dto.workspaceId);
      page.parentPage = newParentId ? this.ref<Page>(newParentId) : null;
      await manager.save(Page, page);
    });

    const reloaded = await this.findPageOrFail(pageId);

    return APIResponse.success(
      'Page transferred successfully',
      this.toResponse(reloaded),
    );
  }

  async remove(pageId: string, userId: string) {
    const page = await this.assertCanAccessPage(
      PagePermissionEnum.DELETE,
      userId,
      pageId,
    );

    // Sub-pages cascade via the entity's onDelete: CASCADE.
    await this.pageRepo.remove(page);

    return APIResponse.success('Page deleted successfully');
  }
}
