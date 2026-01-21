"use client";

import SendNotification, { NotificationFormType } from "@/components/Org/Notifications/SendNotification";

export default function SendNotificationPage() {
  // Mock data for dropdowns - in a real app, fetch from API
  const emailOptions = ["Select", "user1@example.com", "user2@example.com"];
  const organizationOptions = ["Select", "JON-KEN Hospital", "Brigerton Hospital", "JOEE Solutions"];

  const handleSubmit = (data: NotificationFormType) => {
    console.log("Notification data:", data);
    // Handle form submission - call API here
    // router.push("/dashboard/notifications");
  };

  return (
    <SendNotification
      emailOptions={emailOptions}
      organizationOptions={organizationOptions}
      onSubmit={handleSubmit}
    />
  );
}
