import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { authClient } from '@/lib/auth-client';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/auth/DashboardPage';

function ProtectedLayout() {
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

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedLayout />,
    children: [{ path: '/dashboard', element: <DashboardPage /> }],
  },
]);
