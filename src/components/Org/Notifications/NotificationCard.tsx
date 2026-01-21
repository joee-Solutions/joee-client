"use client";

import { Eye, Trash2 } from "lucide-react";

export interface Notification {
  id: string;
  date: string;
  sender: string;
  title: string;
  organization: string;
  emailAddress: string;
  message: string;
}

interface NotificationCardProps {
  notification: Notification;
  index: number;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationCard({
  notification,
  index,
  onView,
  onDelete,
}: NotificationCardProps) {
  return (
    <div
      className={`p-5 rounded-lg border border-[#E6EBF0] ${
        index % 2 === 0 ? "bg-white" : "bg-[#F7FAFF]"
      }`}
    >
      <div className="flex items-start gap-6">
        {/* Date */}
        <div className="min-w-[120px]">
          <p className="font-bold text-[#003465] text-sm">{notification.date}</p>
        </div>

        {/* Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-[#737373]">
              <span className="font-semibold">Sender:</span> {notification.sender}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#737373]">
              <span className="font-semibold">Title:</span> {notification.title}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#737373]">
              <span className="font-semibold">Organization:</span> {notification.organization}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#737373]">
              <span className="font-semibold">Email Address:</span> {notification.emailAddress}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-[#737373]">
              <span className="font-semibold">Message:</span> {notification.message.substring(0, 100)}...
            </p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(notification.id)}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#BFBFBF] bg-white hover:bg-[#EDF0F6] transition-colors"
          >
            <Eye className="size-4 text-[#003465]" />
          </button>
          <button
            onClick={() => onDelete(notification.id)}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#EC0909] bg-white hover:bg-red-50 transition-colors"
          >
            <Trash2 className="size-4 text-[#EC0909]" />
          </button>
        </div>
      </div>
    </div>
  );
}

