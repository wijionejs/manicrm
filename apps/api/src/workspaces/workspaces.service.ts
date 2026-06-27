import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { DrizzleDB } from '../db/db.module';
import { DRIZZLE } from '../db/db.module';
import { workspace, workspaceMember } from '../db/schema';
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    return this.db.transaction(async (tx) => {
      let created: typeof workspace.$inferSelect;
      try {
        [created] = await tx
          .insert(workspace)
          .values({ ...dto, userId })
          .returning();
      } catch (err: any) {
        if (err.code === '23505') throw new ConflictException('Slug already taken');
        throw err;
      }

      await tx.insert(workspaceMember).values({
        workspaceId: created.id,
        userId,
        role: 'owner',
      });

      return created;
    });
  }

  async findAllForUser(userId: string) {
    return this.db
      .select({
        id: workspace.id,
        title: workspace.title,
        slug: workspace.slug,
        userId: workspace.userId,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        role: workspaceMember.role,
      })
      .from(workspace)
      .innerJoin(
        workspaceMember,
        and(eq(workspaceMember.workspaceId, workspace.id), eq(workspaceMember.userId, userId)),
      );
  }

  async findOne(workspaceId: string) {
    const [ws] = await this.db
      .select()
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1);
    if (!ws) throw new NotFoundException('Workspace not found');
    return ws;
  }

  async update(workspaceId: string, dto: UpdateWorkspaceDto) {
    let updated: typeof workspace.$inferSelect;
    try {
      [updated] = await this.db
        .update(workspace)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(workspace.id, workspaceId))
        .returning();
    } catch (err: any) {
      if (err.code === '23505') throw new ConflictException('Slug already taken');
      throw err;
    }
    if (!updated) throw new NotFoundException('Workspace not found');
    return updated;
  }

  async remove(workspaceId: string) {
    const [deleted] = await this.db
      .delete(workspace)
      .where(eq(workspace.id, workspaceId))
      .returning();
    if (!deleted) throw new NotFoundException('Workspace not found');
    return deleted;
  }
}
