import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { WorkspaceInvitesService } from './workspace-invites.service';
import { createInviteSchema, type CreateInviteDto } from './dto/workspace-member.dto';

@Controller('workspaces/:workspaceId/invites')
@UseGuards(WorkspaceMemberGuard, RolesGuard)
@Roles('owner', 'admin')
export class WorkspaceInvitesController {
  constructor(private readonly workspaceInvitesService: WorkspaceInvitesService) {}

  @Post()
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body(new ZodValidationPipe(createInviteSchema)) dto: CreateInviteDto,
  ) {
    return this.workspaceInvitesService.create(workspaceId, dto);
  }

  @Get()
  findAll(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.workspaceInvitesService.findAll(workspaceId);
  }

  @Delete(':inviteId')
  @HttpCode(204)
  cancel(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
  ) {
    return this.workspaceInvitesService.cancel(workspaceId, inviteId);
  }
}
