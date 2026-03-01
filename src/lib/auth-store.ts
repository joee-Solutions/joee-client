import Cookies from "js-cookie";
import { offlineDB } from "@/lib/offline-db";

const COOKIE_OPTS = { sameSite: "lax" as const, path: "/" };

export type AuthSession = {
  tenant?: string;
  auth_token: string;
  refresh_token?: string;
  user: any;
  savedAt: number;
};

/**
 * Save current auth from cookies into IndexedDB for offline restore.
 * Call after successful login or OTP verify.
 */
export async function saveLastSession(tenant?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const auth_token = Cookies.get("auth_token");
  const refresh_token = Cookies.get("refresh_token");
  const userStr = Cookies.get("user");
  if (!auth_token) return;

  const user = userStr ? (() => {
    try {
      return JSON.parse(userStr);
    } catch {
      return { email: userStr };
    }
  })() : undefined;

  await offlineDB.init();
  await offlineDB.saveAuthSession({
    tenant,
    auth_token,
    refresh_token: refresh_token ?? undefined,
    user: user ?? {},
  });
}

/**
 * Get last saved session from IndexedDB (for offline restore).
 */
export async function getLastSession(): Promise<AuthSession | null> {
  if (typeof window === "undefined") return null;
  await offlineDB.init();
  return offlineDB.getAuthSession();
}

/**
 * Restore last session into cookies and return true if restored.
 * Use when offline and cookies are missing (e.g. tab closed and reopened).
 */
export async function restoreLastSessionToCookies(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const session = await getLastSession();
  if (!session?.auth_token) return false;

  Cookies.set("auth_token", session.auth_token, { ...COOKIE_OPTS, expires: 7 });
  if (session.refresh_token) {
    Cookies.set("refresh_token", session.refresh_token, { ...COOKIE_OPTS, expires: 30 });
  }
  if (session.user && typeof session.user === "object") {
    Cookies.set("user", JSON.stringify(session.user), { ...COOKIE_OPTS, expires: 7 });
  }
  return true;
}

/**
 * Clear last session from IndexedDB. Call on logout.
 */
export async function clearLastSession(): Promise<void> {
  if (typeof window === "undefined") return;
  await offlineDB.init();
  await offlineDB.clearAuthSession();
}
