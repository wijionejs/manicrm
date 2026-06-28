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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { ClientsService } from './clients.service';
import {
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
  type CreateClientDto,
  type ListClientsQueryDto,
  type UpdateClientDto,
} from './dto/client.dto';

@Controller('workspaces/:workspaceId/clients')
@UseGuards(WorkspaceMemberGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body(new ZodValidationPipe(createClientSchema)) dto: CreateClientDto,
  ) {
    return this.clientsService.create(workspaceId, dto);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query(new ZodValidationPipe(listClientsQuerySchema)) query: ListClientsQueryDto,
  ) {
    return this.clientsService.findAll(workspaceId, query);
  }

  @Get(':clientId')
  findOne(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.findOne(workspaceId, clientId);
  }

  @Patch(':clientId')
  update(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body(new ZodValidationPipe(updateClientSchema)) dto: UpdateClientDto,
  ) {
    return this.clientsService.update(workspaceId, clientId, dto);
  }

  @Delete(':clientId')
  remove(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.clientsService.remove(workspaceId, clientId);
  }
}
