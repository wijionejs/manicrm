import { date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { workspace } from './workspace.schema';

export const client = pgTable('client', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phoneNumber: text('phone_number'),
  instagram: text('instagram'),
  telegram: text('telegram'),
  birthday: date('birthday'),
  notes: text('notes'),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
