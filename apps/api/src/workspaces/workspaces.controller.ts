import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { RolesGuard } from './guards/roles.guard';
import { WorkspacesService } from './workspaces.service';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  type CreateWorkspaceDto,
  type UpdateWorkspaceDto,
} from './dto/workspace.dto';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createWorkspaceSchema)) dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.workspacesService.findAllForUser(user.id);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  findOne(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.workspacesService.findOne(workspaceId);
  }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('owner')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body(new ZodValidationPipe(updateWorkspaceSchema)) dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(workspaceId, dto);
  }

  @Delete(':workspaceId')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('owner')
  remove(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.workspacesService.remove(workspaceId);
  }
}
