import { AppError } from './app.error';

export class ServiceEmployeeRateNotFoundError extends AppError {
  readonly key = 'SERVICE_EMPLOYEE_RATE_NOT_FOUND';
  constructor() {
    super(404);
  }
}
