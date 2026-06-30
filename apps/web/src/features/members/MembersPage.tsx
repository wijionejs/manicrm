import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { UserPlus, MoreHorizontal, Pencil, Trash2, Users2, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { cn } from '@/lib/utils';
import { useMembers, useInvites, useCancelInvite } from './hooks/useMembers';
import type { MemberResponse, InviteResponse } from './api/members';
import { InviteDialog } from './InviteDialog';
import { UpdateRoleDialog } from './UpdateRoleDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_CLASSES = {
  owner: 'bg-amber-100 text-amber-800',
  admin: 'bg-blue-100 text-blue-800',
  employee: 'bg-gray-100 text-gray-700',
} as const;

function RoleBadge({ role }: { role: MemberResponse['role'] }) {
  const { t } = useTranslation('members');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        ROLE_CLASSES[role],
      )}
    >
      {t(`roles.${role}`)}
    </span>
  );
}

function MemberAvatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return <img src={image} alt={name} className="size-8 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="size-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-semibold text-sidebar-primary shrink-0">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function InviteCopyButton({ token, className }: { token: string; className?: string }) {
  const { t } = useTranslation('members');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/app/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(t('invite_link_copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className={cn('gap-1.5', className)}>
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {t('copy_link')}
    </Button>
  );
}

function InviteCancelButton({
  workspaceId,
  inviteId,
  className,
}: {
  workspaceId: string;
  inviteId: string;
  className?: string;
}) {
  const { t } = useTranslation('members');
  const { mutate, isPending } = useCancelInvite(workspaceId);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('gap-1.5 text-destructive hover:text-destructive', className)}
      disabled={isPending}
      onClick={() => mutate(inviteId)}
    >
      <X className="size-3.5" />
      {t('cancel_invite')}
    </Button>
  );
}

export function MembersPage() {
  const { t } = useTranslation('members');
  const { workspace } = useWorkspace();

  const isManager = workspace.role === 'owner' || workspace.role === 'admin';
  const isOwner = workspace.role === 'owner';

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editMember, setEditMember] = useState<MemberResponse | null>(null);
  const [removeMember, setRemoveMember] = useState<MemberResponse | null>(null);

  const { data: members, isPending: membersPending } = useMembers(workspace.id);
  const { data: invites } = useInvites(workspace.id);

  const pendingInvites = invites?.filter((i) => i.status === 'pending') ?? [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        {isManager && (
          <Button onClick={() => setInviteOpen(true)} size="sm">
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">{t('invite_member')}</span>
          </Button>
        )}
      </div>

      {/* Members list */}
      {membersPending ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          <span className="animate-pulse">...</span>
        </div>
      ) : !members?.length ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Users2 className="size-12 text-muted-foreground" />
          <div>
            <p className="font-medium">{t('empty_title')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('empty_subtitle')}</p>
          </div>
          {isManager && (
            <Button onClick={() => setInviteOpen(true)} size="sm">
              <UserPlus className="size-4" />
              {t('invite_member')}
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.member')}</TableHead>
                  <TableHead>{t('table.role')}</TableHead>
                  <TableHead>{t('table.joined')}</TableHead>
                  {isManager && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={member.user.name} image={member.user.image} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{member.user.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {member.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={member.role} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(member.createdAt), 'dd.MM.yyyy')}
                    </TableCell>
                    {isManager && (
                      <TableCell>
                        {member.role !== 'owner' && (
                          <MemberActionsMenu
                            isOwner={isOwner}
                            onEdit={() => setEditMember(member)}
                            onRemove={() => setRemoveMember(member)}
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-lg border bg-card p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MemberAvatar name={member.user.name} image={member.user.image} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{member.user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {member.user.email}
                    </span>
                    <div className="mt-1">
                      <RoleBadge role={member.role} />
                    </div>
                  </div>
                </div>
                {isManager && member.role !== 'owner' && (
                  <MemberActionsMenu
                    isOwner={isOwner}
                    onEdit={() => setEditMember(member)}
                    onRemove={() => setRemoveMember(member)}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pending Invites */}
      {isManager && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{t('invites_title')}</h2>
          {pendingInvites.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('no_invites')}</p>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.email')}</TableHead>
                      <TableHead>{t('table.role')}</TableHead>
                      <TableHead>{t('table.expires')}</TableHead>
                      <TableHead className="w-52" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((invite) => (
                      <InviteRow key={invite.id} invite={invite} workspaceId={workspace.id} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-3 md:hidden">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-lg border bg-card p-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{invite.email}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <RoleBadge role={invite.role} />
                        <span className="text-xs text-muted-foreground">
                          {t('invite_expires', {
                            date: format(new Date(invite.expiresAt), 'dd.MM.yyyy'),
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InviteCopyButton token={invite.token} className="w-full justify-center" />
                      <InviteCancelButton
                        workspaceId={workspace.id}
                        inviteId={invite.id}
                        className="w-full justify-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <InviteDialog workspaceId={workspace.id} open={inviteOpen} onOpenChange={setInviteOpen} />
      <UpdateRoleDialog
        workspaceId={workspace.id}
        member={editMember}
        onClose={() => setEditMember(null)}
      />
      <RemoveMemberDialog
        workspaceId={workspace.id}
        member={removeMember}
        onClose={() => setRemoveMember(null)}
      />
    </div>
  );
}

function InviteRow({ invite, workspaceId }: { invite: InviteResponse; workspaceId: string }) {
  return (
    <TableRow>
      <TableCell className="text-sm">{invite.email}</TableCell>
      <TableCell>
        <RoleBadge role={invite.role} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {format(new Date(invite.expiresAt), 'dd.MM.yyyy')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <InviteCopyButton token={invite.token} />
          <InviteCancelButton workspaceId={workspaceId} inviteId={invite.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function MemberActionsMenu({
  isOwner,
  onEdit,
  onRemove,
}: {
  isOwner: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isOwner && (
          <DropdownMenuItem onSelect={onEdit} className="gap-2">
            <Pencil className="size-4" />
            {t('change_role')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={onRemove}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          {tCommon('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
