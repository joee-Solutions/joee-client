/** Proxy returned `{ error: "backend_unreachable" }` (typically 503). */
export function isBackendUnreachableApiError(error: unknown): boolean {
  const data = (error as { response?: { data?: { error?: string }; status?: number } })
    ?.response?.data;
  if (data?.error === "backend_unreachable") return true;
  return isBackendUnreachableError(error);
}

/** Do not toast or show proxy/backend-down messaging — use cache or empty UI instead. */
export function shouldSuppressUserFacingApiError(error: unknown): boolean {
  return isBackendUnreachableApiError(error);
}

/** True when axios failed before/during transport (no HTTP body, canceled, or proxy unreachable). */
export function isAxiosNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as {
    response?: { status?: number; data?: { error?: string } };
    message?: string;
    code?: string;
  };
  const msg = String(err.message || "").toLowerCase();
  const code = String(err.code || "").toUpperCase();
  const status = Number(err.response?.status ?? 0);

  if (code === "ERR_CANCELED" || code === "ECONNABORTED") return true;
  if (code === "ERR_NETWORK" || msg.includes("network error")) return true;
  if (!err.response) return true;
  if (status === 503 && err.response?.data?.error === "backend_unreachable") return true;

  return false;
}

/** Server/gateway faults and transport failures — eligible for offline cache fallback. */
export function isBackendUnreachableError(error: unknown): boolean {
  const err = error as { response?: { status?: number }; code?: string; message?: string };
  const code = String(err?.code || "").toUpperCase();
  const status = Number(err?.response?.status ?? 0);
  const msg = String(err?.message || "").toLowerCase();

  if (isAxiosNetworkError(error)) return true;

  return (
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    msg.includes("getaddrinfo") ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}
