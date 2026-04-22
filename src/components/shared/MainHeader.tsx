"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { SearchIcon, Menu, CheckCircle2, Circle } from "lucide-react";
import Image from "next/image";
import profileImage from "./../../../public/assets/profile.png";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { clearLastSession } from "@/lib/auth-store";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { useOffline } from "@/hooks/useOffline";
import { isTenantAdmin } from "@/utils/permissions";
import { parseTenantProfileResponse, tenantLogoToImageSrc } from "@/utils/profile-api";
import { BellIcon } from "@/components/icons/icon";
import useSWR from "swr";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mutate } from "swr";

interface UserData {
  id?: number;
  email?: string;
  name?: string;
  username?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  logo?: string | null;
  [key: string]: any;
}

interface MainHeaderProps {
  onToggleMobileMenu?: () => void;
}

type HeaderNotification = {
  id: string;
  date: string;
  time?: string;
  sender: string;
  title: string;
  organization: string;
  emailAddress: string;
  message: string;
  isRead: boolean;
};

const MainHeaderContent = ({ onToggleMobileMenu }: MainHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const { status: offlineStatus } = useOffline();
  const [offlineBannerMounted, setOfflineBannerMounted] = useState(false);
  useEffect(() => setOfflineBannerMounted(true), []);

  // Load user data from profile API (GET /tenant/profile returns data.data.tenant + data.data.role)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PROFILE);
        const { profile: profileData } = parseTenantProfileResponse(response);

        if (profileData) {
          setUserData(profileData as UserData);
          Cookies.set("user", JSON.stringify(profileData), {
            expires: 7,
            sameSite: "lax",
            path: "/",
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
  
  const roleArray = Array.isArray(userData?.roles)
    ? userData.roles
    : Array.isArray(userData?.role)
    ? userData.role
    : userData?.role
    ? [userData.role]
    : [];
  const isAdmin = isTenantAdmin(roleArray);
  const profileDisplayName = isAdmin
    ? (userData?.name ?? userData?.domain ?? userData?.organization_name ?? "Organization")
    : fullName;
  const profileRoleLabel = isAdmin ? "ADMIN" : "USER";
  const profilePicture = useMemo(() => {
    const fromTenantLogo = tenantLogoToImageSrc(userData?.logo);
    if (fromTenantLogo) return fromTenantLogo;
    const pic = userData?.profile_picture || userData?.profilePicture;
    if (typeof pic === "string" && pic.trim()) {
      const t = pic.trim();
      if (t.startsWith("/") || t.startsWith("http://") || t.startsWith("https://") || t.startsWith("data:")) {
        return t;
      }
    }
    return profileImage;
  }, [userData?.logo, userData?.profile_picture, userData?.profilePicture]);

  const profileImageUnoptimized =
    typeof profilePicture === "string" &&
    (profilePicture.startsWith("http") || profilePicture.startsWith("data:"));

  const { data: unreadResponse } = useSWR(
    isAdmin ? API_ENDPOINTS.GET_NOTIFICATION_UNREAD : null,
    async (url: string) => processRequestOfflineAuth("get", url),
    {
      revalidateOnFocus: true,
      refreshInterval: 10000,
      dedupingInterval: 3000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );
  const unreadCount = useMemo(() => {
    const body = unreadResponse?.data ?? unreadResponse;
    const nested = body?.data ?? body;
    const value =
      nested?.count ??
      nested?.unread ??
      nested?.unreadCount ??
      nested?.unread_count ??
      body?.count ??
      body?.unread ??
      body?.unreadCount ??
      (Array.isArray(nested?.items) ? nested.items.length : undefined) ??
      (Array.isArray(nested) ? nested.length : undefined) ??
      0;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
  }, [unreadResponse]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<HeaderNotification | null>(null);
  const [isNotificationDetailOpen, setIsNotificationDetailOpen] = useState(false);
  /** Optimistic decrement after marking one notification read (until SWR refetch). */
  const [unreadOptimisticDelta, setUnreadOptimisticDelta] = useState(0);

  useEffect(() => {
    setUnreadOptimisticDelta(0);
  }, [unreadResponse]);

  const displayUnreadCount = Math.max(0, unreadCount - unreadOptimisticDelta);

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
    setIsProfileOpen(false);
  };

  const { data: notificationsResponse, isLoading: isNotificationsLoading } = useSWR(
    isAdmin ? API_ENDPOINTS.GET_NOTIFICATIONS : null,
    async (url: string) => processRequestOfflineAuth("get", url),
    {
      revalidateOnFocus: true,
      refreshInterval: 10000,
      dedupingInterval: 3000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );

  const notifications = useMemo<HeaderNotification[]>(() => {
    const response = notificationsResponse;
    const raw = Array.isArray(response?.data)
      ? response.data
      : Array.isArray((response as any)?.data?.data)
      ? (response as any).data.data
      : Array.isArray(response)
      ? response
      : [];

    return raw.map((n: any) => {
      const notify = n.notify ?? {};
      const dateValue = n.createdAt ?? n.created_at ?? n.date;
      const status = String(n.status ?? notify.status ?? "").toLowerCase();
      const isRead =
        n.isRead === true ||
        n.is_read === true ||
        status === "read" ||
        status === "opened" ||
        status === "seen";

      return {
        id: String(n.id ?? n.notificationId ?? ""),
        date: dateValue ? new Date(dateValue).toLocaleDateString() : "",
        time: dateValue
          ? new Date(dateValue).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })
          : "",
        sender: notify.sender ?? n.sender ?? n.from ?? "System",
        title: notify.title ?? n.title ?? n.subject ?? "Notification",
        organization: n.organization ?? n.tenant?.name ?? notify.type ?? "",
        emailAddress: n.emailAddress ?? n.email ?? "",
        message: notify.message ?? n.message ?? n.body ?? n.content ?? "",
        isRead,
      };
    });
  }, [notificationsResponse]);

  const openNotificationDetails = async (notification: HeaderNotification) => {
    setSelectedNotification(notification);
    setIsNotificationDetailOpen(true);
    setIsNotificationsOpen(false);

    if (!notification.isRead) {
      setUnreadOptimisticDelta((d) => d + 1);
      try {
        await processRequestOfflineAuth("post", API_ENDPOINTS.POST_NOTIFICATION_READ, {
          notificationId: Number(notification.id) || notification.id,
        });
        await Promise.all([
          mutate(API_ENDPOINTS.GET_NOTIFICATION_UNREAD),
          mutate(API_ENDPOINTS.GET_NOTIFICATIONS),
        ]);
      } catch (error) {
        setUnreadOptimisticDelta((d) => Math.max(0, d - 1));
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  // View profile handler (tenant_admin only; tenant_user has no profile page access)
  const handleViewProfile = () => {
    const firstSegment = pathname?.split("/")[1];
    const reserved = ["dashboard", "login", "forgot-password", "reset-password", "verify-login-otp"];
    const hasTenantInPath = Boolean(firstSegment && !reserved.includes(firstSegment));
    const profilePath = hasTenantInPath ? `/${firstSegment}/dashboard/profile` : "/dashboard/profile";
    router.push(profilePath);
    setIsProfileOpen(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      Cookies.remove("user");
      Cookies.remove("auth_user_id");
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
        className="relative flex items-center justify-center px-2 py-[10px] rounded-[60px] bg-white shadow-[4px_4px_4px_0px_#B7B5B566] flex-1 min-w-0 max-w-xl"
      >
        <input
          type="text"
          placeholder={
            isAdmin
              ? "Search Departments, Employees, Patients, Schedule and Appointment.."
              : "Search Departments, Patients, Schedule and Appointment.."
          }
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
        {/* Notification Button (Tenant_Admin only) */}
        {isAdmin && (
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <button
                className="relative flex items-center justify-center bg-white hover:bg-gray-50 transition-colors w-[40px] h-[40px] rounded-[10px] shadow-[0px_4px_25px_0px_#0000001A] cursor-pointer"
                aria-label="Notifications"
              >
                <BellIcon className="w-[20px] h-[20px] text-[#003465]" />
                {displayUnreadCount > 0 && (
                  <span className="pointer-events-none absolute -top-2 -right-2 z-10 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EC0909] text-white text-[10px] font-semibold flex items-center justify-center leading-none shadow-sm ring-2 ring-white">
                    {displayUnreadCount > 99 ? "99+" : displayUnreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[420px] p-0 bg-white border border-gray-200 shadow-lg rounded-xl"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#003465]">Notifications</h3>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    router.push("/dashboard/notifications");
                  }}
                  className="text-xs font-medium text-[#003465] hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {isNotificationsLoading ? (
                  <div className="py-8 text-center text-sm text-[#737373]">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#737373]">
                    No notifications found.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => openNotificationDetails(item)}
                        className="w-full text-left px-4 py-3 hover:bg-[#F7FAFF] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1">
                            {item.isRead ? (
                              <CheckCircle2 className="size-4 text-[#3FA907]" />
                            ) : (
                              <Circle className="size-4 fill-[#EC0909] text-[#EC0909]" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#003465] truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-[#595959] truncate">
                              {item.message}
                            </p>
                            <p className="text-[11px] text-[#9CA3AF] mt-1">
                              {item.date}
                              {item.time ? ` • ${item.time}` : ""}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

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
                  unoptimized={profileImageUnoptimized}
              className="aspect-square w-full h-full object-cover"
            />
          </span>
              <div className="hidden md:flex flex-col">
                <p className="text-sm font-semibold text-[#003465] mb-1">
                  {profileDisplayName || "-"}
                </p>
                <p className="text-xs font-medium text-[#595959]">
                  {profileRoleLabel}
                </p>
              </div>
        </div>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 bg-white border border-gray-200 shadow-lg" align="end">
            <div className="p-2">
              {isAdmin && (
                <button
                  onClick={handleViewProfile}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                >
                  View profile
                </button>
              )}
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

      </div>
      </div>

      {/* Single notification detail popup */}
      <AlertDialog
        open={isNotificationDetailOpen}
        onOpenChange={setIsNotificationDetailOpen}
      >
        <AlertDialogContent className="bg-white max-w-xl !z-[120]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold text-[#003465]">
              Notification Details
            </AlertDialogTitle>
          </AlertDialogHeader>
          {selectedNotification ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedNotification.isRead ? (
                  <CheckCircle2 className="size-4 text-[#3FA907]" />
                ) : (
                  <Circle className="size-4 fill-[#EC0909] text-[#EC0909]" />
                )}
                <span className="text-sm text-[#595959]">
                  {selectedNotification.isRead ? "Read" : "Unread"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-black mb-1">Title</p>
                <p className="text-sm text-[#737373]">{selectedNotification.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-black mb-1">Sender</p>
                <p className="text-sm text-[#737373]">{selectedNotification.sender}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-black mb-1">Message</p>
                <p className="text-sm text-[#737373] leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>
              <div className="text-xs text-[#9CA3AF]">
                {selectedNotification.date}
                {selectedNotification.time ? ` • ${selectedNotification.time}` : ""}
              </div>
              <AlertDialogFooter className="flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:space-x-2">
                <AlertDialogCancel className="h-[44px] border-[#003465] text-[#003465] hover:bg-gray-50 mt-0">
                  Close
                </AlertDialogCancel>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationDetailOpen(false);
                    router.push(`/dashboard/notifications/${selectedNotification.id}`);
                  }}
                  className="h-[44px] px-4 bg-[#003465] hover:bg-[#003465]/90 text-white rounded-md text-sm font-medium"
                >
                  Open full notification
                </button>
              </AlertDialogFooter>
            </div>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
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
