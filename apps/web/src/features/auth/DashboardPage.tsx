import { useTranslation } from 'react-i18next';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  const { t } = useTranslation('auth');
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login';
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">{session?.user?.name ?? 'Dashboard'}</h1>
      <p className="text-muted-foreground">{session?.user?.email}</p>
      <Button variant="outline" onClick={handleSignOut}>
        {t('sign_out')}
      </Button>
    </div>
  );
}
