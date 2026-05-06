/**
 * Registers the same `mutate` function that `useSWR` hooks use under the dashboard
 * tree, so offline optimistic updates write to the correct SWR cache (not a duplicate
 * module instance from a dynamic import).
 */
export type DashboardSWRMutate = (
  key: any,
  data?: any,
  opts?: boolean | { revalidate?: boolean }
) => Promise<any>;

let dashboardMutate: DashboardSWRMutate | null = null;

export function registerDashboardSWRMutate(mutate: DashboardSWRMutate | null) {
  dashboardMutate = mutate;
}

export async function swrMutateForOffline(
  key: any,
  data?: any,
  opts?: boolean | { revalidate?: boolean }
): Promise<any> {
  if (dashboardMutate) {
    return dashboardMutate(key, data, opts);
  }
  const { mutate } = await import("swr");
  return mutate(key, data, opts);
}
