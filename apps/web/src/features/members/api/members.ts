import { api } from '@/lib/api';
import type { CreateInviteDto, UpdateMemberRoleDto } from '@manicrm/schemas';

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface MemberResponse {
  id: string;
  role: 'owner' | 'admin' | 'employee';
  createdAt: string;
  user: MemberUser;
}

export interface InviteResponse {
  id: string;
  workspaceId: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export function fetchMembers(workspaceId: string): Promise<MemberResponse[]> {
  return api.get(`workspaces/${workspaceId}/members`).json();
}

export function updateMemberRole(
  workspaceId: string,
  memberId: string,
  dto: UpdateMemberRoleDto,
): Promise<MemberResponse> {
  return api.patch(`workspaces/${workspaceId}/members/${memberId}`, { json: dto }).json();
}

export async function removeMember(workspaceId: string, memberId: string): Promise<void> {
  await api.delete(`workspaces/${workspaceId}/members/${memberId}`);
}

export function createInvite(workspaceId: string, dto: CreateInviteDto): Promise<InviteResponse> {
  return api.post(`workspaces/${workspaceId}/invites`, { json: dto }).json();
}

export function fetchInvites(workspaceId: string): Promise<InviteResponse[]> {
  return api.get(`workspaces/${workspaceId}/invites`).json();
}

export async function cancelInvite(workspaceId: string, inviteId: string): Promise<void> {
  await api.delete(`workspaces/${workspaceId}/invites/${inviteId}`);
}

export interface InviteInfoResponse {
  email: string;
  role: 'admin' | 'employee';
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  workspace: { title: string; slug: string };
}

export function fetchInviteInfo(token: string): Promise<InviteInfoResponse> {
  return api.get(`invites/${token}`).json();
}

export async function acceptInvite(token: string): Promise<void> {
  await api.post(`invites/${token}/accept`);
}
