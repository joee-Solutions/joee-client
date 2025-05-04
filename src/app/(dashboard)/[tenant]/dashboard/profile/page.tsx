"use client";
import { CloudIcon, WebIcon } from "@/components/icons/icon";
import { BookUser, CircleUserRound, Hospital, Lock, Users } from "lucide-react";
import React, { useState } from "react";
import EditOrg from "../organization/EditOrg";
import Image from "next/image";
import orgProfileImage from "@public/assets/orgProfileImage.png";
import Link from "next/link";
import ProfileForm from "@/components/admin/ProfileForm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ChangePasswordComponent from "@/components/admin/ChangePasswordComponent";

const tabs = ["Admin Profile", "Change Password"];

const ProfilePage = () => {
  const [tab, setTab] = useState("Admin Profile");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
      <aside className="pb-10 px-[54px] pt-[34px] pt shadow-[0px_0px_4px_1px_#0000004D] rounded-md sm:min-h-[568px] max-h-[700px]">
        <div className="flex flex-col gap-[15px] items-center mb-[30px]">
          <Image
            src={orgProfileImage}
            alt="Organization image"
            width={180}
            height={180}
            className="rounded-full"
          />
          <div className="text-center">
            <p className="font-semibold text-2xl text-black">JP Morgan</p>
            <p className="text-xs font-normal text-[#999999] mt-1">Admin</p>
            <p className="text-xs font-semibold text-[#595959]">
              Joee Solutions
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
        {tab === "Change Password" ? <ChangePasswordComponent /> : <EditOrg />}
      </div>
    </div>
  );
};

export default ProfilePage;
