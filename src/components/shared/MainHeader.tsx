"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { SearchIcon, Menu, X } from "lucide-react";
import { BellIcon } from "../icons/icon";
import Image from "next/image";
import profileImage from "./../../../public/assets/profile.png";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { clearLastSession } from "@/lib/auth-store";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import useSWR, { mutate } from "swr";
import { authFectcher } from "@/hooks/swr";
import { useOffline } from "@/hooks/useOffline";

interface UserData {
  id?: number;
  email?: string;
  name?: string;
  username?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  [key: string]: any;
}

interface MainHeaderProps {
  onToggleMobileMenu?: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  sender?: string;
  createdAt?: string;
  read?: boolean;
  isRead?: boolean;
  readAt?: string | null;
  tenant?: {
    name: string;
  };
}

const MainHeaderContent = ({ onToggleMobileMenu }: MainHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);

  const { status: offlineStatus } = useOffline();
  const [offlineBannerMounted, setOfflineBannerMounted] = useState(false);
  useEffect(() => setOfflineBannerMounted(true), []);

  // Fetch notifications using SWR
  const { data: notificationsData, error: notificationsError } = useSWR(
    API_ENDPOINTS.GET_NOTIFICATIONS,
    authFectcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: unreadData } = useSWR(
    API_ENDPOINTS.GET_NOTIFICATION_UNREAD,
    authFectcher,
    { revalidateOnFocus: true, refreshInterval: 30000 }
  );

  // Process notifications data
  const processedNotifications = useMemo(() => {
    if (!notificationsData) return [];

    // Extract notifications from different response structures
    let rawNotifications: any[] = [];
    
    if (Array.isArray(notificationsData)) {
      rawNotifications = notificationsData;
    } else if (Array.isArray(notificationsData?.data)) {
      rawNotifications = notificationsData.data;
    } else if (Array.isArray(notificationsData?.data?.data)) {
      rawNotifications = notificationsData.data.data;
    } else if (Array.isArray(notificationsData?.results)) {
      rawNotifications = notificationsData.results;
    } else if (Array.isArray(notificationsData?.data?.results)) {
      rawNotifications = notificationsData.data.results;
    }

    // Flatten nested arrays if present
    if (rawNotifications.length > 0 && Array.isArray(rawNotifications[0])) {
      rawNotifications = rawNotifications.flat();
    }

    // Load read notification IDs from localStorage
    let readNotificationIds: number[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('readNotifications');
        if (stored) {
          readNotificationIds = JSON.parse(stored);
        }
      } catch (error) {
        console.warn("Failed to load read notifications from localStorage:", error);
      }
    }

    // Merge read status with API data (support nested notify: { title, message, sender } and top-level fields)
    const notificationsWithReadStatus = rawNotifications.map((notification: any) => {
      const notify = notification.notify ?? {};
      const isRead = readNotificationIds.includes(notification.id) ||
                    notification.status === "read" ||
                    notification.read === true ||
                    notification.isRead === true ||
                    (notification.readAt && notification.readAt !== null);

      return {
        id: notification.id,
        title: notify.title ?? notification.title ?? notification.subject ?? "Notification",
        message: notify.message ?? notification.message ?? notification.body ?? notification.content ?? "",
        sender: notify.sender ?? notification.sender ?? notification.from ?? undefined,
        createdAt: notification.createdAt ?? notification.created_at ?? notification.date ?? notification.timestamp,
        read: isRead,
        isRead: isRead,
        readAt: isRead ? (notification.readAt ?? notification.read_at ?? new Date().toISOString()) : null,
        tenant: notification.tenant ?? notification.organization ?? undefined,
      };
    });

    // Sort by createdAt (newest first)
    const sorted = notificationsWithReadStatus.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Limit to top 10
    return sorted.slice(0, 10);
  }, [notificationsData]);

  // Unread count: prefer API GET /tenant/notification/unread, else derive from list
  const unreadCount = useMemo(() => {
    if (unreadData != null) {
      const n = typeof unreadData === "number" ? unreadData : (unreadData as any)?.count ?? (unreadData as any)?.unread ?? (unreadData as any)?.data?.count ?? (unreadData as any)?.data?.unread;
      if (typeof n === "number" && !isNaN(n)) return n;
    }
    return processedNotifications.filter((notification) => {
      return notification.read !== true &&
             notification.isRead !== true &&
             (!notification.readAt || notification.readAt === null);
    }).length;
  }, [processedNotifications, unreadData]);

  // Load user data from profile API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PROFILE);
        
        // Extract data from response (handle different response structures)
        const profileData = response?.data || response;
        
        if (profileData) {
          console.log("Loaded user data from API:", profileData);
          setUserData(profileData);
          
          // Update cookie with fresh data for fallback
          Cookies.set("user", JSON.stringify(profileData), { 
            expires: 7, // 7 days
            sameSite: 'lax',
            path: '/'
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch profile from API:", error);
        
        // Fallback to cookie data if API fails
        const userCookie = Cookies.get("user");
        if (userCookie) {
          try {
            const parsedUser = JSON.parse(userCookie);
            console.log("Using fallback user data from cookie:", parsedUser);
            setUserData(parsedUser);
          } catch (parseError) {
            console.error("Failed to parse user data from cookies:", parseError);
          }
        }
        
        // Only show error toast if we don't have cookie fallback
        if (!userCookie) {
          if (error?.response?.status === 403 || error?.response?.status === 401) {
            // Don't show error for auth issues, just use fallback
            console.warn("Auth error loading profile, using cookie fallback if available");
          } else {
            toast.error("Failed to load profile data", { toastId: "profile-load-error" });
          }
        }
      }
    };
    
    loadUserData();
  }, []);

  // Sync search query with URL params
  useEffect(() => {
    if (pathname?.includes("/organization")) {
      const query = searchParams?.get("search") || "";
      setSearchQuery(query);
    }
  }, [pathname, searchParams]);

  // Extract user info
  const fullName = userData
    ? `${userData.first_name || userData.firstname || userData.name || ""} ${userData.last_name || userData.lastname || ""}`.trim() ||
      userData.username ||
      userData.email ||
      userData.firstName ||
      userData.lastName ||
      "User"
    : userData === null ? "User" : "Loading...";
  
  // Extract role - handle array format or string
  const roleArray = Array.isArray(userData?.roles) ? userData.roles : userData?.role ? [userData.role] : [];
  const role = roleArray.length > 0 ? roleArray[0] : userData?.role || "Admin";
  const profilePicture = userData?.profile_picture || userData?.profilePicture || profileImage;

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    setIsNotificationOpen(false);
    
    // Mark as read if not already read
    if (notification.read !== true && notification.isRead !== true && (!notification.readAt || notification.readAt === null)) {
      await markNotificationAsRead(notification.id);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    setMarkingAsRead(notificationId);
    try {
      await processRequestOfflineAuth("post", API_ENDPOINTS.POST_NOTIFICATION_READ, { notificationId });
      mutate(API_ENDPOINTS.GET_NOTIFICATION_UNREAD);
      if (typeof window !== 'undefined') {
        const storedReadNotifications = localStorage.getItem('readNotifications');
        const readIds = storedReadNotifications ? JSON.parse(storedReadNotifications) : [];
        if (!readIds.includes(notificationId)) {
          readIds.push(notificationId);
          localStorage.setItem('readNotifications', JSON.stringify(readIds));
        }
      }
      
      // Update SWR cache optimistically
      mutate(API_ENDPOINTS.GET_NOTIFICATIONS, (currentData: any) => {
        if (!currentData) return currentData;
        
        // Handle different response structures
        const updateNotification = (notifications: any[]): any[] => {
          return notifications.map((notif: any) => {
            if (notif.id === notificationId) {
              return {
                ...notif,
                read: true,
                isRead: true,
                readAt: new Date().toISOString(),
              };
            }
            return notif;
          });
        };

        if (Array.isArray(currentData)) {
          return updateNotification(currentData);
        } else if (Array.isArray(currentData?.data)) {
          return { ...currentData, data: updateNotification(currentData.data) };
        } else if (Array.isArray(currentData?.data?.data)) {
          return { ...currentData, data: { ...currentData.data, data: updateNotification(currentData.data.data) } };
        } else if (Array.isArray(currentData?.results)) {
          return { ...currentData, results: updateNotification(currentData.results) };
        }
        
        return currentData;
      }, false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Handle view all notifications
  const handleViewAllNotifications = () => {
    router.push("/dashboard/notifications");
    setIsNotificationOpen(false);
  };

  // Search handler - navigate to search page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/dashboard/search");
    }
  };

  // Settings handler
  const handleSettings = () => {
    router.push("/dashboard/settings");
  };

  // View profile handler
  const handleViewProfile = () => {
    router.push("/dashboard/profile");
    setIsProfileOpen(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      Cookies.remove("user");
      Cookies.remove("mfa_token");
      Cookies.remove("otp_verified");
      await clearLastSession();
      toast.success("Logged out successfully", { toastId: "logout-success" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout", { toastId: "logout-error" });
    }
  };

  // Show error toast if notifications fail to load
  useEffect(() => {
    if (notificationsError) {
      console.error("Failed to load notifications:", notificationsError);
      // Don't show toast for 403/401 errors - they're handled gracefully
      if (notificationsError?.response?.status !== 403 && notificationsError?.response?.status !== 401) {
        toast.error("Failed to load notifications", { toastId: "notifications-load-error" });
      }
    }
  }, [notificationsError]);

  return (
    <header className="flex flex-col shadow-[0px_4px_25px_0px_#0000001A]">
      {/* Offline / Syncing indicator — only after mount to avoid hydration mismatch */}
      {offlineBannerMounted && offlineStatus.isOffline && (
        <div className="bg-amber-500 text-white text-center py-1.5 px-2 text-sm font-medium">
          You&apos;re offline — changes will sync when you&apos;re back online
        </div>
      )}
      {offlineBannerMounted && !offlineStatus.isOffline && offlineStatus.queuedRequestsSize > 0 && (
        <div className="bg-blue-600 text-white text-center py-1.5 px-2 text-sm font-medium">
          Syncing your changes...
        </div>
      )}
      <div className="flex items-center justify-between gap-3 md:gap-5 h-[100px] md:h-[150px] px-4 md:px-[24px] py-6 md:py-12">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden flex items-center justify-center bg-white hover:bg-gray-50 transition-colors w-[40px] h-[40px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A] cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-[#003465]" />
      </button>

      {/* Search Bar - Made longer */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center justify-center px-2 py-[10px] rounded-[60px] bg-white shadow-[4px_4px_4px_0px_#B7B5B566] flex-1 min-w-0 max-w-2xl"
      >
        <input
          type="text"
          placeholder="Search organizations, employees, patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 md:px-5 h-[40px] md:h-[50px] rounded-[30px] pl-3 md:pl-5 pr-10 md:pr-12 bg-[#E4E8F2] outline-none focus:outline-2 focus:outline-[#003465] w-full text-sm md:text-base [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />
        <button
          type="submit"
          className="absolute right-6 md:right-10 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <SearchIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </button>
      </form>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications Button */}
        <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <PopoverTrigger asChild>
            <span className="relative flex items-center justify-center bg-white w-[40px] h-[40px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A] cursor-pointer hover:bg-gray-50 transition-colors">
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {processedNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                processedNotifications.map((notification) => {
                  const isUnread = notification.read !== true && 
                                  notification.isRead !== true && 
                                  (!notification.readAt || notification.readAt === null);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b transition-colors ${
                        isUnread ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className="font-semibold text-sm text-[#003465] cursor-pointer hover:underline"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {notification.title}
                          </p>
                          <p
                            className="text-xs text-gray-600 mt-1 line-clamp-2 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {processedNotifications.length > 0 && (
              <div className="p-3 border-t text-center">
                <button
                  className="text-sm text-[#003465] hover:underline"
                  onClick={handleViewAllNotifications}
                >
                  View all notification
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Settings Button */}
        <button
          onClick={handleSettings}
          className="flex items-center justify-center bg-white hover:bg-gray-50 transition-colors w-[40px] h-[40px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A] cursor-pointer"
        >
          <IoSettingsSharp className="w-[24px] h-[24px] text-[#EC0909]" />
        </button>

        {/* User Profile */}
        <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-[10.32px] cursor-pointer hover:opacity-80 transition-opacity">
              <span className="block w-[40px] h-[40px] rounded-full overflow-hidden">
            <Image
                  src={profilePicture}
              alt="profile image"
                  width={40}
                  height={40}
              className="aspect-square w-full h-full object-cover"
            />
          </span>
              <div className="hidden md:flex flex-col">
            <p className="text-sm font-semibold text-[#003465] mb-1">
                  {fullName || "-"}
                </p>
                <p className="text-xs font-medium text-[#595959]">
                  {role.split("_").join(" ")}
            </p>
          </div>
        </div>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 bg-white border border-gray-200 shadow-lg" align="end">
            <div className="p-2">
              <button
                onClick={handleViewProfile}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleSettings}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
              >
                Settings
              </button>
              <div className="border-t my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm rounded text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Notification Detail Modal */}
        {showNotificationModal && selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" aria-modal="true">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[#003465] pr-4">
                  {selectedNotification.title}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  onClick={() => {
                    setShowNotificationModal(false);
                    setSelectedNotification(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {selectedNotification.sender && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Sender</p>
                  <p className="text-base text-gray-800">{selectedNotification.sender}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Message</p>
                <p className="text-base text-gray-800 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {selectedNotification.createdAt && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Date</p>
                    <p className="text-base text-gray-800">
                      {new Date(selectedNotification.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedNotification.tenant && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Tenant</p>
                    <p className="text-base text-gray-800">
                      {typeof selectedNotification.tenant === "object" && selectedNotification.tenant !== null && "name" in selectedNotification.tenant
                        ? (selectedNotification.tenant as { name: string }).name
                        : "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setShowNotificationModal(false);
                  setSelectedNotification(null);
                }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
};

const MainHeader = ({ onToggleMobileMenu }: MainHeaderProps) => {
  return (
    <Suspense
      fallback={
        <header className="flex items-center justify-between gap-3 md:gap-5 h-[100px] md:h-[150px] px-4 md:px-[24px] py-6 md:py-12 shadow-[0px_4px_25px_0px_#0000001A]">
          <div className="lg:hidden w-[40px] h-[40px] rounded-[10px] bg-gray-200 animate-pulse" />
          <div className="relative flex items-center justify-center px-2 py-[10px] rounded-[60px] bg-white shadow-[4px_4px_4px_0px_#B7B5B566] basis-[50%] animate-pulse flex-1 lg:flex-initial">
            <div className="w-full h-[40px] md:h-[50px] rounded-[30px] bg-gray-200" />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-gray-200 animate-pulse" />
            <div className="w-[40px] h-[40px] rounded-[10px] bg-gray-200 animate-pulse" />
            <div className="flex items-center gap-[10.32px]">
              <div className="w-[40px] h-[40px] rounded-full bg-gray-200 animate-pulse" />
              <div className="hidden md:flex flex-col gap-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </header>
      }
    >
      <MainHeaderContent onToggleMobileMenu={onToggleMobileMenu} />
    </Suspense>
  );
};

export default MainHeader;
