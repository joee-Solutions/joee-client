"use client";

import * as React from "react";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !isNaN(d.getTime());
}

const brandSelectedClassName =
  "[&>button]:!bg-[#003465] [&>button]:!text-white [&>button]:hover:!bg-[#0a4d7d] [&>button]:hover:!text-white [&>button]:shadow-sm";
const brandTodayClassName =
  "[&>button]:bg-sky-50 [&>button]:!text-[#003465] [&>button]:font-semibold [&>button]:ring-2 [&>button]:ring-[#003465]/20";

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Shown in the popover header (e.g. "Date of birth"). */
  popoverTitle?: string;
  /** When true, dates after today cannot be selected (typical for DOB). */
  disableFuture?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  popoverTitle = "Select date",
  disableFuture = false,
}: DatePickerProps) {
  const safeDate = date != null && isValidDate(date) ? date : undefined;
  const [open, setOpen] = React.useState(false);

  const disabledMatcher = React.useMemo(() => {
    if (!disableFuture) return undefined;
    const end = startOfDay(new Date());
    return (d: Date) => startOfDay(d) > end;
  }, [disableFuture]);

  const handleSelect = (next: Date | undefined) => {
    if (next) {
      onDateChange?.(next);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "group h-[60px] w-full justify-start gap-3 rounded-xl border border-[#d1d9e6] bg-gradient-to-b from-[#f8fafc] to-white px-4 text-left font-normal shadow-[0_1px_2px_rgba(0,52,101,0.06)] transition-all duration-200",
            "hover:border-[#003465]/40 hover:shadow-[0_6px_20px_rgba(0,52,101,0.12)]",
            "focus-visible:ring-2 focus-visible:ring-[#003465]/35 focus-visible:ring-offset-2",
            !safeDate && "text-[#737373]",
            safeDate && "text-[#111827]",
            className
          )}
          disabled={disabled}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003465]/10 text-[#003465] transition-colors group-hover:bg-[#003465]/16">
            <CalendarIcon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {safeDate ? format(safeDate, "EEE, d MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-0 shadow-2xl shadow-slate-400/25 z-[10000]"
        align="start"
        sideOffset={8}
      >
        <div className="border-b border-white/10 bg-gradient-to-br from-[#003465] via-[#054a7a] to-[#0a5c8f] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {popoverTitle}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-white">
            {safeDate ? format(safeDate, "MMMM d, yyyy") : "Choose a day"}
          </p>
        </div>
        <div className="bg-gradient-to-b from-slate-50/90 to-white p-2">
          <Calendar
            mode="single"
            selected={safeDate}
            onSelect={handleSelect}
            disabled={disabledMatcher}
            defaultMonth={safeDate ?? new Date()}
            className="rounded-xl border border-slate-100/80 bg-white shadow-inner"
            selectedClassName={brandSelectedClassName}
            todayClassName={brandTodayClassName}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
