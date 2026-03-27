"use client";

import { useRouter } from "next/navigation";
import NotificationList from "@/components/Org/Notifications/NotificationList";
import useSWR from "swr";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

export default function NotificationsPage() {
  const router = useRouter();
  const { data: response } = useSWR(
    API_ENDPOINTS.GET_NOTIFICATIONS,
    async (url: string) => processRequestOfflineAuth("get", url),
    {
      revalidateOnFocus: true,
      refreshInterval: 10000,
      dedupingInterval: 3000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );

  const notifications = Array.isArray(response?.data)
    ? response.data
    : Array.isArray((response as any)?.data?.data)
      ? (response as any).data.data
      : Array.isArray(response)
        ? response
        : [];

  const handleViewNotification = (id: string) => {
    router.push(`/dashboard/notifications/${id}`);
  };

  const handleDeleteNotification = (_id: string) => {};

  // Map API shape: { id, status, createdAt, notify: { title, message, sender, fileUrl, type } }
  const mapped = notifications.map((n: any) => {
    const notify = n.notify ?? {};
    return {
      id: String(n.id ?? n.notificationId ?? ""),
      date: n.createdAt ?? n.created_at ?? n.date ? new Date(n.createdAt ?? n.created_at ?? n.date).toLocaleDateString() : "",
      sender: notify.sender ?? n.sender ?? n.from ?? "System",
      title: notify.title ?? n.title ?? n.subject ?? "Notification",
      organization: n.organization ?? n.tenant?.name ?? notify.type ?? "",
      emailAddress: n.emailAddress ?? n.email ?? "",
      message: notify.message ?? n.message ?? n.body ?? n.content ?? "",
    };
  });

  return (
    <NotificationList
      notifications={mapped}
      onViewNotification={handleViewNotification}
      onDeleteNotification={handleDeleteNotification}
    />
  );
}
