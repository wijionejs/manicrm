import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import {
  AlreadyWorkspaceMemberError,
  InviteEmailMismatchError,
  InviteExpiredError,
  InviteNotFoundError,
  PendingInviteAlreadyExistsError,
} from '../common/errors/workspace.errors';
import type { DrizzleDB } from '../db/db.module';
import { DRIZZLE } from '../db/db.module';
import { user, workspace, workspaceInvite, workspaceMember } from '../db/schema';
import type { CreateInviteDto } from './dto/workspace-member.dto';

@Injectable()
export class WorkspaceInvitesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(workspaceId: string, dto: CreateInviteDto) {
    const [existingMember] = await this.db
      .select({ id: workspaceMember.id })
      .from(workspaceMember)
      .innerJoin(user, eq(workspaceMember.userId, user.id))
      .where(and(eq(workspaceMember.workspaceId, workspaceId), eq(user.email, dto.email)))
      .limit(1);
    if (existingMember) throw new AlreadyWorkspaceMemberError();

    const now = new Date();
    const [existingInvite] = await this.db
      .select({ id: workspaceInvite.id })
      .from(workspaceInvite)
      .where(
        and(
          eq(workspaceInvite.workspaceId, workspaceId),
          eq(workspaceInvite.email, dto.email),
          eq(workspaceInvite.status, 'pending'),
          gt(workspaceInvite.expiresAt, now),
        ),
      )
      .limit(1);
    if (existingInvite) throw new PendingInviteAlreadyExistsError();

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invite] = await this.db
      .insert(workspaceInvite)
      .values({ workspaceId, email: dto.email, role: dto.role, token, expiresAt })
      .returning();
    return invite;
  }

  async findByToken(token: string) {
    const [result] = await this.db
      .select({
        email: workspaceInvite.email,
        role: workspaceInvite.role,
        status: workspaceInvite.status,
        expiresAt: workspaceInvite.expiresAt,
        workspace: { title: workspace.title, slug: workspace.slug },
      })
      .from(workspaceInvite)
      .innerJoin(workspace, eq(workspaceInvite.workspaceId, workspace.id))
      .where(eq(workspaceInvite.token, token))
      .limit(1);
    if (!result) throw new InviteNotFoundError();
    return result;
  }

  findAll(workspaceId: string) {
    return this.db
      .select()
      .from(workspaceInvite)
      .where(eq(workspaceInvite.workspaceId, workspaceId))
      .orderBy(workspaceInvite.createdAt);
  }

  async accept(token: string, userId: string, userEmail: string) {
    const [invite] = await this.db
      .select()
      .from(workspaceInvite)
      .where(and(eq(workspaceInvite.token, token), eq(workspaceInvite.status, 'pending')))
      .limit(1);
    if (!invite) throw new InviteNotFoundError();

    if (invite.expiresAt < new Date()) {
      await this.db
        .update(workspaceInvite)
        .set({ status: 'expired' })
        .where(eq(workspaceInvite.id, invite.id));
      throw new InviteExpiredError();
    }

    if (invite.email !== userEmail) throw new InviteEmailMismatchError();

    const [existingMember] = await this.db
      .select({ id: workspaceMember.id })
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, invite.workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      )
      .limit(1);
    if (existingMember) throw new AlreadyWorkspaceMemberError();

    await this.db.transaction(async (tx) => {
      await tx.insert(workspaceMember).values({
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
      });
      await tx
        .update(workspaceInvite)
        .set({ status: 'accepted' })
        .where(eq(workspaceInvite.id, invite.id));
    });
  }
}
