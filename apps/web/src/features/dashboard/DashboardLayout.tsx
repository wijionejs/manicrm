import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Settings,
  LogOut,
  UserCog,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { WorkspaceSwitcher } from '@/features/workspace/WorkspaceSwitcher';

const NAV_ITEMS = [
  { path: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true },
  { path: 'bookings', icon: CalendarDays, labelKey: 'nav.bookings', end: false },
  { path: 'clients', icon: Users, labelKey: 'nav.clients', end: false },
  { path: 'members', icon: UserCog, labelKey: 'nav.members', end: false },
  { path: 'services', icon: Scissors, labelKey: 'nav.services', end: false },
  { path: 'settings', icon: Settings, labelKey: 'nav.settings', end: false },
] as const;

function NavItems({ slug, orientation }: { slug: string; orientation: 'vertical' | 'horizontal' }) {
  const { t } = useTranslation('common');

  if (orientation === 'horizontal') {
    return (
      <>
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey, end }) => (
          <NavLink
            key={path}
            to={`/w/${slug}/${path}`}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-1.5 min-w-0 flex-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-sidebar-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            <span className="truncate w-full text-center">{t(labelKey)}</span>
          </NavLink>
        ))}
      </>
    );
  }

  return (
    <>
      {NAV_ITEMS.map(({ path, icon: Icon, labelKey, end }) => (
        <NavLink
          key={path}
          to={`/w/${slug}/${path}`}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          {t(labelKey)}
        </NavLink>
      ))}
    </>
  );
}

export function DashboardLayout() {
  const { t } = useTranslation('auth');
  const { workspace } = useWorkspace();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/app/login';
        },
      },
    });
  };

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex h-16 items-center px-3 border-b border-sidebar-border shrink-0">
          <WorkspaceSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <NavItems slug={workspace.slug} orientation="vertical" />
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-semibold text-sidebar-primary shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            {t('sign_out')}
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 md:pl-64 min-w-0 flex flex-col">
        {/* Mobile top header */}
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border bg-sidebar px-3">
          <div className="flex-1 min-w-0">
            <WorkspaceSwitcher />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="size-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-semibold text-sidebar-primary shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
              {userInitial}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onSelect={handleSignOut} className="gap-2">
                <LogOut className="size-4" />
                {t('sign_out')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-sidebar border-t border-sidebar-border z-50">
        <div className="flex items-center justify-around h-16">
          <NavItems slug={workspace.slug} orientation="horizontal" />
        </div>
      </nav>
    </div>
  );
}
