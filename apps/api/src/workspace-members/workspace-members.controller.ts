import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { WorkspaceMembersService } from './workspace-members.service';
import { updateMemberRoleSchema, type UpdateMemberRoleDto } from './dto/workspace-member.dto';

@Controller('workspaces/:workspaceId/members')
@UseGuards(WorkspaceMemberGuard)
export class WorkspaceMembersController {
  constructor(private readonly workspaceMembersService: WorkspaceMembersService) {}

  @Get()
  findAll(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.workspaceMembersService.findAll(workspaceId);
  }

  @Patch(':memberId')
  @UseGuards(RolesGuard)
  @Roles('owner')
  updateRole(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body(new ZodValidationPipe(updateMemberRoleSchema)) dto: UpdateMemberRoleDto,
  ) {
    return this.workspaceMembersService.updateRole(workspaceId, memberId, dto);
  }

  @Delete(':memberId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(204)
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.workspaceMembersService.remove(workspaceId, memberId);
  }
}
