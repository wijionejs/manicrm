import { api } from '@/lib/api';
import type { CreateWorkspaceDto } from '@manicrm/schemas';

export interface WorkspaceResponse {
  id: string;
  title: string;
  slug: string;
  userId: string;
  role: 'owner' | 'admin' | 'employee';
  createdAt: string;
  updatedAt: string;
}

export function fetchWorkspaces(): Promise<WorkspaceResponse[]> {
  return api.get('workspaces').json();
}

export function createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceResponse> {
  return api.post('workspaces', { json: dto }).json();
}
