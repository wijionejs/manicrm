import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { RolesGuard } from './guards/roles.guard';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceMemberGuard, RolesGuard],
})
export class WorkspacesModule {}
