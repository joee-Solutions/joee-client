import { DashboardIcon, OrgIcon } from "@/components/icons/icon";
import { CalendarClock, icons } from "lucide-react";
import { FaUserNurse, FaUsers } from "react-icons/fa";
import { IoIosListBox, IoMdSettings } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";

/** Path roots that are never tenant slugs (path is /{tenant}/dashboard/...). */
const NON_TENANT_FIRST_SEGMENTS = new Set([
  "dashboard",
  "login",
  "api",
  "_next",
  "forgot-password",
  "reset-password",
  "verify-login-otp",
  "not-found",
  "assets",
]);

/**
 * When the app is served at `/{slug}/dashboard/...` (path-based tenant), returns `slug`.
 * On subdomain setups the browser pathname is `/dashboard/...` — returns null so links stay `/dashboard/...`
 * and middleware rewrites apply.
 */
export function getPathTenantSlug(pathname: string | null | undefined): string | null {
  if (!pathname || pathname === "/") return null;
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  if (!first || NON_TENANT_FIRST_SEGMENTS.has(first)) return null;
  if (parts[1] === "dashboard") return first;
  return null;
}

/** Prefix `/dashboard/...` (and absolute paths under it) with `/{tenant}` when using path-based tenant URLs. */
export function withPathTenant(pathname: string | null | undefined, href: string): string {
  const tenant = getPathTenantSlug(pathname);
  if (!tenant || !href.startsWith("/")) return href;
  if (!href.startsWith("/dashboard")) return href;
  return `/${tenant}${href}`;
}

/**
 * Href for the patients list. On subdomain hosts the browser path is `/dashboard/patients` (tenant is not
 * in the path); on path-based routing it is `/{tenant}/dashboard/patients`. `routeParamsTenant` is the
 * `[tenant]` segment (set on both modes) and must not be prefixed when the visible path is already under `/dashboard`.
 */
export function patientsListHrefFromLocation(
  pathname: string | null | undefined,
  routeParamsTenant: string
): string {
  const pathTenant = getPathTenantSlug(pathname ?? "");
  if (pathTenant) return `/${pathTenant}/dashboard/patients`;
  const p = pathname ?? "";
  if (p === "/dashboard" || p.startsWith("/dashboard/")) return "/dashboard/patients";
  const slug = (routeParamsTenant || "").trim();
  if (slug) return `/${slug}/dashboard/patients`;
  return "/dashboard/patients";
}

/** If true, Tenant_User role can see this nav item. Tenant_Admin always sees all. */
export type NavItem = {
  name: string;
  icon: unknown;
  href: string;
  tenantUserAllowed?: boolean;
  children?: { title: string; icon: unknown; href: string }[];
};

export const sideNavigation: NavItem[] = [
  {
    name: "Dashboard",
    icon: DashboardIcon,
    href: "/dashboard",
    tenantUserAllowed: true,
  },
  {
    name: "Departments",
    icon: OrgIcon,
    href: "/dashboard/departments",
    tenantUserAllowed: true,
  },
  {
    name: "Employees",
    icon: FaUserNurse,
    href: "/dashboard/employees",
    tenantUserAllowed: false,
  },
  {
    name: "Patients",
    icon: FaUsers,
    href: "/dashboard/patients",
    tenantUserAllowed: true,
  },
  {
    name: "Appointments",
    icon: CalendarClock,
    href: "/dashboard/appointments",
    tenantUserAllowed: true,
  },
  {
    name: "Schedules",
    icon: IoIosListBox,
    href: "/dashboard/schedules",
    tenantUserAllowed: true,
  },
  {
    name: "Notifications",
    icon: BsFillSendFill,
    href: "/dashboard/notifications",
    tenantUserAllowed: false,
    children: [
      {
        title: "notification list",
        icon: icons.FileChartColumn,
        href: "/dashboard/notifications",
      },
      {
        title: "Send Notifications",
        icon: icons.Send,
        href: "/dashboard/send-notifcations",
      },
    ],
  },
  {
    name: "Settings",
    icon: IoMdSettings,
    href: "/dashboard/settings",
    tenantUserAllowed: true,
  },
];
