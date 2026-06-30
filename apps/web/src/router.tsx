import { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { Building2, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { LoginPage } from '@/features/auth/LoginPage';
import { WorkspaceProvider } from '@/features/workspace/WorkspaceContext';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ClientsPage } from '@/features/clients/ClientsPage';
import { MembersPage } from '@/features/members/MembersPage';
import { ServicesPage } from '@/features/services/ServicesPage';
import { RatesPage } from '@/features/rates/RatesPage';
import { InviteAcceptPage } from '@/features/auth/InviteAcceptPage';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { CreateWorkspaceDialog } from '@/features/workspace/CreateWorkspaceDialog';
import { Button } from '@/components/ui/button';

function AuthGuard() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session) {
    const path = window.location.pathname;
    if (path !== '/' && path !== '/login') {
      localStorage.setItem('auth_redirect', path);
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function WorkspaceRedirect() {
  const { data: workspaces, isPending } = useWorkspaces();
  const { t } = useTranslation('workspace');
  const { t: tAuth } = useTranslation('auth');
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!isPending && workspaces && workspaces.length > 0) {
      navigate(`/w/${workspaces[0].slug}/dashboard`, { replace: true });
    }
  }, [workspaces, isPending, navigate]);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!isPending && workspaces && workspaces.length > 0) {
    return <Navigate to={`/w/${workspaces[0].slug}/dashboard`} replace />;
  }

  if (!workspaces?.length) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <button
          onClick={() => authClient.signOut().then(() => navigate('/app/login'))}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="size-4" />
          {tAuth('sign_out')}
        </button>

        <Building2 className="size-12 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">{t('no_workspaces_title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('no_workspaces_subtitle')}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>{t('create_title')}</Button>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return null;
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <p className="text-muted-foreground">{title} — coming soon</p>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      element: <AuthGuard />,
      children: [
        { path: '/', element: <WorkspaceRedirect /> },
        { path: '/invite/:token', element: <InviteAcceptPage /> },
        {
          path: '/w/:slug',
          element: <WorkspaceProvider />,
          children: [
            {
              element: <DashboardLayout />,
              children: [
                { path: 'dashboard', element: <DashboardPage /> },
                { path: 'bookings', element: <ComingSoon title="Bookings" /> },
                { path: 'clients', element: <ClientsPage /> },
                { path: 'members', element: <MembersPage /> },
                { path: 'services', element: <ServicesPage /> },
                { path: 'rates', element: <RatesPage /> },
                { path: 'settings', element: <ComingSoon title="Settings" /> },
              ],
            },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
