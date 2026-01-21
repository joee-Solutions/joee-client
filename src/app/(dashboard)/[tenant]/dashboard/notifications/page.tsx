"use client";

import { useRouter } from "next/navigation";
import NotificationList from "@/components/Org/Notifications/NotificationList";
import { Notification } from "@/components/Org/Notifications/NotificationCard";

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: "1",
    date: "13 Jan 2023",
    sender: "Daniel James",
    title: "Scheduled Notification for System Maintenance",
    organization: "JON-KEN Hospital",
    emailAddress: "jonkenhospitalgmail.com",
    message: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  },
  {
    id: "2",
    date: "27 Dec 2022",
    sender: "Daniel James",
    title: "Scheduled Notification for System Maintenance",
    organization: "Brigerton Hospital",
    emailAddress: "brigertonclinics@gmail.com",
    message: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  },
  {
    id: "3",
    date: "19 Nov 2022",
    sender: "Daniel James",
    title: "Scheduled Notification for System Maintenance",
    organization: "All Organizations",
    emailAddress: "N/A",
    message: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  },
  {
    id: "4",
    date: "19 Nov 2022",
    sender: "Raven Heights Clinic",
    title: "Subscription Payment Renewal",
    organization: "JOEE Solutions",
    emailAddress: "joeesolutions@gmail.com",
    message: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  const handleViewNotification = (id: string) => {
    router.push(`/dashboard/notifications/${id}`);
  };

  const handleDeleteNotification = (id: string) => {
    // Handle delete logic
    console.log("Delete notification:", id);
    // In a real app, you would call an API here
  };

  return (
    <NotificationList
      notifications={mockNotifications}
      onViewNotification={handleViewNotification}
      onDeleteNotification={handleDeleteNotification}
    />
  );
}
