"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import ViewNotification from "@/components/Org/Notifications/ViewNotification";
import { Notification } from "@/components/Org/Notifications/NotificationCard";
import { useState, useEffect } from "react";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import { mutate } from "swr";

function mapApiToNotification(raw: any): Notification & { time?: string } {
  const notify = raw?.notify ?? {};
  const createdAt = raw?.createdAt ?? raw?.created_at ?? raw?.date;
  const dateStr = createdAt ? new Date(createdAt).toLocaleDateString() : "";
  const timeStr = createdAt ? new Date(createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
  return {
    id: String(raw?.id ?? ""),
    date: dateStr,
    time: timeStr,
    sender: notify.sender ?? raw.sender ?? "System",
    title: notify.title ?? raw.title ?? "Notification",
    organization: raw.organization ?? raw.tenant?.name ?? notify.type ?? "",
    emailAddress: raw.emailAddress ?? raw.email ?? "",
    message: notify.message ?? raw.message ?? raw.body ?? raw.content ?? "",
  };
}

export default function ViewNotificationPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname() ?? "";
  const notificationId = params.notificationId as string;
  const [notification, setNotification] = useState<(Notification & { time?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Back link: notifications list (not send form)
  const segments = pathname.split("/").filter(Boolean);
  const isSubdomainMode = segments[0] === "dashboard";
  const backHref = isSubdomainMode ? "/dashboard/notifications" : segments[0] ? `/${segments[0]}/dashboard/notifications` : "/dashboard/notifications";

  useEffect(() => {
    if (!notificationId) {
      setLoading(false);
      return;
    }
    const fetchOne = async () => {
      try {
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_NOTIFICATION(notificationId));
        const body = response?.data ?? response;
        const data = body?.data ?? body;
        setNotification(mapApiToNotification(data));
        // Mark as read so unread count decreases in header and list
        try {
          await processRequestOfflineAuth("post", API_ENDPOINTS.POST_NOTIFICATION_READ, { notificationId: Number(notificationId) || notificationId });
          mutate(API_ENDPOINTS.GET_NOTIFICATION_UNREAD);
          mutate(API_ENDPOINTS.GET_NOTIFICATIONS);
        } catch (_) {
          // Non-blocking
        }
      } catch (e: any) {
        toast.error((e?.response?.data?.message as string) ?? "Failed to load notification", { toastId: "notif-view" });
        router.push(backHref);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [notificationId, router, backHref]);

  const handleDelete = (id: string) => {
    console.log("Delete notification:", id);
    router.push(backHref);
  };

  const handleReply = (_id: string) => {
    router.push(backHref);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-[#003465]">Loading...</p>
      </div>
    );
  }

  if (!notification) {
    return null;
  }

  return (
    <ViewNotification
      notification={notification}
      onDelete={handleDelete}
      onReply={handleReply}
      backHref={backHref}
    />
  );
}
