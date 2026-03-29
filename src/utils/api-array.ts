/** Normalize list endpoints that return { data }, { data: { data } }, or a bare array. */
export function arrayFromApiResponse(res: unknown): Record<string, unknown>[] {
  if (!res) return [];
  const r = res as { data?: unknown };
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
  const nested = r.data as { data?: unknown[] } | undefined;
  if (Array.isArray(nested?.data)) return nested.data as Record<string, unknown>[];
  if (Array.isArray(res)) return res as Record<string, unknown>[];
  return [];
}
