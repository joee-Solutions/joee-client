/**
 * Offline queued writes already update SWR + IndexedDB optimistically.
 * Calling bound `mutate()` / `globalMutate(..., { revalidate: true })` afterwards
 * refetches and can overwrite the optimistic list with stale cache or fail the fetch.
 */
export function isOfflineQueuedResponse(res: unknown): boolean {
  if (!res || typeof res !== "object") return false;
  const root = res as { _offline?: boolean; data?: { _offline?: boolean } };
  return root._offline === true || root.data?._offline === true;
}

export function revalidateListAfterMutation(
  res: unknown,
  revalidate: () => void | Promise<unknown>
): void {
  // Never force SWR network revalidation while offline.
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  if (isOfflineQueuedResponse(res)) return;
  void revalidate();
}
