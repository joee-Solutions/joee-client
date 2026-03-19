import { headers } from "next/headers";
import { redirect } from "next/navigation";

function extractTenantFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();
  const parts = host.split(".");

  // Vercel: tenant.project.vercel.app -> tenant is parts[0] (only when there are enough parts)
  if (host.endsWith(".vercel.app")) {
    return parts.length >= 4 && parts[0] !== "www" ? parts[0] : null;
  }

  // Localhost: tenant.localhost:3000 -> tenant is parts[0]
  if (host.includes("localhost")) {
    return parts.length >= 2 && parts[0] !== "localhost" && parts[0] !== "www"
      ? parts[0]
      : null;
  }

  // Typical prod: tenant.domain.com -> tenant is parts[0]
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }

  return null;
}

export default async function DashboardCatchAllRedirectPage({
  params,
}: {
  params: { path?: string[] };
}) {
  const host = (await headers()).get("host");
  const tenant = extractTenantFromHost(host);

  // If we don't have a tenant subdomain, avoid 404 by sending users home.
  if (!tenant) redirect("/");

  const segments = params.path ?? [];
  const tail = segments.length > 0 ? `/${segments.join("/")}` : "";

  redirect(`/${tenant}/dashboard${tail}`);
}

