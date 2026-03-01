"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import userProfileImage from "./../../../../../../public/assets/orgProfileImage.png";
import { useState, useEffect } from "react";
import {
  CloudBackupIcon,
  PasswordLockIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/icons/icon";
import SectionHeader from "@/components/shared/SectionHeader";
import AdminProfilePage from "./AdminProfile";
import ChangeAdminPasswordPage from "./ChangeAdminPassword";
import Settings from "./Settings";
import { useRouter, useParams, usePathname } from "next/navigation";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

const tabBtns = [
  { icon: UserIcon, label: "Personal Information", currTab: 1 },
  { icon: PasswordLockIcon, label: "Change Password", currTab: 2 },
  { icon: CloudBackupIcon, label: "Backup Restore", currTab: 3 },
  { icon: SettingsIcon, label: "Settings", currTab: 4 },
];

export type ProfileData = {
  id?: number;
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  address_metadata?: { address?: string; city?: string; state?: string; zip?: string; country?: string };
  website?: string;
  domain?: string;
  logo?: string | null;
  status?: string;
  [key: string]: any;
};

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const tenant = (params?.tenant as string) || "";
  const [currTab, setCurrTab] = useState<number>(1);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PROFILE);
        const data = response?.data ?? (response as any)?.data?.data ?? response;
        if (data) setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayName = profile?.name ?? "—";
  const displayEmail = profile?.email ?? "—";
  const displayPhone = profile?.phone_number ?? "—";

  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const isSubdomainMode = segments[0] === "dashboard";
  const backupHref = isSubdomainMode ? "/dashboard/settings/backup" : tenant ? `/${tenant}/dashboard/settings/backup` : "/dashboard/settings/backup";

  return (
    <>
      <SectionHeader title="Settings" />
      <section className="py-10 px-5">
        <div className="flex flex-col gap-[30px]">
          <div>
            <h2 className="font-semibold text-2xl text-black">Settings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
            <aside className="pb-10 px-[54px] pt-[34px] pt shadow-[0px_0px_4px_1px_#0000004D] h-max rounded-md">
              <div className="flex flex-col gap-[15px] items-center mb-[30px]">
                {profile?.logo ? (
                  <Image
                    src={profile.logo}
                    alt="Organization logo"
                    width={180}
                    height={180}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src={userProfileImage}
                    alt="user profile picture"
                    width={180}
                    height={180}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="text-center">
                  <p className="font-semibold text-2xl text-black">
                    {profileLoading ? "Loading..." : displayName}
                  </p>
                  <p className="text-xs font-normal text-[#999999] mt-1">
                    {profile?.domain ?? "Organization"}
                  </p>
                  <p className="text-xs font-medium text-[#595959] mt-1">
                    {displayPhone}
                  </p>
                  <p className="text-xs font-medium text-[#595959] mt-1 truncate max-w-[200px]" title={displayEmail}>
                    {displayEmail}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                {tabBtns.map((tab) => {
                  if (tab.currTab === 3) {
                    return (
                      <Button
                        key={tab.currTab}
                        onClick={() => router.push(backupHref)}
                        className={`font-medium h-[60px] justify-start text-sm ${
                          currTab === tab.currTab
                            ? "text-[#003465] bg-[#D9EDFF]"
                            : "text-[#737373] bg-[#F3F3F3]"
                        } gap-1 py-[18px] px-7`}
                      >
                        <tab.icon
                          fill={currTab === tab.currTab ? "#003465" : "#737373"}
                        />
                        {tab.label}
                      </Button>
                    );
                  }

                  return (
                    <Button
                      key={tab.currTab}
                      onClick={() => setCurrTab(tab.currTab)}
                      className={`font-medium h-[60px] justify-start text-sm ${
                        currTab === tab.currTab
                          ? "text-[#003465] bg-[#D9EDFF]"
                          : "text-[#737373] bg-[#F3F3F3]"
                      } gap-1 py-[18px] px-7`}
                    >
                      <tab.icon
                        fill={currTab === tab.currTab ? "#003465" : "#737373"}
                      />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
            </aside>
            <div className="px-[25px] pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md overflow-hidden">
              {currTab === 1 ? (
                <AdminProfilePage initialData={profile} />
              ) : currTab === 2 ? (
                <ChangeAdminPasswordPage />
              ) : (
                <Settings initialData={profile} />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
