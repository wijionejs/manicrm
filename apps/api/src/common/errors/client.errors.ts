import { AppError } from './app.error';

export class ClientNotFoundError extends AppError {
  readonly key = 'CLIENT_NOT_FOUND';
  constructor() {
    super(404);
  }
}
