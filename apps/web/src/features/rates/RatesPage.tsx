import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, X } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useServices } from '@/features/services/hooks/useServices';
import { useRates, useUpsertRate, useDeleteRate } from './hooks/useRates';
import type { ServiceEmployeeRateResponse } from './api/rates';
import type { ServiceResponse } from '@/features/services/api/services';
import { getApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export function RatesPage() {
  const { t } = useTranslation('rates');
  const { workspace } = useWorkspace();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data: members, isPending: membersPending } = useMembers(workspace.id);
  const { data: servicesData, isPending: servicesPending } = useServices(workspace.id, {
    page: 1,
    limit: 100,
  });

  const activeServices = (servicesData?.data ?? []).filter((s) => s.isActive);

  const { data: rates, isPending: ratesPending } = useRates(workspace.id, {
    workspaceMemberId: selectedMemberId ?? undefined,
  });

  const rateByServiceId = Object.fromEntries((rates ?? []).map((r) => [r.serviceId, r]));

  const selectedMember = (members ?? []).find((m) => m.id === selectedMemberId);

  const isLoading = membersPending || servicesPending;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold">{t('title')}</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          <span className="animate-pulse">...</span>
        </div>
      ) : (
        <>
          {/* Member selector */}
          {!members?.length ? (
            <EmptyMembers />
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
              {members.map((member) => {
                const initials = member.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const isSelected = member.id === selectedMemberId;

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors shrink-0',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent',
                    )}
                  >
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name}
                        className="size-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={cn(
                          'size-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0',
                          isSelected
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <span className="whitespace-nowrap">{member.user.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Rates panel */}
          {!selectedMemberId ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
              <Banknote className="size-10" />
              <p className="text-sm">{t('select_member_hint')}</p>
            </div>
          ) : !activeServices.length ? (
            <EmptyServices />
          ) : (
            <div className="rounded-lg border bg-card" key={selectedMemberId}>
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('rates_for', { name: selectedMember?.user.name ?? '' })}
                </p>
              </div>
              {ratesPending ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  <span className="animate-pulse">...</span>
                </div>
              ) : (
                <div className="divide-y">
                  {activeServices.map((service) => (
                    <RateRow
                      key={service.id}
                      service={service}
                      rate={rateByServiceId[service.id]}
                      workspaceId={workspace.id}
                      workspaceMemberId={selectedMemberId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface RateRowProps {
  service: ServiceResponse;
  rate: ServiceEmployeeRateResponse | undefined;
  workspaceId: string;
  workspaceMemberId: string;
}

function RateRow({ service, rate, workspaceId, workspaceMemberId }: RateRowProps) {
  const { t: tCommon } = useTranslation('common');
  const initialValue = rate ? String(parseFloat(rate.price)) : '';
  const [localValue, setLocalValue] = useState(initialValue);

  const { mutate: upsert, isPending: isUpserting } = useUpsertRate(workspaceId);
  const { mutate: remove, isPending: isDeleting } = useDeleteRate(workspaceId);

  const isPending = isUpserting || isDeleting;

  const handleBlur = () => {
    const num = parseFloat(localValue);
    if (isNaN(num) || num < 0) {
      setLocalValue(initialValue);
      return;
    }
    if (localValue === initialValue) return;

    upsert(
      { serviceId: service.id, workspaceMemberId, price: num },
      {
        onError: async (err) => {
          const { key, metadata } = await getApiError(err);
          toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
          setLocalValue(initialValue);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!rate) return;
    remove(rate.id, {
      onSuccess: () => setLocalValue(''),
      onError: async (err) => {
        const { key, metadata } = await getApiError(err);
        toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      },
    });
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex-1 text-sm font-medium min-w-0 truncate">{service.name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <Input
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="—"
          min={0}
          disabled={isPending}
          className="w-24 text-right h-8 text-sm"
        />
        <span className="text-sm text-muted-foreground w-4">₴</span>
        <div className="w-6 flex items-center justify-center">
          {rate ? (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
              aria-label="Remove rate"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyMembers() {
  const { t } = useTranslation('rates');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
      <Banknote className="size-10" />
      <p className="text-sm">{t('empty_members')}</p>
    </div>
  );
}

function EmptyServices() {
  const { t } = useTranslation('rates');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
      <Banknote className="size-10" />
      <p className="text-sm">{t('empty_services')}</p>
    </div>
  );
}
