import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Building2, CheckCircle2 } from 'lucide-react';
import { getApiError } from '@/lib/api-error';
import { useAcceptInvite, useInviteInfo } from '@/features/members/hooks/useMembers';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');

  const {
    data: invite,
    isPending: infoLoading,
    isError: infoIsError,
    error: infoError,
  } = useInviteInfo(token!);

  const {
    mutate: accept,
    isPending: accepting,
    isSuccess,
    isError: acceptIsError,
    error: acceptError,
  } = useAcceptInvite();

  const [infoErrorMsg, setInfoErrorMsg] = useState<string | null>(null);
  const [acceptErrorMsg, setAcceptErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (infoIsError && infoError) {
      getApiError(infoError).then(({ key, metadata }) => {
        setInfoErrorMsg(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      });
    }
  }, [infoIsError, infoError, tCommon]);

  useEffect(() => {
    if (acceptIsError && acceptError) {
      getApiError(acceptError).then(({ key, metadata }) => {
        setAcceptErrorMsg(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      });
    }
  }, [acceptIsError, acceptError, tCommon]);

  if (infoLoading) return <LoadingScreen />;

  if (infoIsError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h1 className="text-xl font-semibold">{t('accept.error_title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {infoErrorMsg ?? tCommon('loading')}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/', { replace: true })}>
            {t('accept.go_to_app')}
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <div>
            <h1 className="text-xl font-semibold">{t('accept.success_title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('accept.success_subtitle', { workspace: invite!.workspace.title })}
            </p>
          </div>
          <Button
            onClick={() => navigate(`/w/${invite!.workspace.slug}/dashboard`, { replace: true })}
          >
            {t('accept.open_workspace')}
          </Button>
        </div>
      </div>
    );
  }

  if (acceptIsError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <h1 className="text-xl font-semibold">{t('accept.error_title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {acceptErrorMsg ?? tCommon('loading')}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/', { replace: true })}>
            {t('accept.go_to_app')}
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = invite!.status === 'expired' || new Date(invite!.expiresAt) < new Date();
  const isAlreadyAccepted = invite!.status === 'accepted';
  const canAccept = !isExpired && !isAlreadyAccepted;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-5 text-center shadow-sm">
        <div className="size-14 rounded-full bg-sidebar-primary/10 flex items-center justify-center">
          <Building2 className="size-7 text-sidebar-primary" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {t('accept.title')}
          </p>
          <h1 className="text-xl font-semibold">{invite!.workspace.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('accept.your_role', { role: t(`roles.${invite!.role}`) })}
          </p>
        </div>

        <div className="w-full rounded-lg bg-muted/40 px-4 py-3 space-y-1 text-sm text-left text-muted-foreground">
          <p>{t('accept.invite_sent_to', { email: invite!.email })}</p>
          <p>
            {t('accept.expires', {
              date: new Date(invite!.expiresAt).toLocaleDateString(),
            })}
          </p>
        </div>

        {isAlreadyAccepted && (
          <>
            <p className="text-sm text-muted-foreground">{t('accept.status_accepted')}</p>
            <Button
              className="w-full"
              onClick={() => navigate(`/w/${invite!.workspace.slug}/dashboard`, { replace: true })}
            >
              {t('accept.open_workspace')}
            </Button>
          </>
        )}

        {isExpired && !isAlreadyAccepted && (
          <p className="text-sm text-muted-foreground">{t('accept.status_expired')}</p>
        )}

        {canAccept && (
          <Button className="w-full" onClick={() => accept(token!)} disabled={accepting}>
            {accepting ? t('accept.accepting') : t('accept.accept_button')}
          </Button>
        )}
      </div>
    </div>
  );
}
