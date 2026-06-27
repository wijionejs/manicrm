import { SetMetadata } from '@nestjs/common';
import type { workspaceMemberRoleEnum } from '../../db/schema';

export type WorkspaceRole = (typeof workspaceMemberRoleEnum.enumValues)[number];

export const ROLES_KEY = 'roles';
export const Roles = (...roles: WorkspaceRole[]) => SetMetadata(ROLES_KEY, roles);
