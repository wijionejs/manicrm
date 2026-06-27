import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const workspaceMemberRoleEnum = pgEnum('workspace_member_role', [
  'owner',
  'admin',
  'employee',
]);

export const workspace = pgTable('workspace', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workspaceMember = pgTable('workspace_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: workspaceMemberRoleEnum('role').notNull().default('employee'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
