import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import {
  listServiceEmployeeRatesQuerySchema,
  upsertServiceEmployeeRateSchema,
  type ListServiceEmployeeRatesQueryDto,
  type UpsertServiceEmployeeRateDto,
} from './dto/service-employee-rate.dto';
import { ServiceEmployeeRatesService } from './service-employee-rates.service';

@Controller('workspaces/:workspaceId/service-employee-rates')
@UseGuards(WorkspaceMemberGuard, RolesGuard)
export class ServiceEmployeeRatesController {
  constructor(private readonly serviceEmployeeRatesService: ServiceEmployeeRatesService) {}

  @Put()
  @Roles('owner', 'admin')
  upsert(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body(new ZodValidationPipe(upsertServiceEmployeeRateSchema)) dto: UpsertServiceEmployeeRateDto,
  ) {
    return this.serviceEmployeeRatesService.upsert(workspaceId, dto);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query(new ZodValidationPipe(listServiceEmployeeRatesQuerySchema))
    query: ListServiceEmployeeRatesQueryDto,
  ) {
    return this.serviceEmployeeRatesService.findAll(workspaceId, query);
  }

  @Delete(':rateId')
  @Roles('owner', 'admin')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('rateId', ParseUUIDPipe) rateId: string,
  ) {
    return this.serviceEmployeeRatesService.remove(workspaceId, rateId);
  }
}
