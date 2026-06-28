import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { InviteAcceptController } from './invite-accept.controller';
import { WorkspaceInvitesController } from './workspace-invites.controller';
import { WorkspaceInvitesService } from './workspace-invites.service';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceMembersService } from './workspace-members.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [WorkspaceMembersController, WorkspaceInvitesController, InviteAcceptController],
  providers: [WorkspaceMembersService, WorkspaceInvitesService, WorkspaceMemberGuard, RolesGuard],
})
export class WorkspaceMembersModule {}
