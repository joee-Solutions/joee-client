"use client";
import { CloudIcon, WebIcon } from "@/components/icons/icon";
import { BookUser, CircleUserRound, Hospital, Lock, Users } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import EditOrg from "../organization/EditOrg";
import Image from "next/image";
import profileImage from "@public/assets/profile.png";
import Link from "next/link";
import ProfileForm from "@/components/admin/ProfileForm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ChangePasswordComponent from "@/components/admin/ChangePasswordComponent";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { parseTenantProfileResponse, tenantLogoToImageSrc } from "@/utils/profile-api";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface UserProfile {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  profile_picture?: string;
  profilePicture?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  company?: string;
  organization?: string;
  domain?: string;
  logo?: string | null;
  [key: string]: any;
}

const tabs = ["Admin Profile", "Change Password"];

const ProfilePage = () => {
  const [tab, setTab] = useState("Admin Profile");
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      // First try to load from cookie (set during login)
      const userCookie = Cookies.get("user");
      if (userCookie) {
        try {
          const parsedUser = JSON.parse(userCookie);
          setProfileData(parsedUser);
        } catch (error) {
          console.error("Failed to parse user cookie:", error);
        }
      }

      // Then fetch fresh data from API (GET /tenant/profile returns data.data.tenant + data.data.role)
      try {
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PROFILE);
        const { profile } = parseTenantProfileResponse(response);
        if (profile) {
          setProfileData(profile as UserProfile);
          Cookies.set("user", JSON.stringify(profile), {
            expires: 7,
            sameSite: "lax",
            path: "/",
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch profile from API:", error);
        // If API fails, keep using cookie data if available
        // Don't show error toast if we have cookie data
        if (!userCookie) {
          toast.error("Failed to load profile data", { toastId: "profile-load-error" });
        }
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      if (!Cookies.get("user")) {
        toast.error("Failed to load profile data", { toastId: "profile-load-error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Extract user info
  const fullName = profileData
    ? `${profileData.first_name || profileData.firstName || profileData.name || ""} ${profileData.last_name || profileData.lastName || ""}`.trim() ||
      profileData.username ||
      profileData.email ||
      "User"
    : "Loading...";
  
  const profilePicture = useMemo(() => {
    const fromTenantLogo = tenantLogoToImageSrc(profileData?.logo);
    if (fromTenantLogo) return fromTenantLogo;
    const pic = profileData?.profile_picture || profileData?.profilePicture;
    if (typeof pic === "string" && pic.trim()) {
      const t = pic.trim();
      if (t.startsWith("/") || t.startsWith("http://") || t.startsWith("https://") || t.startsWith("data:")) {
        return t;
      }
    }
    return profileImage;
  }, [profileData?.logo, profileData?.profile_picture, profileData?.profilePicture]);

  const profileImageUnoptimized =
    typeof profilePicture === "string" &&
    (profilePicture.startsWith("http") || profilePicture.startsWith("data:"));

  const organization = profileData?.domain || profileData?.company || profileData?.organization || "Joee Solutions";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
      <aside className="pb-10 px-[54px] pt-[34px] pt shadow-[0px_0px_4px_1px_#0000004D] rounded-md sm:min-h-[568px] max-h-[700px]">
        <div className="flex flex-col gap-[15px] items-center mb-[30px]">
          <Image
            src={profilePicture}
            alt="Profile image"
            width={180}
            height={180}
            unoptimized={profileImageUnoptimized}
            className="rounded-full object-cover"
          />
          <div className="text-center">
            <p className="font-semibold text-2xl text-black">{fullName}</p>
            <p className="text-xs font-semibold text-[#595959] mt-1">
              {organization}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {tabs.map((item) => (
            <Button
              key={item}
              onClick={() => setTab(item)}
              className={cn(
                `font-medium h-[60px] flex items-center justify-start text-sm ${
                  tab === item
                    ? "text-[#003465] bg-[#D9EDFF]"
                    : "text-[#737373] bg-[#F3F3F3]"
                } gap-1 py-[18px] px-7`
              )}
            >
              {item === "Admin Profile" ? (
                <CircleUserRound />
              ) : (
                <Lock className="" />
              )}
              {item}
            </Button>
          ))}
          <Link
            href="/dashboard/admin/create"
            className={cn(
              `font-medium h-[60px] flex items-center justify-start text-sm text-[#737373] bg-[#F3F3F3] gap-1 py-[18px] px-7`
            )}
          >
            <BookUser className="" />
            Create Admin
          </Link>
          <Link
            href="/dashboard/admin/list"
            className={cn(
              `font-medium h-[60px] flex items-center justify-start text-sm text-[#737373] bg-[#F3F3F3] gap-1 py-[18px] px-7`
            )}
          >
            <Users className="fill-current" />
            Admin List
          </Link>
        </div>
      </aside>
      <div className="px-10 pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md h-fit">
        {tab === "Change Password" ? (
          <ChangePasswordComponent onPasswordChange={loadProfile} />
        ) : (
          <ProfileForm profileData={profileData} onProfileUpdate={loadProfile} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
