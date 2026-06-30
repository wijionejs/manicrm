import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiError } from '@/lib/api-error';
import { useDeleteService } from './hooks/useServices';
import type { ServiceResponse } from './api/services';
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
  service: ServiceResponse | null;
  onClose: () => void;
}

export function DeleteServiceDialog({ workspaceId, service, onClose }: Props) {
  const { t } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const { mutate, isPending } = useDeleteService(workspaceId);

  const handleDelete = () => {
    if (!service) return;
    mutate(service.id, {
      onSuccess: () => {
        toast.success(t('delete_success'));
        onClose();
      },
      onError: async (err) => {
        const { key, metadata } = await getApiError(err);
        toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      },
    });
  };

  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete_confirm_title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t('delete_confirm_description', { name: service?.name ?? '' })}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t('deleting') : tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
