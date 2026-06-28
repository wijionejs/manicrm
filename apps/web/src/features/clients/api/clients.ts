import { api } from '@/lib/api';
import type { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from '@manicrm/schemas';

export interface ClientResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  instagram: string | null;
  telegram: string | null;
  birthday: string | null;
  notes: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsListResponse {
  data: ClientResponse[];
  total: number;
  page: number;
  limit: number;
}

export function fetchClients(
  workspaceId: string,
  query: ListClientsQueryDto,
): Promise<ClientsListResponse> {
  return api
    .get(`workspaces/${workspaceId}/clients`, {
      searchParams: Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined),
      ) as Record<string, string | number>,
    })
    .json();
}

export function createClient(workspaceId: string, dto: CreateClientDto): Promise<ClientResponse> {
  return api.post(`workspaces/${workspaceId}/clients`, { json: dto }).json();
}

export function updateClient(
  workspaceId: string,
  clientId: string,
  dto: UpdateClientDto,
): Promise<ClientResponse> {
  return api.patch(`workspaces/${workspaceId}/clients/${clientId}`, { json: dto }).json();
}

export function deleteClient(workspaceId: string, clientId: string): Promise<ClientResponse> {
  return api.delete(`workspaces/${workspaceId}/clients/${clientId}`).json();
}
