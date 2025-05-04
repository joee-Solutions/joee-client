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
  },
  {
    name: "Departments",
    icon: OrgIcon,
    href: "/dashboard/departments",
  },
  {
    name: "Employees",
    icon: OrgIcon,
    href: "/dashboard/employees",
  },
  {
    name: "Patients",
    icon: OrgIcon,
    href: "/dashboard/patients",
  },
  {
    name: "Notifications",
    icon: OrgIcon,
    href: "/dashboard/notifcations",

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
    icon: OrgIcon,
    href: "/dashboard/settings",

    // children: [
    //   {
    //     title: "User training Guide",
    //     icon: icons.FileArchive,
    //     href: "/dashboard/user-training-guide",
    //   },
    //   {
    //     title: "System Settings",
    //     icon: icons.Cog,
    //     href: "/dashboard/settings",
    //   },
    //   {
    //     title: "Logout",
    //     icon: icons.LogOut,
    //   },
    // ],
  },
];
