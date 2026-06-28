import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, MoreHorizontal, Pencil, Trash2, Users, Search } from 'lucide-react';
import { format, parse } from 'date-fns';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { useClients } from './hooks/useClients';
import type { ClientResponse } from './api/clients';
import { ClientFormDialog } from './ClientFormDialog';
import { DeleteClientDialog } from './DeleteClientDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const PAGE_SIZE = 15;

function formatBirthday(birthday: string | null) {
  if (!birthday) return null;
  try {
    return format(parse(birthday, 'yyyy-MM-dd', new Date()), 'dd.MM.yyyy');
  } catch {
    return birthday;
  }
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function ContactCell({ client }: { client: ClientResponse }) {
  return (
    <div className="flex flex-col gap-1">
      {client.phoneNumber && <span className="text-sm">{client.phoneNumber}</span>}
      {client.instagram && (
        <span className="inline-flex items-center gap-1 text-sm">
          <InstagramIcon className="size-3.5 text-pink-500 shrink-0" />
          {client.instagram}
        </span>
      )}
      {client.telegram && (
        <span className="inline-flex items-center gap-1 text-sm">
          <TelegramIcon className="size-3.5 text-sky-500 shrink-0" />
          {client.telegram}
        </span>
      )}
      {!client.phoneNumber && !client.instagram && !client.telegram && (
        <span className="text-muted-foreground">—</span>
      )}
    </div>
  );
}

export function ClientsPage() {
  const { t } = useTranslation('clients');
  const { workspace } = useWorkspace();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientResponse | undefined>();
  const [deleteClient, setDeleteClient] = useState<ClientResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isPending } = useClients(workspace.id, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const clients = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openCreate = () => {
    setEditClient(undefined);
    setFormOpen(true);
  };

  const openEdit = (client: ClientResponse) => {
    setEditClient(client);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Button onClick={openCreate} size="sm">
          <UserPlus className="size-4" />
          <span className="hidden sm:inline">{t('add_client')}</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="pl-9"
        />
      </div>

      {/* Content */}
      {isPending ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          <span className="animate-pulse">...</span>
        </div>
      ) : clients.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.contact')}</TableHead>
                  <TableHead>{t('table.birthday')}</TableHead>
                  <TableHead>{t('table.notes')}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.firstName} {client.lastName}
                    </TableCell>
                    <TableCell>
                      <ContactCell client={client} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatBirthday(client.birthday) ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {client.notes ? <span className="line-clamp-2">{client.notes}</span> : '—'}
                    </TableCell>
                    <TableCell>
                      <ClientActionsMenu
                        onEdit={() => openEdit(client)}
                        onDelete={() => setDeleteClient(client)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {clients.map((client) => (
              <div
                key={client.id}
                className="rounded-lg border bg-card p-4 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium text-sm">
                    {client.firstName} {client.lastName}
                  </span>
                  {client.phoneNumber && (
                    <span className="text-xs text-muted-foreground">{client.phoneNumber}</span>
                  )}
                  {client.instagram && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <InstagramIcon className="size-3 text-pink-500 shrink-0" />
                      {client.instagram}
                    </span>
                  )}
                  {client.telegram && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <TelegramIcon className="size-3 text-sky-500 shrink-0" />
                      {client.telegram}
                    </span>
                  )}
                  {client.birthday && (
                    <span className="text-xs text-muted-foreground">
                      {formatBirthday(client.birthday)}
                    </span>
                  )}
                  {client.notes && (
                    <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {client.notes}
                    </span>
                  )}
                </div>
                <ClientActionsMenu
                  onEdit={() => openEdit(client)}
                  onDelete={() => setDeleteClient(client)}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">
                {t('page_info', { current: page, total: totalPages })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ClientFormDialog
        workspaceId={workspace.id}
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editClient}
      />
      <DeleteClientDialog
        workspaceId={workspace.id}
        client={deleteClient}
        onClose={() => setDeleteClient(null)}
      />
    </div>
  );
}

function ClientActionsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const { t: tCommon } = useTranslation('common');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit} className="gap-2">
          <Pencil className="size-4" />
          {tCommon('edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          {tCommon('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation('clients');
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Users className="size-12 text-muted-foreground" />
      <div>
        <p className="font-medium">{t('empty_title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('empty_subtitle')}</p>
      </div>
      <Button onClick={onAdd} size="sm">
        <UserPlus className="size-4" />
        {t('add_client')}
      </Button>
    </div>
  );
}
