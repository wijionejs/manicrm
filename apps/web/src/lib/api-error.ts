import { HTTPError } from 'ky';

export interface ApiErrorData {
  key: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
}

export function getApiError(err: unknown): ApiErrorData {
  if (err instanceof HTTPError) {
    const data = err.data as Record<string, unknown> | null | undefined;
    if (data != null && typeof data.key === 'string') {
      return data as unknown as ApiErrorData;
    }
  }
  return { key: 'INTERNAL_SERVER_ERROR', statusCode: 500 };
}
