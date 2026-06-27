import { createContext, useContext } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';
import { useWorkspaces } from './hooks/useWorkspaces';
import type { WorkspaceResponse } from './api/workspaces';
import { LoadingScreen } from '@/components/LoadingScreen';

export type Workspace = WorkspaceResponse;

interface WorkspaceContextValue {
  workspace: Workspace;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider() {
  const { slug } = useParams<{ slug: string }>();
  const { data: workspaces, isPending } = useWorkspaces();

  if (isPending) return <LoadingScreen />;

  if (!workspaces?.length) {
    return <Navigate to="/" replace />;
  }

  const workspace = workspaces.find((w) => w.slug === slug);

  if (!workspace) {
    return <Navigate to={`/w/${workspaces[0].slug}/dashboard`} replace />;
  }

  return (
    <WorkspaceContext value={{ workspace, workspaces }}>
      <Outlet />
    </WorkspaceContext>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
