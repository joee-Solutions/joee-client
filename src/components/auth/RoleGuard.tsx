"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getRolesFromUser, isTenantAdmin, isPathAllowedForTenantUser } from "@/utils/permissions";

/**
 * Redirects Tenant_User to dashboard when they access a page they are not allowed to see.
 * Tenant_Admin is never redirected.
 */
export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userJson = Cookies.get("user");
    let user: { roles?: string[]; role?: string } | null = null;
    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch {
      return;
    }

    const roles = getRolesFromUser(user);
    if (isTenantAdmin(roles)) return;
    if (isPathAllowedForTenantUser(pathname)) return;

    // Tenant_User on a forbidden path → redirect to dashboard
    const isSubdomain =
      window.location.hostname.split(".").length > 1 &&
      window.location.hostname.split(".")[0] !== "www";
    const firstSegment = pathname.split("/")[1];
    const reserved = ["dashboard", "login", "forgot-password", "reset-password", "verify-login-otp"];
    const hasTenantInPath = Boolean(firstSegment && !reserved.includes(firstSegment));
    const dashboardPath = isSubdomain ? "/dashboard" : hasTenantInPath ? `/${firstSegment}/dashboard` : "/dashboard";
    router.replace(dashboardPath);
  }, [pathname, router]);

  return <>{children}</>;
}
