"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIME_OPTIONS_24H,
  parseToHHmm24,
  snapToTimeSlot,
} from "@/utils/time-options";

const NONE = "__time_none__";

export function TimeSelect24h({
  value,
  onValueChange,
  placeholder = "Select time",
  className,
  optional = false,
  contentClassName,
}: {
  value: string;
  onValueChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  optional?: boolean;
  contentClassName?: string;
}) {
  const trimmed = (value ?? "").trim();
  const parsed = trimmed ? parseToHHmm24(trimmed) : "";
  const coerced = parsed ? snapToTimeSlot(parsed, TIME_OPTIONS_24H) : "";
  const selectValue =
    optional && !coerced ? NONE : coerced ? coerced : undefined;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => {
        if (v === NONE) onValueChange("");
        else onValueChange(v);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={`max-h-[280px] ${contentClassName ?? ""}`}>
        {optional && (
          <SelectItem value={NONE} className="hover:bg-gray-200">
            —
          </SelectItem>
        )}
        {TIME_OPTIONS_24H.map((t) => (
          <SelectItem key={t} value={t} className="hover:bg-gray-200">
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
