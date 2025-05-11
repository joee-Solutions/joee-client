"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import userProfileImage from "./../../../../../../public/assets/orgProfileImage.png";
import { useState } from "react";
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
import { useRouter } from "next/navigation";

const tabBtns = [
  {
    icon: UserIcon,
    label: "Personal Information",
    currTab: 1,
  },
  {
    icon: PasswordLockIcon,
    label: "Change Password",
    currTab: 2,
  },
  {
    icon: CloudBackupIcon,
    label: "Backup Restore",
    currTab: 3,
  },
  {
    icon: SettingsIcon,
    label: "Settings",
    currTab: 4,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [currTab, setCurrTab] = useState<number>(1);

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
                <Image
                  src={userProfileImage}
                  alt="user profile picture"
                  width={180}
                  height={180}
                  className="rounded-full object-cover"
                />
                <div className="text-center">
                  <p className="font-semibold text-2xl text-black">
                    Mr. Richard Peller
                  </p>
                  <p className="text-xs font-normal text-[#999999] mt-1">
                    Admin
                  </p>
                  <p className="text-xs font-medium text-[#595959] mt-1">
                    +234-123-4567-890
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                {tabBtns.map((tab) => {
                  if (tab.currTab === 3) {
                    return (
                      <Button
                        key={tab.currTab}
                        onClick={() =>
                          router.push("/dashboard/settings/backup")
                        }
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
                <AdminProfilePage />
              ) : currTab === 2 ? (
                <ChangeAdminPasswordPage />
              ) : (
                <Settings />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
