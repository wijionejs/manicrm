export abstract class AppError extends Error {
  abstract readonly key: string;
  readonly statusCode: number;
  readonly metadata?: Record<string, unknown>;

  constructor(statusCode = 400, metadata?: Record<string, unknown>) {
    super();
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
}
