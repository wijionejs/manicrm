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
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RolesGuard } from '../workspaces/guards/roles.guard';
import { ClientsService } from './clients.service';
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientDto,
  type UpdateClientDto,
} from './dto/client.dto';

@Controller('workspaces/:workspaceId/clients')
@UseGuards(WorkspaceMemberGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body(new ZodValidationPipe(createClientSchema)) dto: CreateClientDto,
  ) {
    return this.clientsService.create(workspaceId, dto);
  }

  @Get()
  findAll(@Param('workspaceId', ParseUUIDPipe) workspaceId: string) {
    return this.clientsService.findAll(workspaceId);
  }

  @Get(':clientId')
  findOne(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.findOne(workspaceId, clientId);
  }

  @Patch(':clientId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body(new ZodValidationPipe(updateClientSchema)) dto: UpdateClientDto,
  ) {
    return this.clientsService.update(workspaceId, clientId, dto);
  }

  @Delete(':clientId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.remove(workspaceId, clientId);
  }
}
