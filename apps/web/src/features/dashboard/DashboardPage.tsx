import { useTranslation } from 'react-i18next';
import { CalendarDays, Users, Scissors, TrendingUp } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MOCK_STATS = [
  { icon: CalendarDays, labelKey: 'dashboard.stats.bookings_today', value: '12' },
  { icon: Users, labelKey: 'dashboard.stats.clients', value: '148' },
  { icon: Scissors, labelKey: 'dashboard.stats.services', value: '9' },
  { icon: TrendingUp, labelKey: 'dashboard.stats.revenue_month', value: '₴24 800' },
] as const;

export function DashboardPage() {
  const { t } = useTranslation('common');
  const { data: session } = authClient.useSession();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t('dashboard.greeting', { name: session?.user?.name?.split(' ')[0] })}
        </h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STATS.map(({ icon: Icon, labelKey, value }) => (
          <Card key={labelKey}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(labelKey)}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
