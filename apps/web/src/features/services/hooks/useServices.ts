import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto } from '@manicrm/schemas';
import { createService, deleteService, fetchServices, updateService } from '../api/services';

const servicesBaseKey = (workspaceId: string) => ['services', workspaceId] as const;

export function useServices(workspaceId: string, query: ListServicesQueryDto) {
  return useQuery({
    queryKey: [...servicesBaseKey(workspaceId), query],
    queryFn: () => fetchServices(workspaceId, query),
  });
}

export function useCreateService(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateServiceDto) => createService(workspaceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesBaseKey(workspaceId) });
    },
  });
}

export function useUpdateService(workspaceId: string, serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateServiceDto) => updateService(workspaceId, serviceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesBaseKey(workspaceId) });
    },
  });
}

export function useDeleteService(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => deleteService(workspaceId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesBaseKey(workspaceId) });
    },
  });
}
