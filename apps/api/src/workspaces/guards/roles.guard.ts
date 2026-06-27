import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InsufficientPermissionsError } from '../../common/errors/workspace.errors';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import type { WorkspaceRole } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<WorkspaceRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const member = request.workspaceMember;

    if (!member || !roles.includes(member.role)) {
      throw new InsufficientPermissionsError();
    }
    return true;
  }
}
