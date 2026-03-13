import { DashboardIcon, OrgIcon } from "@/components/icons/icon";
import { CalendarClock, icons } from "lucide-react";
import { FaUserNurse, FaUsers } from "react-icons/fa";
import { IoIosListBox, IoMdSettings } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";

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
