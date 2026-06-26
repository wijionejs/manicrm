import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from './WorkspaceContext';

export function WorkspaceSwitcher() {
  const { workspace, workspaces } = useWorkspace();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleSelect = (slug: string) => {
    navigate(`/w/${slug}/dashboard`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <Building2 className="size-4 shrink-0 text-sidebar-primary" />
        <span className="flex-1 truncate text-left">{workspace.name}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="start" sideOffset={8}>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          {t('workspace.your_workspaces')}
        </DropdownMenuLabel>

        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onSelect={() => handleSelect(w.slug)} className="gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold shrink-0">
              {w.name[0]}
            </div>
            <span className="flex-1 truncate">{w.name}</span>
            {w.id === workspace.id && <Check className="size-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2 text-muted-foreground" disabled>
          <div className="flex size-6 items-center justify-center rounded-md border border-dashed shrink-0">
            <Plus className="size-3.5" />
          </div>
          {t('workspace.create')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
