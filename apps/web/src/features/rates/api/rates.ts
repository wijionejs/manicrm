import { api } from '@/lib/api';
import type { UpsertServiceEmployeeRateDto } from '@manicrm/schemas';

export interface ServiceEmployeeRateResponse {
  id: string;
  serviceId: string;
  workspaceMemberId: string;
  workspaceId: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export function fetchRates(
  workspaceId: string,
  query: { serviceId?: string; workspaceMemberId?: string },
): Promise<ServiceEmployeeRateResponse[]> {
  return api
    .get(`workspaces/${workspaceId}/service-employee-rates`, {
      searchParams: Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined),
      ) as Record<string, string>,
    })
    .json();
}

export function upsertRate(
  workspaceId: string,
  dto: UpsertServiceEmployeeRateDto,
): Promise<ServiceEmployeeRateResponse> {
  return api.put(`workspaces/${workspaceId}/service-employee-rates`, { json: dto }).json();
}

export function deleteRate(
  workspaceId: string,
  rateId: string,
): Promise<ServiceEmployeeRateResponse> {
  return api.delete(`workspaces/${workspaceId}/service-employee-rates/${rateId}`).json();
}
