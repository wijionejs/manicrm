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

export class MemberNotFoundError extends AppError {
  readonly key = 'MEMBER_NOT_FOUND';
  constructor() {
    super(404);
  }
}

export class CannotModifyOwnerError extends AppError {
  readonly key = 'CANNOT_MODIFY_OWNER';
  constructor() {
    super(403);
  }
}

export class CannotRemoveOwnerError extends AppError {
  readonly key = 'CANNOT_REMOVE_OWNER';
  constructor() {
    super(403);
  }
}

export class AlreadyWorkspaceMemberError extends AppError {
  readonly key = 'ALREADY_WORKSPACE_MEMBER';
  constructor() {
    super(409);
  }
}

export class InviteNotFoundError extends AppError {
  readonly key = 'INVITE_NOT_FOUND';
  constructor() {
    super(404);
  }
}

export class InviteExpiredError extends AppError {
  readonly key = 'INVITE_EXPIRED';
  constructor() {
    super(410);
  }
}

export class InviteEmailMismatchError extends AppError {
  readonly key = 'INVITE_EMAIL_MISMATCH';
  constructor() {
    super(403);
  }
}

export class PendingInviteAlreadyExistsError extends AppError {
  readonly key = 'PENDING_INVITE_ALREADY_EXISTS';
  constructor() {
    super(409);
  }
}
