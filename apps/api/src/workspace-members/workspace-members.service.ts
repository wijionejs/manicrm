import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  CannotModifyOwnerError,
  CannotRemoveOwnerError,
  MemberNotFoundError,
} from '../common/errors/workspace.errors';
import type { DrizzleDB } from '../db/db.module';
import { DRIZZLE } from '../db/db.module';
import { user, workspaceMember } from '../db/schema';
import type { UpdateMemberRoleDto } from './dto/workspace-member.dto';

@Injectable()
export class WorkspaceMembersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  findAll(workspaceId: string) {
    return this.db
      .select({
        id: workspaceMember.id,
        role: workspaceMember.role,
        createdAt: workspaceMember.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(workspaceMember)
      .innerJoin(user, eq(workspaceMember.userId, user.id))
      .where(eq(workspaceMember.workspaceId, workspaceId))
      .orderBy(workspaceMember.createdAt);
  }

  async updateRole(workspaceId: string, memberId: string, dto: UpdateMemberRoleDto) {
    const [member] = await this.db
      .select()
      .from(workspaceMember)
      .where(and(eq(workspaceMember.id, memberId), eq(workspaceMember.workspaceId, workspaceId)))
      .limit(1);
    if (!member) throw new MemberNotFoundError();
    if (member.role === 'owner') throw new CannotModifyOwnerError();

    const [updated] = await this.db
      .update(workspaceMember)
      .set({ role: dto.role })
      .where(and(eq(workspaceMember.id, memberId), eq(workspaceMember.workspaceId, workspaceId)))
      .returning();
    return updated;
  }

  async remove(workspaceId: string, memberId: string) {
    const [member] = await this.db
      .select()
      .from(workspaceMember)
      .where(and(eq(workspaceMember.id, memberId), eq(workspaceMember.workspaceId, workspaceId)))
      .limit(1);
    if (!member) throw new MemberNotFoundError();
    if (member.role === 'owner') throw new CannotRemoveOwnerError();

    await this.db
      .delete(workspaceMember)
      .where(and(eq(workspaceMember.id, memberId), eq(workspaceMember.workspaceId, workspaceId)));
  }
}
