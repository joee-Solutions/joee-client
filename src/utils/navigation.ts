import { DashboardIcon, OrgIcon } from "@/components/icons/icon";
import { CalendarClock, icons } from "lucide-react";
import { FaUserNurse, FaUsers } from "react-icons/fa";
import { IoIosListBox, IoMdSettings } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";

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
    icon: FaUserNurse,
    href: "/dashboard/employees",
  },
  {
    name: "Patients",
    icon: FaUsers,
    href: "/dashboard/patients",
  },
  {
    name: "Appointments",
    icon: CalendarClock,
    href: "/dashboard/appointments",
  },
  {
    name: "Schedules",
    icon: IoIosListBox,
    href: "/dashboard/schedules",
  },
  {
    name: "Notifications",
    icon: BsFillSendFill,
    href: "/dashboard/notifications",

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
