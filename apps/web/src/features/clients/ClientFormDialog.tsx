import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientDto,
  type UpdateClientDto,
} from '@manicrm/schemas';
import { getApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { useCreateClient, useUpdateClient } from './hooks/useClients';
import type { ClientResponse } from './api/clients';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const INPUT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

interface Props {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientResponse;
}

export function ClientFormDialog({ workspaceId, open, onOpenChange, client }: Props) {
  const { t } = useTranslation('clients');
  const { t: tCommon } = useTranslation('common');
  const isEdit = !!client;

  const { mutate: create, isPending: isCreating } = useCreateClient(workspaceId);
  const { mutate: update, isPending: isUpdating } = useUpdateClient(workspaceId, client?.id ?? '');
  const isPending = isCreating || isUpdating;

  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateClientDto | UpdateClientDto>({
    resolver: zodResolver(isEdit ? updateClientSchema : createClientSchema),
  });

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber ?? undefined,
          instagram: client.instagram ?? undefined,
          telegram: client.telegram ?? undefined,
          birthday: client.birthday ?? undefined,
          notes: client.notes ?? undefined,
        });
      } else {
        reset();
      }
    }
  }, [open, client, reset]);

  const birthdayValue = watch('birthday');
  const selectedDate = birthdayValue ? parse(birthdayValue, 'yyyy-MM-dd', new Date()) : undefined;

  const close = () => {
    if (!isPending) onOpenChange(false);
  };

  const onSubmit = (dto: CreateClientDto | UpdateClientDto) => {
    const mutate = isEdit ? update : create;
    (mutate as (dto: CreateClientDto | UpdateClientDto, opts: object) => void)(dto, {
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'edit_client' : 'create_client')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t('fields.first_name')}</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t('fields.last_name')}</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">{t('fields.phone')}</Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <IMaskInput
                  id="phoneNumber"
                  mask="+38 (000) 000-00-00"
                  value={field.value ?? ''}
                  onAccept={(val: string) => {
                    const digits = val.replace(/\D/g, '');
                    field.onChange(digits.length > 2 ? val : undefined);
                  }}
                  onBlur={field.onBlur}
                  placeholder="+38 (0__) ___-__-__"
                  className={INPUT_CLASS}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="instagram">{t('fields.instagram')}</Label>
              <Input id="instagram" placeholder="@handle" {...register('instagram')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telegram">{t('fields.telegram')}</Label>
              <Input id="telegram" placeholder="@handle" {...register('telegram')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('fields.birthday')}</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !birthdayValue && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {selectedDate
                    ? format(selectedDate, 'dd.MM.yyyy')
                    : t('fields.birthday_placeholder')}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setValue('birthday', date ? format(date, 'yyyy-MM-dd') : undefined, {
                      shouldValidate: true,
                    });
                    setCalendarOpen(false);
                  }}
                  captionLayout="dropdown"
                  startMonth={new Date(1920, 0)}
                  endMonth={new Date()}
                  defaultMonth={selectedDate ?? new Date(1990, 0)}
                />
              </PopoverContent>
            </Popover>
            {birthdayValue && (
              <button
                type="button"
                onClick={() => setValue('birthday', undefined)}
                className="text-xs text-muted-foreground underline"
              >
                {tCommon('delete')}
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('fields.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('fields.notes_placeholder')}
              {...register('notes')}
            />
          </div>

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
