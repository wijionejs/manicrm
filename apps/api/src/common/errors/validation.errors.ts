import { AppError } from './app.error';

export class ValidationError extends AppError {
  readonly key = 'VALIDATION_ERROR';
  constructor(issues: unknown[]) {
    super(400, { issues });
  }
}
