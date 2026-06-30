import { AppError } from './app.error';

export class ServiceNotFoundError extends AppError {
  readonly key = 'SERVICE_NOT_FOUND';
  constructor() {
    super(404);
  }
}
