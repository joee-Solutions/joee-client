"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import NotificationCard, { Notification } from "./NotificationCard";

interface NotificationListProps {
  notifications: Notification[];
  onViewNotification: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

export default function NotificationList({
  notifications,
  onViewNotification,
  onDeleteNotification,
}: NotificationListProps) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(4);
  const [activeTab, setActiveTab] = useState<"all" | "received">("all");
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        notification.sender.toLowerCase().includes(searchLower) ||
        notification.title.toLowerCase().includes(searchLower) ||
        notification.organization.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header Banner */}
      <div className="relative h-[200px] bg-[#003465] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/header-bg.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
        <h1 className="relative z-10 text-white text-4xl font-bold">Notifications</h1>
      </div>

      {/* Main Content */}
      <div className="px-[30px] py-10">
        {/* Sub-header with Search */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-normal text-black">Notifications</h2>
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

        {/* Notification History Section */}
        <section className="bg-white rounded-lg shadow-[0px_0px_4px_1px_#0000004D] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">NOTIFICATION HISTORY</h3>
            <Link
              href="/dashboard/notifications/send"
              className="text-[#003465] font-medium text-base hover:underline"
            >
              Send New Notification
            </Link>
          </div>

          {/* Filter Tabs and Show Dropdown */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-2 rounded font-medium text-sm ${
                  activeTab === "all"
                    ? "bg-[#003465] text-white"
                    : "bg-[#F3F3F3] text-black"
                }`}
              >
                All Notifications
              </button>
              <button
                onClick={() => setActiveTab("received")}
                className={`px-6 py-2 rounded font-medium text-sm ${
                  activeTab === "received"
                    ? "bg-[#003465] text-white"
                    : "bg-[#F3F3F3] text-black"
                }`}
              >
                Received
              </button>
            </div>
            <ListView pageSize={pageSize} setPageSize={setPageSize} />
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            {paginatedNotifications.map((notification, index) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={index}
                onView={onViewNotification}
                onDelete={onDeleteNotification}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredNotifications.length > 0 && (
            <Pagination
              dataLength={filteredNotifications.length}
              pageSize={pageSize}
              numOfPages={totalPages}
              handlePageClick={handlePageClick}
            />
          )}
        </section>
      </div>
    </div>
  );
}

