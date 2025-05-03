import {
  ActiveUserIcon,
  DashboardIcon,
  OrgIcon,
} from "@/components/icons/icon";
import { icons, UserRoundMinusIcon } from "lucide-react";

export const sideNavigation = [
  {
    name: "Dashboard",
    icon: DashboardIcon,
    href: "/dashboard",
    showRuler: false,
    isTitle: false,
  },
  {
    name: "Organization",
    icon: OrgIcon,
    // href: "/dashboard/organization",
    isTitle: true,
    // showRuler: true,
    children: [
      {
        title: "Organization",
        href: "/dashboard/organization",
        icon: OrgIcon,
      },
      {
        title: "Active",
        icon: ActiveUserIcon,
        href: "/dashboard/organization/active",
      },
      {
        title: "Inactive",
        icon: UserRoundMinusIcon,
        href: "/dashboard/organization/inactive",
      },
      {
        title: "Deactivated",
        icon: icons.UserX,
        href: "/dashboard/organization/deactivated",
      },
    ],
  },
  {
    name: "Notifications",
    icon: OrgIcon,
    href: "/dashboard/notifications",
    showRuler: true,
    isTitle: true,

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
    name: "Admin",
    icon: OrgIcon,
    href: "/dashboard/admin",
    showRuler: true,
    isTitle: true,

    children: [
      {
        title: "Admin Profile",
        icon: icons.CircleUserRound,
        href: "/dashboard/profile",
      },
      {
        title: "Create Admin",
        icon: icons.BookUser,
        href: "/dashboard/admin/create",
      },
      {
        title: "Admin List",
        icon: icons.Users,
        href: "/dashboard/admin/list",
      },
    ],
  },
  {
    name: "Settings & Support",
    icon: OrgIcon,
    href: "/dashboard/settings",
    showRuler: true,
    isTitle: true,

    children: [
      {
        title: "User training Guide",
        icon: icons.FileArchive,
        href: "/dashboard/user-training-guide",
      },
      {
        title: "System Settings",
        icon: icons.Cog,
        href: "/dashboard/settings",
      },
      {
        title: "Logout",
        icon: icons.LogOut,
      },
    ],
  },
];
