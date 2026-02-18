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