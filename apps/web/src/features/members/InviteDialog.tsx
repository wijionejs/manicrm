import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import { createInviteSchema, type CreateInviteDto } from '@manicrm/schemas';
import { getApiError } from '@/lib/api-error';
import { te } from '@/lib/zod-error';
import { useCreateInvite } from './hooks/useMembers';
import type { InviteResponse } from './api/members';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

interface Props {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ workspaceId, open, onOpenChange }: Props) {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');

  const [createdInvite, setCreatedInvite] = useState<InviteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, isPending } = useCreateInvite(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInviteDto>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: { role: 'employee' },
  });

  const inviteLink = createdInvite
    ? `${window.location.origin}/app/invite/${createdInvite.token}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success(t('invite_link_copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
      setTimeout(() => {
        reset();
        setCreatedInvite(null);
        setCopied(false);
      }, 200);
    }
  };

  const onSubmit = (dto: CreateInviteDto) => {
    mutate(dto, {
      onSuccess: (invite) => {
        setCreatedInvite(invite);
      },
      onError: async (err) => {
        const { key, metadata } = await getApiError(err);
        toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {createdInvite ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('invite_success')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t('invite_link_hint')}</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
              <code className="flex-1 truncate text-xs">{inviteLink}</code>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>{t('done')}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('invite_member')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('fields.email_placeholder')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{te(tCommon, errors.email.message)}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">{t('fields.role')}</Label>
                <select id="role" className={SELECT_CLASS} {...register('role')}>
                  <option value="employee">{t('roles.employee')}</option>
                  <option value="admin">{t('roles.admin')}</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-destructive">{te(tCommon, errors.role.message)}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? t('sending') : t('create_invite')}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
