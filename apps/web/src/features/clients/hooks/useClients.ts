import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from '@manicrm/schemas';
import { createClient, deleteClient, fetchClients, updateClient } from '../api/clients';

const clientsBaseKey = (workspaceId: string) => ['clients', workspaceId] as const;

export function useClients(workspaceId: string, query: ListClientsQueryDto) {
  return useQuery({
    queryKey: [...clientsBaseKey(workspaceId), query],
    queryFn: () => fetchClients(workspaceId, query),
  });
}

export function useCreateClient(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientDto) => createClient(workspaceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsBaseKey(workspaceId) });
    },
  });
}

export function useUpdateClient(workspaceId: string, clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateClientDto) => updateClient(workspaceId, clientId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsBaseKey(workspaceId) });
    },
  });
}

export function useDeleteClient(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => deleteClient(workspaceId, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsBaseKey(workspaceId) });
    },
  });
}
