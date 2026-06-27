import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { DrizzleDB } from '../../db/db.module';
import { DRIZZLE } from '../../db/db.module';
import { workspace, workspaceMember } from '../../db/schema';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user.id;
    const workspaceId: string = request.params.workspaceId;

    const [ws] = await this.db
      .select({ id: workspace.id })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1);

    if (!ws) throw new NotFoundException('Workspace not found');

    const [member] = await this.db
      .select()
      .from(workspaceMember)
      .where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.userId, userId)))
      .limit(1);

    if (!member) throw new ForbiddenException('Not a workspace member');

    request.workspaceMember = member;
    return true;
  }
}
