"use client";

import { Button } from "@/components/ui/button";
import { CircleArrowLeft, Search, Reply, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Notification } from "./NotificationCard";

interface ViewNotificationProps {
  notification: Notification & { time?: string };
  onDelete?: (id: string) => void;
  onReply?: (id: string) => void;
}

export default function ViewNotification({
  notification,
  onDelete,
  onReply,
}: ViewNotificationProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
    } else {
      console.log("Delete notification:", notification.id);
      router.push("/dashboard/notifications");
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(notification.id);
    } else {
      router.push(`/dashboard/notifications/send`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Banner */}
      <div className="relative h-[200px] bg-[#003465] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/header-bg.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
        <h1 className="relative z-10 text-white text-4xl font-bold">Notifications</h1>
      </div>

      {/* Main Content */}
      <div className="px-[30px] py-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleBack}
            className="font-semibold text-2xl text-black gap-3 p-0 hover:bg-transparent"
            variant="ghost"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            View Notification
          </Button>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              className="py-[10px] px-5 pr-11 rounded-[30px] min-w-[318px] bg-white w-full font-medium text-sm text-[#4F504F] border border-[#E6EBF0] outline-none"
            />
            <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* View Notification Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">VIEW NOTIFICATION</h2>
          <Link
            href="/dashboard/notifications/send"
            className="text-[#003465] font-medium text-base hover:underline"
          >
            Send New Notification
          </Link>
        </div>

        {/* Notification Details Card */}
        <div className="bg-[#F7FAFF] rounded-lg shadow-[0px_0px_4px_1px_#0000004D] p-8">
          {/* Date and Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <p className="font-bold text-[#003465] text-lg">{notification.date}</p>
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                className="w-10 h-10 flex items-center justify-center rounded border border-[#003465] bg-white hover:bg-[#EDF0F6] transition-colors"
              >
                <Reply className="size-5 text-[#003465]" />
              </button>
              <button
                onClick={handleDelete}
                className="w-10 h-10 flex items-center justify-center rounded border border-[#EC0909] bg-white hover:bg-red-50 transition-colors"
              >
                <Trash2 className="size-5 text-[#EC0909]" />
              </button>
            </div>
          </div>

          {/* Notification Details */}
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-sm text-black mb-1">Sender:</p>
              <p className="text-sm text-[#737373]">{notification.sender}</p>
            </div>

            <div>
              <p className="font-semibold text-sm text-black mb-1">Title:</p>
              <p className="text-sm text-[#737373]">{notification.title}</p>
            </div>

            <div>
              <p className="font-semibold text-sm text-black mb-1">Organization:</p>
              <p className="text-sm text-[#737373]">{notification.organization}</p>
            </div>

            <div>
              <p className="font-semibold text-sm text-black mb-1">Email Address:</p>
              <p className="text-sm text-[#737373]">{notification.emailAddress}</p>
            </div>

            {notification.time && (
              <div>
                <p className="font-semibold text-sm text-black mb-1">Time:</p>
                <p className="text-sm text-[#737373]">{notification.time}</p>
              </div>
            )}

            <div>
              <p className="font-semibold text-sm text-black mb-1">Message:</p>
              <p className="text-sm text-[#737373] leading-relaxed">{notification.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

