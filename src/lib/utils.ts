import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateLocal(date: Date | string | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    date = parseISO(date);
  }
  // Format to 'YYYY-MM-DD' to avoid timezone issues when sending to backend
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISOStringToLocalDate(dateString: string | undefined | null): Date | undefined {
  if (!dateString) return undefined;
  try {
    // Parse ISO string and return Date object
    return parseISO(dateString);
  } catch (error) {
    // If parsing fails, try creating a new Date object
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  }
}

/**
 * Parse stored/API date strings to a Date at **local midnight** for that calendar day.
 * Avoids `new Date("YYYY-MM-DD")` and UTC midnight ISO shifting to the previous local day.
 */
export function parseCalendarDateString(raw: string | undefined | null): Date | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const s = String(raw).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    if (Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)) {
      const dt = new Date(y, mo, d);
      if (!isNaN(dt.getTime())) return dt;
    }
  }
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return undefined;
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}