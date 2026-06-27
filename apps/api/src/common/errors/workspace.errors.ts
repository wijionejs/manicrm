import { AppError } from './app.error';

export class WorkspaceNotFoundError extends AppError {
  readonly key = 'WORKSPACE_NOT_FOUND';
  constructor() {
    super(404);
  }
}

export class WorkspaceLimitReachedError extends AppError {
  readonly key = 'WORKSPACE_LIMIT_REACHED';
  constructor(limit: number) {
    super(403, { limit });
  }
}

export class SlugAlreadyTakenError extends AppError {
  readonly key = 'SLUG_ALREADY_TAKEN';
  constructor() {
    super(409);
  }
}

export class NotWorkspaceMemberError extends AppError {
  readonly key = 'NOT_WORKSPACE_MEMBER';
  constructor() {
    super(403);
  }
}

export class InsufficientPermissionsError extends AppError {
  readonly key = 'INSUFFICIENT_PERMISSIONS';
  constructor() {
    super(403);
  }
}
