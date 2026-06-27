import { AppError } from './app.error';

export class UnauthenticatedError extends AppError {
  readonly key = 'UNAUTHENTICATED';
  constructor() {
    super(401);
  }
}
