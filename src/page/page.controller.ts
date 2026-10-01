import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CheckPolicy } from 'src/access-control/decorator/check-policy.decorator';
import { PolicyMeta } from 'src/access-control/decorator/policy-meta.decorator';
import { PagePermissionEnum } from 'src/access-control/enums/permission.enum';
import { PoliciesGuard } from 'src/access-control/gaurd/policies.gaurd';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { CreatePageDto } from './dto/create-page.dto';
import { MovePageDto } from './dto/move-page.dto';
import { TransferPageDto } from './dto/transfer-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageService } from './page.service';
import { PageCrudPolicy } from './policies/page-crud.policy';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  // Creation has no :id to authorize against, so the service checks
  // CREATE_SUBPAGE on the parent (or workspace write access at root).
  @Post()
  create(@Body() dto: CreatePageDto, @GetUser('userId') userId: string) {
    return this.pageService.create(dto, userId);
  }

  @Get('workspace/:workspaceId')
  findAllByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @GetUser('userId') userId: string,
    @Query('includeArchived', new ParseBoolPipe({ optional: true }))
    includeArchived?: boolean,
  ) {
    return this.pageService.findAllByWorkspace(
      workspaceId,
      userId,
      includeArchived ?? false,
    );
  }

  @Get('workspace/:workspaceId/tree')
  findTree(
    @Param('workspaceId') workspaceId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.pageService.findTree(workspaceId, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.READ })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pageService.findOne(id, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.UPDATE })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @GetUser('userId') userId: string,
  ) {
    return this.pageService.update(id, dto, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.ARCHIVE })
  @Patch(':id/archive')
  archive(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pageService.setArchived(id, true, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.ARCHIVE })
  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pageService.setArchived(id, false, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.PUBLISH })
  @Patch(':id/publish')
  publish(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pageService.setPublished(id, true, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.PUBLISH })
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pageService.setPublished(id, false, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.MOVE })
  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body() dto: MovePageDto,
    @GetUser('userId') userId: string,
  ) {
    return this.pageService.move(id, dto, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.MOVE })
  @Patch(':id/transfer')
  transfer(
    @Param('id') id: string,
    @Body() dto: TransferPageDto,
    @GetUser('userId') userId: string,
  ) {
    return this.pageService.transfer(id, dto, userId);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicy(PageCrudPolicy)
  @PolicyMeta({ permission: PagePermissionEnum.DELETE })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.pageService.remove(id, userId);
  }
}
