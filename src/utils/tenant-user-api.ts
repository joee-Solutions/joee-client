/**
 * GET /tenant/user/:id → { success, message, data: { data: { firstname, lastname, tenant, roles, ... } } }
 */
export function parseTenantUserResponse(response: any): Record<string, unknown> | null {
  const payload = response?.data ?? response;
  const user = payload?.data?.data ?? payload?.data ?? payload;
  if (!user || typeof user !== "object" || Array.isArray(user)) return null;
  if (!("id" in user) && !("firstname" in user) && !("email" in user)) return null;
  return user as Record<string, unknown>;
}

export type TenantUserPayload = {
  id?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  region?: string | null;
  specialty?: string | null;
  designation?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  hire_date?: string | null;
  image_url?: string | null;
  about?: string | null;
  tenant?: { domain?: string; website?: string; name?: string };
};
