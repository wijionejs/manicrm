import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInviteDto, UpdateMemberRoleDto } from '@manicrm/schemas';
import {
  acceptInvite,
  createInvite,
  fetchInviteInfo,
  fetchInvites,
  fetchMembers,
  removeMember,
  updateMemberRole,
} from '../api/members';

const membersKey = (workspaceId: string) => ['members', workspaceId] as const;
const invitesKey = (workspaceId: string) => ['invites', workspaceId] as const;

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: membersKey(workspaceId),
    queryFn: () => fetchMembers(workspaceId),
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, dto }: { memberId: string; dto: UpdateMemberRoleDto }) =>
      updateMemberRole(workspaceId, memberId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) }),
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey(workspaceId) }),
  });
}

export function useInvites(workspaceId: string) {
  return useQuery({
    queryKey: invitesKey(workspaceId),
    queryFn: () => fetchInvites(workspaceId),
  });
}

export function useCreateInvite(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInviteDto) => createInvite(workspaceId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invitesKey(workspaceId) }),
  });
}

export function useInviteInfo(token: string) {
  return useQuery({
    queryKey: ['inviteInfo', token],
    queryFn: () => fetchInviteInfo(token),
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (token: string) => acceptInvite(token),
  });
}
