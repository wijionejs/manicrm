import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiError } from '@/lib/api-error';
import { useRemoveMember } from './hooks/useMembers';
import type { MemberResponse } from './api/members';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  workspaceId: string;
  member: MemberResponse | null;
  onClose: () => void;
}

export function RemoveMemberDialog({ workspaceId, member, onClose }: Props) {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  const { mutate, isPending } = useRemoveMember(workspaceId);

  const handleRemove = () => {
    if (!member) return;
    mutate(member.id, {
      onSuccess: () => {
        toast.success(t('remove_success'));
        onClose();
      },
      onError: async (err) => {
        const { key, metadata } = await getApiError(err);
        toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      },
    });
  };

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('remove_confirm_title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t('remove_confirm_description', { name: member?.user.name ?? '' })}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
            {isPending ? t('removing') : tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
