import { offlineDB } from "@/lib/offline-db";

const EMPLOYEE_EMAIL_CONFLICT_KEY = "joee:employee-email-conflict";

/** Persist so Employees page can purge/filter after navigation (no race with mount load). */
export function storePendingEmployeeEmailConflict(email: string): void {
  if (typeof window === "undefined") return;
  const e = String(email || "").trim().toLowerCase();
  if (!e) return;
  try {
    sessionStorage.setItem(EMPLOYEE_EMAIL_CONFLICT_KEY, e);
  } catch {
    /* ignore */
  }
}

/** Read once (e.g. Employees page mount). */
export function peekPendingEmployeeEmailConflict(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EMPLOYEE_EMAIL_CONFLICT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(EMPLOYEE_EMAIL_CONFLICT_KEY);
    return String(raw).trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

/** True for optimistic / not-yet-synced employee rows shown while offline. */
export function isPendingOfflineEmployeeRow(emp: unknown): boolean {
  const e = emp as Record<string, unknown> | null | undefined;
  return Boolean(
    e?._pending ||
    e?._offline === true ||
    String(e?.id ?? "").startsWith("offline-")
  );
}

function rowEmail(emp: any): string {
  return String(emp?.email || emp?.email_address || "").trim().toLowerCase();
}

/**
 * Remove pending offline-created employees matching this email from the joee-offline employees cache (all tenant scopes).
 */
export async function purgePendingEmployeesByEmailFromCache(email: string): Promise<void> {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return;
  try {
    await offlineDB.init();
    const all = await offlineDB.getAllEmployeeCacheRows();
    const byTenant = new Map<string, any[]>();
    for (const row of all) {
      const tid = (row as any)?.tenantId;
      if (tid == null || tid === "") {
        if (isPendingOfflineEmployeeRow(row) && rowEmail(row) === target) {
          const rowId = (row as any)?.id;
          if (rowId != null) await offlineDB.delete("employees", rowId);
        }
        continue;
      }
      const k = String(tid);
      if (!byTenant.has(k)) byTenant.set(k, []);
      byTenant.get(k)!.push(row);
    }
    for (const [tenantId, cached] of byTenant) {
      const remaining = cached.filter((emp: any) => {
        if (!isPendingOfflineEmployeeRow(emp)) return true;
        return rowEmail(emp) !== target;
      });
      await offlineDB.cacheData("employees", remaining, tenantId, "replace");
    }
  } catch {
    /* non-fatal */
  }
}

/** Strip pending rows for this email from an in-memory list (API or cache snapshot). */
export function filterOutPendingEmployeeByEmail<T extends Record<string, unknown>>(
  items: T[],
  email: string
): T[] {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return items;
  return items.filter((emp) => {
    const e = emp as Record<string, unknown>;
    if (!isPendingOfflineEmployeeRow(e)) return true;
    return rowEmail(e) !== target;
  });
}

/** Server-backed ids only (DELETE /tenant/employee/:id). Temp `offline-*` ids are omitted. */
export async function findPendingEmployeeNumericIdsByEmail(email: string): Promise<number[]> {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return [];
  const out = new Set<number>();
  try {
    await offlineDB.init();
    const all = await offlineDB.getAllEmployeeCacheRows();
    for (const emp of all) {
      if (!isPendingOfflineEmployeeRow(emp)) continue;
      if (rowEmail(emp) !== target) continue;
      const id = (emp as any)?.id;
      if (typeof id === "number" && Number.isFinite(id)) out.add(id);
      else if (typeof id === "string" && /^\d+$/.test(id)) out.add(Number(id));
    }
  } catch {
    /* ignore */
  }
  return [...out];
}

/** Drop pending rows when a synced row already has the same email (e.g. after going online). */
export function dedupeEmployeesUsersList<T extends Record<string, unknown>>(users: T[]): T[] {
  const serverEmails = new Set<string>();
  for (const u of users) {
    if (!isPendingOfflineEmployeeRow(u)) {
      const e = rowEmail(u);
      if (e) serverEmails.add(e);
    }
  }
  if (serverEmails.size === 0) return users;
  return users.filter((u) => {
    if (!isPendingOfflineEmployeeRow(u)) return true;
    const e = rowEmail(u);
    return !e || !serverEmails.has(e);
  });
}

/** Remove stale pending employee rows from IndexedDB when server already has that email. */
export async function purgeStalePendingEmployeesFromCache(
  serverUsers: Record<string, unknown>[]
): Promise<void> {
  const serverEmails = new Set<string>();
  for (const u of serverUsers) {
    if (!isPendingOfflineEmployeeRow(u)) {
      const e = rowEmail(u);
      if (e) serverEmails.add(e);
    }
  }
  if (serverEmails.size === 0) return;
  try {
    await offlineDB.init();
    const all = await offlineDB.getAllEmployeeCacheRows();
    for (const row of all) {
      if (!isPendingOfflineEmployeeRow(row)) continue;
      const e = rowEmail(row);
      if (e && serverEmails.has(e)) {
        const rowId = (row as { id?: string | number }).id;
        if (rowId != null) await offlineDB.delete("employees", rowId);
      }
    }
  } catch {
    /* non-fatal */
  }
}
