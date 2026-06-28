import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, ilike, or } from 'drizzle-orm';
import { ClientNotFoundError } from '../common/errors/client.errors';
import type { DrizzleDB } from '../db/db.module';
import { DRIZZLE } from '../db/db.module';
import { client } from '../db/schema';
import type { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(workspaceId: string, dto: CreateClientDto) {
    const [created] = await this.db
      .insert(client)
      .values({ ...dto, workspaceId })
      .returning();
    return created;
  }

  async findAll(workspaceId: string, query: ListClientsQueryDto) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const where = search
      ? and(
          eq(client.workspaceId, workspaceId),
          or(
            ilike(client.firstName, `%${search}%`),
            ilike(client.lastName, `%${search}%`),
            ilike(client.phoneNumber, `%${search}%`),
          ),
        )
      : eq(client.workspaceId, workspaceId);

    const [data, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(client)
        .where(where)
        .orderBy(client.lastName, client.firstName)
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(client).where(where),
    ]);

    return { data, total, page, limit };
  }

  async findOne(workspaceId: string, clientId: string) {
    const [found] = await this.db
      .select()
      .from(client)
      .where(and(eq(client.id, clientId), eq(client.workspaceId, workspaceId)))
      .limit(1);
    if (!found) throw new ClientNotFoundError();
    return found;
  }

  async update(workspaceId: string, clientId: string, dto: UpdateClientDto) {
    const [updated] = await this.db
      .update(client)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(client.id, clientId), eq(client.workspaceId, workspaceId)))
      .returning();
    if (!updated) throw new ClientNotFoundError();
    return updated;
  }

  async remove(workspaceId: string, clientId: string) {
    const [deleted] = await this.db
      .delete(client)
      .where(and(eq(client.id, clientId), eq(client.workspaceId, workspaceId)))
      .returning();
    if (!deleted) throw new ClientNotFoundError();
    return deleted;
  }
}
