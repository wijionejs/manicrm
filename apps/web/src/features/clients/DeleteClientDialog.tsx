import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiError } from '@/lib/api-error';
import { useDeleteClient } from './hooks/useClients';
import type { ClientResponse } from './api/clients';
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
  client: ClientResponse | null;
  onClose: () => void;
}

export function DeleteClientDialog({ workspaceId, client, onClose }: Props) {
  const { t } = useTranslation('clients');
  const { t: tCommon } = useTranslation('common');
  const { mutate, isPending } = useDeleteClient(workspaceId);

  const fullName = client ? `${client.firstName} ${client.lastName}` : '';

  const handleDelete = () => {
    if (!client) return;
    mutate(client.id, {
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
    <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete_confirm_title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t('delete_confirm_description', { name: fullName })}
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
