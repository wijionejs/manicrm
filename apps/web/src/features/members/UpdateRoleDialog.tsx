import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getApiError } from '@/lib/api-error';
import { useUpdateMemberRole } from './hooks/useMembers';
import type { MemberResponse } from './api/members';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

interface Props {
  workspaceId: string;
  member: MemberResponse | null;
  onClose: () => void;
}

export function UpdateRoleDialog({ workspaceId, member, onClose }: Props) {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');

  const initialRole = member?.role === 'owner' ? 'admin' : (member?.role ?? 'employee');
  const [role, setRole] = useState<'admin' | 'employee'>(initialRole as 'admin' | 'employee');

  const { mutate, isPending } = useUpdateMemberRole(workspaceId);

  const handleSave = () => {
    if (!member) return;
    mutate(
      { memberId: member.id, dto: { role } },
      {
        onSuccess: () => {
          toast.success(t('role_updated'));
          onClose();
        },
        onError: async (err) => {
          const { key, metadata } = await getApiError(err);
          toast.error(tCommon(`errors.${key}`, metadata as Record<string, unknown>));
        },
      },
    );
  };

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('change_role')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="role">{t('fields.role')}</Label>
          <select
            id="role"
            className={SELECT_CLASS}
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'employee')}
            disabled={isPending}
          >
            <option value="employee">{t('roles.employee')}</option>
            <option value="admin">{t('roles.admin')}</option>
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? t('updating') : tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
