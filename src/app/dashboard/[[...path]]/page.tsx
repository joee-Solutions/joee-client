import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { LAST_TENANT_COOKIE } from "@/lib/auth-store";
import { getTenantSubdomainFromHost } from "@/lib/tenant-host";

export default async function DashboardCatchAllRedirectPage({
  params,
}: {
  params: { path?: string[] };
}) {
  const host = (await headers()).get("host");
  const tenant =
    getTenantSubdomainFromHost(host) ||
    (await cookies()).get(LAST_TENANT_COOKIE)?.value ||
    null;

  if (!tenant) redirect("/");

  const segments = params.path ?? [];
  const tail = segments.length > 0 ? `/${segments.join("/")}` : "";

  redirect(`/${tenant}/dashboard${tail}`);
}
