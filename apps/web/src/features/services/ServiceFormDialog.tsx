import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceDto,
  type UpdateServiceDto,
} from '@manicrm/schemas';
import { getApiError } from '@/lib/api-error';
import { te } from '@/lib/zod-error';
import { useCreateService, useUpdateService } from './hooks/useServices';
import type { ServiceResponse } from './api/services';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceResponse;
}

export function ServiceFormDialog({ workspaceId, open, onOpenChange, service }: Props) {
  const { t } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const isEdit = !!service;

  const { mutate: create, isPending: isCreating } = useCreateService(workspaceId);
  const { mutate: update, isPending: isUpdating } = useUpdateService(
    workspaceId,
    service?.id ?? '',
  );
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateServiceDto | UpdateServiceDto>({
    resolver: zodResolver(isEdit ? updateServiceSchema : createServiceSchema),
  });

  useEffect(() => {
    if (open) {
      if (service) {
        reset({
          name: service.name,
          description: service.description,
          baseDurationMinutes: service.baseDurationMinutes,
          isActive: service.isActive,
        });
      } else {
        reset({ name: '', description: '', baseDurationMinutes: 60 });
      }
    }
  }, [open, service, reset]);

  const close = () => {
    if (!isPending) onOpenChange(false);
  };

  const onSubmit = (dto: CreateServiceDto | UpdateServiceDto) => {
    const mutate = isEdit ? update : create;
    (mutate as (dto: CreateServiceDto | UpdateServiceDto, opts: object) => void)(dto, {
      onSuccess: () => {
        toast.success(t(isEdit ? 'update_success' : 'create_success'));
        onOpenChange(false);
      },
      onError: async (err: unknown) => {
        const { key, metadata } = await getApiError(err);
        toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'edit_service' : 'create_service')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('fields.name')}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{te(tCommon, errors.name.message)}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              placeholder={t('fields.description_placeholder')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{te(tCommon, errors.description.message)}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="baseDurationMinutes">{t('fields.base_duration')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="baseDurationMinutes"
                type="number"
                min={5}
                className="w-20"
                {...register('baseDurationMinutes', { valueAsNumber: true })}
              />
              <span className="text-sm text-muted-foreground">{t('fields.minutes')}</span>
            </div>
            {errors.baseDurationMinutes && (
              <p className="text-xs text-destructive">
                {te(tCommon, errors.baseDurationMinutes.message)}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isActive"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('fields.is_active')}
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={isPending}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t(isEdit ? 'saving' : 'creating') : tCommon(isEdit ? 'save' : 'create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
