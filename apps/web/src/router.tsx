import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { authClient } from '@/lib/auth-client';
import { LoginPage } from '@/features/auth/LoginPage';
import { WorkspaceProvider, FIRST_WORKSPACE_SLUG } from '@/features/workspace/WorkspaceContext';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

function AuthGuard() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <p className="text-muted-foreground">{title} — coming soon</p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={`/w/${FIRST_WORKSPACE_SLUG}/dashboard`} replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/w/:slug',
        element: <WorkspaceProvider />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'bookings', element: <ComingSoon title="Bookings" /> },
              { path: 'clients', element: <ComingSoon title="Clients" /> },
              { path: 'services', element: <ComingSoon title="Services" /> },
              { path: 'settings', element: <ComingSoon title="Settings" /> },
            ],
          },
        ],
      },
    ],
  },
]);
