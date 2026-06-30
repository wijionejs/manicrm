import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import {
  createServiceSchema,
  listServicesQuerySchema,
  updateServiceSchema,
  type CreateServiceDto,
  type ListServicesQueryDto,
  type UpdateServiceDto,
} from './dto/service.dto';
import { ServicesService } from './services.service';

@Controller('workspaces/:workspaceId/services')
@UseGuards(WorkspaceMemberGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles('owner', 'admin')
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body(new ZodValidationPipe(createServiceSchema)) dto: CreateServiceDto,
  ) {
    return this.servicesService.create(workspaceId, dto);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query(new ZodValidationPipe(listServicesQuerySchema)) query: ListServicesQueryDto,
  ) {
    return this.servicesService.findAll(workspaceId, query);
  }

  @Get(':serviceId')
  findOne(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.servicesService.findOne(workspaceId, serviceId);
  }

  @Patch(':serviceId')
  @Roles('owner', 'admin')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Body(new ZodValidationPipe(updateServiceSchema)) dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(workspaceId, serviceId, dto);
  }

  @Delete(':serviceId')
  @Roles('owner', 'admin')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.servicesService.remove(workspaceId, serviceId);
  }
}
