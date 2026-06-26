import { createContext, useContext } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';

export interface Workspace {
  id: string;
  slug: string;
  name: string;
}

// Replace with API call once the backend is ready
const MOCK_WORKSPACES: Workspace[] = [
  { id: '1', slug: 'nail-studio-kyiv', name: 'Nail Studio Kyiv' },
  { id: '2', slug: 'odesa-branch', name: 'Odesa Branch' },
];

export const FIRST_WORKSPACE_SLUG = MOCK_WORKSPACES[0].slug;

interface WorkspaceContextValue {
  workspace: Workspace;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider() {
  const { slug } = useParams<{ slug: string }>();
  const workspace = MOCK_WORKSPACES.find((w) => w.slug === slug);

  if (!workspace) {
    return <Navigate to={`/w/${FIRST_WORKSPACE_SLUG}/dashboard`} replace />;
  }

  return (
    <WorkspaceContext value={{ workspace, workspaces: MOCK_WORKSPACES }}>
      <Outlet />
    </WorkspaceContext>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
