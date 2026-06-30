import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [ServicesController],
  providers: [ServicesService, WorkspaceMemberGuard, RolesGuard],
})
export class ServicesModule {}
