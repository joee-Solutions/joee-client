/**
 * Offline-aware API layer: when online uses processRequestAuth and caches GETs;
 * when offline reads from IndexedDB and queues mutations.
 */
import { processRequestAuth, getTenantId } from "@/framework/https";
import { isBackendUnreachableError } from "@/framework/api-errors";
import { getToken } from "@/framework/get-token";
import { getLastSession } from "@/lib/auth-store";
import { offlineDB, type JoeeOfflineDB } from "@/lib/offline-db";
import {
  enrichAppointmentPayload,
  enrichSchedulePayload,
  lookupEmployeeNameFromCache,
  lookupPatientNameFromCache,
} from "@/lib/offline-optimistic-display";
import { leanQueuePayload } from "@/lib/offline-queue-payload";
import Cookies from "js-cookie";

const getBaseURL = () => (typeof window === "undefined" ? "" : "/api");

/** Path prefix to IndexedDB store name for cacheable GETs (used in getStoreForPath). */
const PATH_TO_STORE: Record<string, keyof JoeeOfflineDB> = {
  "tenant/patient": "patients",
  "tenant/appointment": "appointments",
  "tenant/schedule": "schedules",
  "tenant/employee": "employees",
  "tenant/user": "employees",
  "tenant/department": "departments",
};

function getStoreForPath(path: string): keyof JoeeOfflineDB | null {
  const p = path.replace(/^\/+/, "").toLowerCase();
  for (const [prefix, store] of Object.entries(PATH_TO_STORE)) {
    if (p.startsWith(prefix)) return store;
  }
  return null;
}

