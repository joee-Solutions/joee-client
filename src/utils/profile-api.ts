/** True when logo can be passed to next/image or used as an <img> src (excludes API placeholders like "{}"). */
export function tenantLogoToImageSrc(logo: unknown): string | null {
  const raw = String(logo ?? "").trim();
  if (!raw) return null;
  if (raw === "{}" || raw === "[]") return null;
  if (
    raw.startsWith("/") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }
  return null;
}

/**
 * /tenant/profile API returns: { success, message, data: { data: { role, tenant }, message } }
 * This extracts the tenant object (profile for forms) and role for use in header/settings.
 */
export function parseTenantProfileResponse(response: any): {
  profile: Record<string, unknown> | null;
  roles: string[];
} {
  const inner = response?.data?.data ?? response?.data ?? response;
  const payload = inner?.data ?? inner;
  const tenant = payload?.tenant ?? inner?.tenant ?? payload;
  const role = payload?.role ?? inner?.role;
  const roles = Array.isArray(role)
    ? role
    : Array.isArray(payload?.roles)
    ? payload.roles
    : Array.isArray(inner?.roles)
    ? inner.roles
    : role
    ? [role]
    : tenant?.roles
    ? (Array.isArray(tenant.roles) ? tenant.roles : [tenant.roles])
    : [];

  const profile =
    tenant && typeof tenant === "object" && !Array.isArray(tenant)
      ? { ...tenant, role: roles[0], roles }
      : null;

  return { profile, roles };
}
