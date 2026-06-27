import { HTTPError } from 'ky';

export interface ApiErrorData {
  key: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
}

export async function getApiError(err: unknown): Promise<ApiErrorData> {
  if (err instanceof HTTPError) {
    try {
      const body = (await err.response.json()) as ApiErrorData;
      if (typeof body.key === 'string') return body;
    } catch {
      return { key: 'INTERNAL_SERVER_ERROR', statusCode: 500 };
    }
  }
  return { key: 'INTERNAL_SERVER_ERROR', statusCode: 500 };
}
