/**
 * Tenant role names from auth response (data.roles).
 * Tenant_Admin: full access to all dashboard pages.
 * Tenant_User: restricted to a subset of pages.
 */
export const TENANT_ADMIN = "Tenant_Admin";
export const TENANT_USER = "Tenant_User";

export type TenantRole = typeof TENANT_ADMIN | typeof TENANT_USER;

export function isTenantAdmin(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === TENANT_ADMIN);
}

export function isTenantUser(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === TENANT_USER);
}

/**
 * Path segments that Tenant_User is allowed to access (dashboard sub-routes).
 * Tenant_Admin can access everything.
 */
export const TENANT_USER_ALLOWED_PATH_SEGMENTS = [
  "", // dashboard root
  "patients",
  "appointments",
  "schedules",
  "departments",
  "settings",
] as const;

/**
 * Returns true if the given pathname is allowed for Tenant_User.
 * Pathname can be with or without tenant prefix, e.g. /doe/dashboard/patients or /dashboard/patients.
 */
export function isPathAllowedForTenantUser(pathname: string): boolean {
  const normalized = pathname.replace(/^\/[^/]+/, ""); // strip tenant segment if present
  const segments = normalized.split("/").filter(Boolean); // ['dashboard', 'patients', ...]
  const dashboardIndex = segments.indexOf("dashboard");
  const afterDashboard = dashboardIndex >= 0 ? segments.slice(dashboardIndex + 1) : segments;
  const firstSegment = afterDashboard[0] ?? "";
  return (TENANT_USER_ALLOWED_PATH_SEGMENTS as readonly string[]).includes(firstSegment);
}

export function getRolesFromUser(user: { roles?: string[]; role?: string } | null): string[] {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles;
  if (user.role) return [user.role];
  return [];
}
