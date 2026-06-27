import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { createWorkspaceSchema, type CreateWorkspaceDto } from '@manicrm/schemas';
import { useCreateWorkspace } from './hooks/useWorkspaces';
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function CreateWorkspaceDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation('workspace');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceDto>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const title = watch('title');

  useEffect(() => {
    if (title !== undefined) {
      setValue('slug', toSlug(title), { shouldValidate: false });
    }
  }, [title, setValue]);

  const close = () => {
    if (!isPending) {
      reset();
      onOpenChange(false);
    }
  };

  const onSubmit = (dto: CreateWorkspaceDto) => {
    mutate(dto, {
      onSuccess: (workspace) => {
        toast.success(t('create_success'));
        reset();
        onOpenChange(false);
        navigate(`/w/${workspace.slug}/dashboard`);
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 409) toast.error(t('errors.slug_taken'));
        else if (status === 403) toast.error(t('errors.limit_reached'));
        else toast.error(t('errors.generic'));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create_title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-title">{t('fields.title')}</Label>
            <Input
              id="ws-title"
              placeholder={t('fields.title_placeholder')}
              {...register('title')}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-slug">{t('fields.slug')}</Label>
            <Input id="ws-slug" placeholder="my-nail-studio" {...register('slug')} />
            {errors.slug ? (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t('fields.slug_hint')}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('creating') : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
