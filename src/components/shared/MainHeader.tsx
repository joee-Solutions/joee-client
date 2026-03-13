"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { SearchIcon, Menu } from "lucide-react";
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
import { parseTenantProfileResponse } from "@/utils/profile-api";

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
  const profilePicture = userData?.profile_picture || userData?.profilePicture || profileImage;

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
