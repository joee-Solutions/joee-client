/**
 * /tenant/profile API returns: { success, message, data: { data: { role, tenant }, message } }
 * This extracts the tenant object (profile for forms) and role for use in header/settings.
 */
export function parseTenantProfileResponse(response: any): {
  profile: Record<string, unknown> | null;
  roles: string[];
} {
  const inner = response?.data?.data ?? response?.data ?? response;
  const tenant = inner?.tenant ?? inner;
  const role = inner?.role;
  const roles = Array.isArray(role)
    ? role
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
