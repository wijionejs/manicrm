import { numeric, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { workspace, workspaceMember } from './workspace.schema';
import { service } from './service.schema';

export const serviceEmployeeRate = pgTable(
  'service_employee_rate',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => service.id, { onDelete: 'cascade' }),
    workspaceMemberId: uuid('workspace_member_id')
      .notNull()
      .references(() => workspaceMember.id, { onDelete: 'cascade' }),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.serviceId, table.workspaceMemberId)],
);
