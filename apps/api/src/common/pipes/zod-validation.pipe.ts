import { PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod/v4';
import { ValidationError } from '../errors/validation.errors';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new ValidationError(result.error.issues);
    return result.data;
  }
}