/** Normalize API response to array of items (for caching and UI after offline reads). */
function toItemsArray(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

/** Use this when reading `processRequestOfflineAuth` GET results so online + offline shapes match. */
export function extractApiListItems(res: any): any[] {
  return toItemsArray(res);
}

/** Build response shape that matches what pages expect (e.g. { data: { data: [...] } }). */
function toResponseShape(items: any[]): any {
  return { data: { data: items } };
}

function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

function isProfilePath(path: string): boolean {
  return path.replace(/^\/+/, "").toLowerCase().startsWith("tenant/profile");
}

/** Shape compatible with parseTenantProfileResponse when API is unreachable. */
async function getProfileOfflineFallback(): Promise<Record<string, unknown> | null> {
  try {
    const session = await getLastSession();
    const user = session?.user;
    if (user && typeof user === "object" && Object.keys(user).length > 0) {
      return {
        data: {
          data: {
            tenant: user,
            role: (user as { roles?: unknown; role?: unknown }).roles ?? (user as { role?: unknown }).role,
          },
        },
      };
    }
  } catch {
    /* ignore */
  }

  const userCookie = Cookies.get("user");
  if (!userCookie) return null;
  try {
    const parsed = JSON.parse(userCookie) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") {
      return {
        data: {
          data: {
            tenant: parsed,
            role: parsed.roles ?? parsed.role,
          },
        },
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function handleUnreachableGet(
  path: string,
  storeName: keyof JoeeOfflineDB | null,
  tenant: string | undefined,
  callback?: (path: string, data: any, error?: any) => void
): Promise<any | null> {
  if (isProfilePath(path)) {
    const profile = await getProfileOfflineFallback();
    if (profile) {
      if (callback) callback(path, profile);
      return profile;
    }
  }

  if (storeName && tenant) {
    try {
      await offlineDB.init();
      const cached = await offlineDB.getCachedData(storeName, tenant);
      const out = toResponseShape(cached);
      if (callback) callback(path, out);
      return out;
    } catch {
      /* fall through */
    }
  }

  const empty = toResponseShape([]);
  if (callback) callback(path, empty);
  return empty;
}

/** Never surface backend_unreachable to callers for GET — cache, session, or empty list. */
async function resolveUnreachableGet(
  path: string,
  storeName: keyof JoeeOfflineDB | null,
  tenant: string | undefined,
  callback?: (path: string, data: any, error?: any) => void
): Promise<any> {
  const fallback = await handleUnreachableGet(path, storeName, tenant, callback);
  if (fallback != null) return fallback;
  const empty = toResponseShape([]);
  if (callback) callback(path, empty);
  return empty;
}

function extractIdFromPath(path: string): string | null {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  if (!parts.length) return null;
  const last = parts[parts.length - 1];
  if (["create", "update", "delete", "read"].includes(last)) {
    return parts.length > 1 ? parts[parts.length - 2] : null;
  }
  return last ?? null;
}

function normalizeOptimisticId(id: unknown): string | number | undefined {
  if (id == null) return undefined;
  if (typeof id === "number") return id;
  const asString = String(id).trim();
  if (/^\d+$/.test(asString)) return Number(asString);
  return asString;
}

function extractEmployeeIdFromSchedulePath(path: string): string | null {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  const idx = parts.findIndex((p) => p === "schedule");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

async function enrichPayloadForOfflineCache(
  storeName: keyof JoeeOfflineDB,
  path: string,
  method: "post" | "put" | "patch",
  payload: Record<string, unknown>,
  existing?: Record<string, unknown>,
  tenant?: string
): Promise<Record<string, unknown>> {
  if (storeName === "appointments") {
    let enriched = enrichAppointmentPayload(payload, existing);
    if (tenant) {
      const pid = enriched.patientId ?? enriched.patient_id;
      const uid = enriched.userId ?? enriched.user_id;
      if (pid != null && !enriched.patientName) {
        const name = await lookupPatientNameFromCache(tenant, pid as string | number);
        if (name) enriched = enrichAppointmentPayload({ ...enriched, patientName: name }, existing);
      }
      if (uid != null && !enriched.doctorName) {
        const emp = await lookupEmployeeNameFromCache(tenant, uid as string | number);
        if (emp.name) {
          enriched = enrichAppointmentPayload(
            { ...enriched, doctorName: emp.name },
            existing
          );
        }
      }
    }
    return enriched;
  }

  if (storeName === "schedules") {
    const employeeIdFromPath = extractEmployeeIdFromSchedulePath(path);
    let meta: Parameters<typeof enrichSchedulePayload>[2];
    if (tenant && employeeIdFromPath) {
      const emp = await lookupEmployeeNameFromCache(tenant, employeeIdFromPath);
      meta = {
        employeeId: employeeIdFromPath,
        employeeName: emp.name,
        firstname: emp.firstname,
        lastname: emp.lastname,
        department: emp.department || (payload.department as string),
      };
    }
    return enrichSchedulePayload(payload, existing, meta);
  }

  return payload;
}

async function queueOfflineMutation(
  method: "post" | "put" | "patch" | "delete",
  path: string,
  data: any,
  storeName: keyof JoeeOfflineDB | null,
  tenant?: string,
  callback?: (path: string, data: any, error?: any) => void
): Promise<any> {
  await offlineDB.init();
  const url = getBaseURL() + path;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(tenant ? { "x-tenant-id": tenant } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const cachePayload =
    data != null && typeof data === "object" && !(data instanceof FormData)
      ? ({ ...(data as Record<string, unknown>) } as Record<string, unknown>)
      : undefined;
  const queuePayload = leanQueuePayload(
    method,
    path,
    cachePayload
  );
  const body =
    queuePayload != null && typeof queuePayload === "object"
      ? JSON.stringify(queuePayload)
      : undefined;

  await offlineDB.queueRequest({
    url,
    method: method.toUpperCase(),
    headers,
    body,
  });

  if (storeName && tenant && (method === "post" || method === "put" || method === "patch")) {
    const payload =
      cachePayload ??
      (data && typeof data === "object" ? ({ ...data } as Record<string, unknown>) : {});
    const idFromPath = extractIdFromPath(path);
    const isAppointmentCreate =
      method === "post" && path.replace(/^\/+/, "").toLowerCase().includes("tenant/appointment/");
    const optimisticIdRaw =
      method === "post"
        ? payload.id ?? (isAppointmentCreate ? `offline-${Date.now()}` : idFromPath) ?? `offline-${Date.now()}`
        : payload.id ?? idFromPath ?? `offline-${Date.now()}`;
    const optimisticId = normalizeOptimisticId(optimisticIdRaw);
    try {
      let existing: Record<string, unknown> | undefined;
      if (method === "put" || method === "patch") {
        const existingRows = await offlineDB.getCachedData(storeName, tenant);
        existing = existingRows.find(
          (item: any) => String(item?.id) === String(optimisticId)
        ) as Record<string, unknown> | undefined;
      }

      let enrichedPayload = await enrichPayloadForOfflineCache(
        storeName,
        path,
        method,
        payload as Record<string, unknown>,
        existing,
        tenant
      );

      let optimisticRow: any = { ...enrichedPayload, id: optimisticId };
      if (existing) {
        optimisticRow = { ...existing, ...enrichedPayload, id: optimisticId };
      } else if (method === "post") {
        optimisticRow = {
          ...optimisticRow,
          _offline: true,
          _pending: true,
          createdAt: optimisticRow.createdAt ?? new Date().toISOString(),
        };
      }
      await offlineDB.cacheData(storeName, [optimisticRow], tenant, "merge");
    } catch (_) {}
  } else if (storeName && method === "delete") {
    try {
      const deleteId = extractIdFromPath(path);
      if (deleteId) {
        await offlineDB.removeCachedItemByIdEverywhere(storeName, deleteId);
      }
    } catch (_) {}
  }

  const payloadObj = data && typeof data === "object" ? data : {};
  const optimisticIdRaw =
    method === "post"
      ? payloadObj.id ?? `offline-${Date.now()}`
      : payloadObj.id ?? extractIdFromPath(path) ?? `offline-${Date.now()}`;
  const optimisticId = normalizeOptimisticId(optimisticIdRaw);
  const optimistic = toResponseShape([{ ...payloadObj, id: optimisticId }]);
  if (method === "post" && optimistic.data?.data?.[0]) {
    (optimistic.data as any).id = optimisticId;
  }
  if (callback) callback(path, optimistic);
  return optimistic;
}

export type ProcessRequestOfflineAuthOptions = {
  /** If true, skip cache write (e.g. for one-off requests). */
  skipCache?: boolean;
};

/**
 * Offline-aware authenticated request.
 * - Online: calls processRequestAuth, on GET success caches to IndexedDB.
 * - Offline: GET returns from cache; POST/PUT/PATCH/DELETE queues and returns optimistic result.
 */
export async function processRequestOfflineAuth(
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  data?: any,
  callback?: (path: string, data: any, error?: any) => void,
  files?: any[] | File | Blob,
  options: ProcessRequestOfflineAuthOptions = {}
): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("processRequestOfflineAuth can only be called on the client");
  }

  const tenant = getTenantId();
  const storeName = getStoreForPath(path);

  if (isOnline()) {
    try {
      const result = await processRequestAuth(
        method,
        path,
        data,
        callback as any,
        files
      );

      // Cache successful GET responses for offline use
      if (
        !options.skipCache &&
        method === "get" &&
        storeName &&
        tenant &&
        result != null
      ) {
        const items = toItemsArray(result);
        if (items.length >= 0) {
          try {
            await offlineDB.init();
            await offlineDB.cacheData(storeName, items, tenant, "replace");
          } catch (e) {
            console.warn("Offline cache write failed:", e);
          }
        }
      }

      if (
        method === "delete" &&
        storeName &&
        tenant &&
        !options.skipCache
      ) {
        const deleteId = extractIdFromPath(path);
        if (deleteId) {
          try {
            await offlineDB.init();
            await offlineDB.removeCachedItemByIdEverywhere(storeName, deleteId);
          } catch (e) {
            console.warn("Offline cache delete after online DELETE failed:", e);
          }
        }
      }

      return result;
    } catch (error) {
      // Backend unreachable while browser reports online — use cache/session instead of throwing.
      if (isBackendUnreachableError(error)) {
        if (method === "get") {
          return resolveUnreachableGet(path, storeName, tenant, callback);
        }
        return queueOfflineMutation(method, path, data, storeName, tenant, callback);
      }
      // Optional: on other GET failures, try cache when we have stored rows
      if (method === "get" && storeName && tenant) {
        try {
          await offlineDB.init();
          const cached = await offlineDB.getCachedData(storeName, tenant);
          if (cached.length > 0) {
            if (callback) callback(path, toResponseShape(cached));
            return toResponseShape(cached);
          }
        } catch (_) {}
      }
      if (callback) callback(path, null, error);
      throw error;
    }
  }

  if (method === "get") {
    await offlineDB.init();
    if (storeName && tenant) {
      const cached = await offlineDB.getCachedData(storeName, tenant);
      const out = toResponseShape(cached);
      if (callback) callback(path, out);
      return out;
    }
    // No store for this path (e.g. notifications, backup) — return empty
    const empty = toResponseShape([]);
    if (callback) callback(path, empty);
    return empty;
  }

  // Offline mutation: queue and return optimistic response
  return queueOfflineMutation(method, path, data, storeName, tenant, callback);
}
