import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateWorkspaceDto } from '@manicrm/schemas';
import { createWorkspace, fetchWorkspaces } from '../api/workspaces';

export const workspacesQueryKey = ['workspaces'] as const;

export function useWorkspaces() {
  return useQuery({
    queryKey: workspacesQueryKey,
    queryFn: fetchWorkspaces,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWorkspaceDto) => createWorkspace(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspacesQueryKey });
    },
  });
}
