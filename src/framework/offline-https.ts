/**
 * Offline-aware API layer: when online uses processRequestAuth and caches GETs;
 * when offline reads from IndexedDB and queues mutations.
 */
import { processRequestAuth, getTenantId } from "@/framework/https";
import { getToken } from "@/framework/get-token";
import { offlineDB, type JoeeOfflineDB } from "@/lib/offline-db";

const getBaseURL = () => (typeof window === "undefined" ? "" : "/api");

/** Path prefix to IndexedDB store name for cacheable GETs (used in getStoreForPath). */
const PATH_TO_STORE: Record<string, keyof JoeeOfflineDB> = {
  "tenant/patient": "patients",
  "tenant/appointment": "appointments",
  "tenant/schedule": "schedules",
  "tenant/employee": "employees",
  "tenant/department": "departments",
};

function getStoreForPath(path: string): keyof JoeeOfflineDB | null {
  const p = path.replace(/^\/+/, "").toLowerCase();
  for (const [prefix, store] of Object.entries(PATH_TO_STORE)) {
    if (p.startsWith(prefix)) return store;
  }
  return null;
}

/** Normalize API response to array of items (for caching). */
function toItemsArray(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

/** Build response shape that matches what pages expect (e.g. { data: { data: [...] } }). */
function toResponseShape(items: any[]): any {
  return { data: { data: items } };
}

function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

function isBackendUnreachableError(error: any): boolean {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  const status = error?.response?.status;
  const apiError = String(error?.response?.data?.error || "").toLowerCase();
  return (
    code === "ENOTFOUND" ||
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    msg.includes("getaddrinfo") ||
    msg.includes("network error") ||
    (status === 503 && apiError === "backend_unreachable")
  );
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

  const body =
    data != null && typeof data === "object" && !(data instanceof FormData)
      ? JSON.stringify(data)
      : undefined;

  await offlineDB.queueRequest({
    url,
    method: method.toUpperCase(),
    headers,
    body,
  });

  if (storeName && tenant && (method === "post" || method === "put" || method === "patch")) {
    const payload = data && typeof data === "object" ? data : {};
    const tempId = payload.id ?? `offline-${Date.now()}`;
    try {
      await offlineDB.cacheData(storeName, [{ ...payload, id: tempId }], tenant);
    } catch (_) {}
  }

  const payloadObj = data && typeof data === "object" ? data : {};
  const optimisticId = payloadObj.id ?? `offline-${Date.now()}`;
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
            await offlineDB.cacheData(storeName, items, tenant);
          } catch (e) {
            console.warn("Offline cache write failed:", e);
          }
        }
      }

      return result;
    } catch (error) {
      // If backend is unreachable (DNS/network) treat as offline fallback, even if navigator says "online".
      if (isBackendUnreachableError(error)) {
        if (method === "get" && storeName && tenant) {
          try {
            await offlineDB.init();
            const cached = await offlineDB.getCachedData(storeName, tenant);
            const out = toResponseShape(cached);
            if (callback) callback(path, out);
            return out;
          } catch (_) {}
        } else if (method !== "get") {
          return queueOfflineMutation(method, path, data, storeName, tenant, callback);
        }
      }
      // Optional: on network error with GET, try cache as fallback
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
