import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { ServiceEmployeeRateNotFoundError } from '../common/errors/service-employee-rate.errors';
import { ServiceNotFoundError } from '../common/errors/service.errors';
import { NotWorkspaceMemberError } from '../common/errors/workspace.errors';
import type { DrizzleDB } from '../db/db.module';
import { DRIZZLE } from '../db/db.module';
import { service, serviceEmployeeRate, workspaceMember } from '../db/schema';
import type {
  ListServiceEmployeeRatesQueryDto,
  UpsertServiceEmployeeRateDto,
} from './dto/service-employee-rate.dto';

@Injectable()
export class ServiceEmployeeRatesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async upsert(workspaceId: string, dto: UpsertServiceEmployeeRateDto) {
    const [svc] = await this.db
      .select({ id: service.id })
      .from(service)
      .where(and(eq(service.id, dto.serviceId), eq(service.workspaceId, workspaceId)))
      .limit(1);
    if (!svc) throw new ServiceNotFoundError();

    const [member] = await this.db
      .select({ id: workspaceMember.id })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.id, dto.workspaceMemberId),
          eq(workspaceMember.workspaceId, workspaceId),
        ),
      )
      .limit(1);
    if (!member) throw new NotWorkspaceMemberError();

    const [upserted] = await this.db
      .insert(serviceEmployeeRate)
      .values({ ...dto, price: String(dto.price), workspaceId })
      .onConflictDoUpdate({
        target: [serviceEmployeeRate.serviceId, serviceEmployeeRate.workspaceMemberId],
        set: { price: String(dto.price), updatedAt: new Date() },
      })
      .returning();
    return upserted;
  }

  async findAll(workspaceId: string, query: ListServiceEmployeeRatesQueryDto) {
    const conditions = [eq(serviceEmployeeRate.workspaceId, workspaceId)];
    if (query.serviceId) conditions.push(eq(serviceEmployeeRate.serviceId, query.serviceId));
    if (query.workspaceMemberId)
      conditions.push(eq(serviceEmployeeRate.workspaceMemberId, query.workspaceMemberId));

    return this.db
      .select()
      .from(serviceEmployeeRate)
      .where(and(...conditions));
  }

  async remove(workspaceId: string, rateId: string) {
    const [deleted] = await this.db
      .delete(serviceEmployeeRate)
      .where(
        and(eq(serviceEmployeeRate.id, rateId), eq(serviceEmployeeRate.workspaceId, workspaceId)),
      )
      .returning();
    if (!deleted) throw new ServiceEmployeeRateNotFoundError();
    return deleted;
  }
}
