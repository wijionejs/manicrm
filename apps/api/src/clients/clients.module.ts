import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [ClientsController],
  providers: [ClientsService, WorkspaceMemberGuard, RolesGuard],
})
export class ClientsModule {}
