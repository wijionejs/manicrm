import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={uk}
      showOutsideDays={showOutsideDays}
      // className is applied to root alongside classNames.root
      className={cn('p-3', className)}
      classNames={{
        // root is 'relative p-3' after merge with className above
        root: 'relative',

        // Nav is a sibling of months (outside month_caption) in v10.
        // Position it absolutely within the relative root, aligned with p-3 padding.
        nav: 'absolute left-3 right-3 top-3 z-10 flex items-center justify-between pointer-events-none',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),

        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-4',

        // h-9 matches the nav button height so they overlap cleanly.
        month_caption: 'flex h-9 items-center justify-center',

        // dropdown_root: each select wraps a visible caption_label + invisible select overlay.
        // The Dropdown component renders: <span.dropdown_root><select.dropdown /><span.caption_label /></span>
        dropdowns: 'flex items-center gap-1',
        dropdown_root: 'relative',
        // Invisible overlay — clicking the caption_label area opens the native select.
        dropdown: 'absolute inset-0 h-full w-full cursor-pointer opacity-0',
        // Visible styled label showing current month/year + down chevron.
        caption_label:
          'inline-flex cursor-pointer select-none items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors',
        chevron: 'size-3.5',

        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-8 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground',
        weeks: '',
        week: 'mt-2 flex w-full',

        // Day is the <td>; modifier classes (selected, today…) are applied here.
        // Use group so day_button can react to parent state via group-[.cls]:
        day: 'group relative p-0 text-center text-sm',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal',
          'group-[.selected]:bg-primary group-[.selected]:text-primary-foreground group-[.selected]:hover:bg-primary/90 group-[.selected]:hover:text-primary-foreground',
          'group-[.today]:bg-accent group-[.today]:text-accent-foreground',
          'group-[.outside]:text-muted-foreground group-[.outside]:opacity-30',
          'group-[.disabled]:opacity-50 group-[.disabled]:pointer-events-none',
        ),

        // Modifier classes applied to the day <td>
        selected: 'selected',
        today: 'today',
        outside: 'outside',
        disabled: 'disabled',
        focused: '',
        hidden: 'invisible',
        range_start: 'range_start',
        range_end: 'range_end',
        range_middle: 'range_middle',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="h-4 w-4" />;
          if (orientation === 'down') return <ChevronDown className="h-3 w-3" />;
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
