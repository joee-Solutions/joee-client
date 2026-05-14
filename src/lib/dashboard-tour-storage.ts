import Cookies from "js-cookie";

const VERSION = "v1";

function storageKey(): string {
  const uid = Cookies.get("auth_user_id")?.trim() || "anon";
  return `joee_dashboard_tour_${VERSION}_${uid}`;
}

export function isDashboardTourComplete(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(storageKey()) === "1";
  } catch {
    return true;
  }
}

export function markDashboardTourComplete(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(), "1");
  } catch {
    /* ignore quota / private mode */
  }
}
