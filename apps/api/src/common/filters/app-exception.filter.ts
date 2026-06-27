import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AppError } from '../errors/app.error';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      const body: Record<string, unknown> = {
        key: exception.key,
        statusCode: exception.statusCode,
      };
      if (exception.metadata !== undefined) {
        body.metadata = exception.metadata;
      }
      return response.status(exception.statusCode).json(body);
    }

    this.logger.error('Unhandled exception', exception);
    return response.status(500).json({
      key: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  }
}
