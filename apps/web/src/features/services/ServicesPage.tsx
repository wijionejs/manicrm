import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Pencil, Plus, Scissors, Search, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { useServices } from './hooks/useServices';
import type { ServiceResponse } from './api/services';
import { ServiceFormDialog } from './ServiceFormDialog';
import { DeleteServiceDialog } from './DeleteServiceDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export function ServicesPage() {
  const { t } = useTranslation('services');
  const { workspace } = useWorkspace();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceResponse | undefined>();
  const [deleteService, setDeleteService] = useState<ServiceResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isPending } = useServices(workspace.id, {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const services = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openCreate = () => {
    setEditService(undefined);
    setFormOpen(true);
  };

  const openEdit = (service: ServiceResponse) => {
    setEditService(service);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t('add_service')}</span>
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
      ) : services.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.description')}</TableHead>
                  <TableHead className="w-36 whitespace-nowrap">{t('table.duration')}</TableHead>
                  <TableHead className="w-28">{t('table.status')}</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      <span className="line-clamp-2">{service.description}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t('duration_min', { count: service.baseDurationMinutes })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.isActive ? 'default' : 'secondary'}>
                        {t(service.isActive ? 'status.active' : 'status.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ServiceActionsMenu
                        onEdit={() => openEdit(service)}
                        onDelete={() => setDeleteService(service)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-lg border bg-card p-4 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{service.name}</span>
                    <Badge variant={service.isActive ? 'default' : 'secondary'} className="text-xs">
                      {t(service.isActive ? 'status.active' : 'status.inactive')}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('duration_min', { count: service.baseDurationMinutes })}
                  </span>
                </div>
                <ServiceActionsMenu
                  onEdit={() => openEdit(service)}
                  onDelete={() => setDeleteService(service)}
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

      <ServiceFormDialog
        workspaceId={workspace.id}
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editService}
      />
      <DeleteServiceDialog
        workspaceId={workspace.id}
        service={deleteService}
        onClose={() => setDeleteService(null)}
      />
    </div>
  );
}

function ServiceActionsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
  const { t } = useTranslation('services');
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Scissors className="size-12 text-muted-foreground" />
      <div>
        <p className="font-medium">{t('empty_title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('empty_subtitle')}</p>
      </div>
      <Button onClick={onAdd} size="sm">
        <Plus className="size-4" />
        {t('add_service')}
      </Button>
    </div>
  );
}
