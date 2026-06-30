import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, ilike } from 'drizzle-orm';
import { ServiceNotFoundError } from '../common/errors/service.errors';
import type { DrizzleDB } from '../db/db.module';
import { DRIZZLE } from '../db/db.module';
import { service } from '../db/schema';
import type { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(workspaceId: string, dto: CreateServiceDto) {
    const [created] = await this.db
      .insert(service)
      .values({ ...dto, workspaceId })
      .returning();
    return created;
  }

  async findAll(workspaceId: string, query: ListServicesQueryDto) {
    const { page, limit, search } = query;
    const offset = (page - 1) * limit;

    const where = search
      ? and(eq(service.workspaceId, workspaceId), ilike(service.name, `%${search}%`))
      : eq(service.workspaceId, workspaceId);

    const [data, [{ total }]] = await Promise.all([
      this.db.select().from(service).where(where).orderBy(service.name).limit(limit).offset(offset),
      this.db.select({ total: count() }).from(service).where(where),
    ]);

    return { data, total, page, limit };
  }

  async findOne(workspaceId: string, serviceId: string) {
    const [found] = await this.db
      .select()
      .from(service)
      .where(and(eq(service.id, serviceId), eq(service.workspaceId, workspaceId)))
      .limit(1);
    if (!found) throw new ServiceNotFoundError();
    return found;
  }

  async update(workspaceId: string, serviceId: string, dto: UpdateServiceDto) {
    const [updated] = await this.db
      .update(service)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(service.id, serviceId), eq(service.workspaceId, workspaceId)))
      .returning();
    if (!updated) throw new ServiceNotFoundError();
    return updated;
  }

  async remove(workspaceId: string, serviceId: string) {
    const [deleted] = await this.db
      .delete(service)
      .where(and(eq(service.id, serviceId), eq(service.workspaceId, workspaceId)))
      .returning();
    if (!deleted) throw new ServiceNotFoundError();
    return deleted;
  }
}
