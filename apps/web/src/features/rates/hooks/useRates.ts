import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpsertServiceEmployeeRateDto } from '@manicrm/schemas';
import { deleteRate, fetchRates, upsertRate } from '../api/rates';

const ratesBaseKey = (workspaceId: string) => ['rates', workspaceId] as const;

export function useRates(workspaceId: string, query: { workspaceMemberId?: string }) {
  return useQuery({
    queryKey: [...ratesBaseKey(workspaceId), query],
    queryFn: () => fetchRates(workspaceId, query),
    enabled: !!query.workspaceMemberId,
  });
}

export function useUpsertRate(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertServiceEmployeeRateDto) => upsertRate(workspaceId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ratesBaseKey(workspaceId) }),
  });
}

export function useDeleteRate(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rateId: string) => deleteRate(workspaceId, rateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ratesBaseKey(workspaceId) }),
  });
}
