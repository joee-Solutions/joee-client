"use client";

import { useRouter, useParams } from "next/navigation";
import ViewNotification from "@/components/Org/Notifications/ViewNotification";
import { Notification } from "@/components/Org/Notifications/NotificationCard";

// Mock notification data - in real app, fetch by ID from API
const mockNotifications: (Notification & { time?: string })[] = [
  {
    id: "1",
    date: "13 Jan 2023",
    time: "11:00am",
    sender: "Daniel James",
    title: "Scheduled Notification for System Maintenance",
    organization: "JON-KEN Hospital",
    emailAddress: "jonkenhospitalgmail.com",
    message: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  },
  {
    id: "2",
    date: "27 Dec 2022",
    time: "10:30am",
    sender: "Daniel James",
    title: "Scheduled Notification for System Maintenance",
    organization: "Brigerton Hospital",
    emailAddress: "brigertonclinics@gmail.com",
    message: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  },
];

export default function ViewNotificationPage() {
  const router = useRouter();
  const params = useParams();
  const notificationId = params.notificationId as string;

  // In a real app, fetch notification by ID from API
  const notification = mockNotifications.find((n) => n.id === notificationId) || mockNotifications[0];

  const handleDelete = (id: string) => {
    // Handle delete logic
    console.log("Delete notification:", id);
    router.push("/dashboard/notifications");
  };

  const handleReply = (id: string) => {
    // Handle reply logic
    router.push(`/dashboard/notifications/send`);
  };

  return (
    <ViewNotification
      notification={notification}
      onDelete={handleDelete}
      onReply={handleReply}
    />
  );
}
