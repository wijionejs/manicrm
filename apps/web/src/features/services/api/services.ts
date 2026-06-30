import { api } from '@/lib/api';
import type { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto } from '@manicrm/schemas';

export interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  baseDurationMinutes: number;
  isActive: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicesListResponse {
  data: ServiceResponse[];
  total: number;
  page: number;
  limit: number;
}

export function fetchServices(
  workspaceId: string,
  query: ListServicesQueryDto,
): Promise<ServicesListResponse> {
  return api
    .get(`workspaces/${workspaceId}/services`, {
      searchParams: Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined),
      ) as Record<string, string | number>,
    })
    .json();
}

export function createService(
  workspaceId: string,
  dto: CreateServiceDto,
): Promise<ServiceResponse> {
  return api.post(`workspaces/${workspaceId}/services`, { json: dto }).json();
}

export function updateService(
  workspaceId: string,
  serviceId: string,
  dto: UpdateServiceDto,
): Promise<ServiceResponse> {
  return api.patch(`workspaces/${workspaceId}/services/${serviceId}`, { json: dto }).json();
}

export function deleteService(workspaceId: string, serviceId: string): Promise<ServiceResponse> {
  return api.delete(`workspaces/${workspaceId}/services/${serviceId}`).json();
}
