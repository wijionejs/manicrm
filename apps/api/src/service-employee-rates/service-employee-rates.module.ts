import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { ServiceEmployeeRatesController } from './service-employee-rates.controller';
import { ServiceEmployeeRatesService } from './service-employee-rates.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [ServiceEmployeeRatesController],
  providers: [ServiceEmployeeRatesService, WorkspaceMemberGuard, RolesGuard],
})
export class ServiceEmployeeRatesModule {}
