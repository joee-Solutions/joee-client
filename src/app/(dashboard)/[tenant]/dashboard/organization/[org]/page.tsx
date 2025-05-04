"use client";
import { WebIcon } from "@/components/icons/icon";
import { Hospital, CloudIcon } from "lucide-react";
import React from "react";

import EditOrg from "../EditOrg";
import Image from "next/image";
import orgProfileImage from "@public/assets/orgProfileImage.png";
import Link from "next/link";

const OrgPage = () => {
  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
        <aside className="pb-10 px-[54px] pt-[34px] pt shadow-[0px_0px_4px_1px_#0000004D] rounded-md sm:h-[568px]">
          <div className="flex flex-col gap-[15px] items-center mb-[30px]">
            <Image
              src={orgProfileImage}
              alt="Organization image"
              width={180}
              height={180}
              className="rounded-full"
            />
            <div className="text-center">
              <p className="font-semibold text-2xl text-black">
                JON-KEN Hospital
              </p>
              <p className="text-xs font-normal text-[#999999] mt-1">
                Lagos, Nigeria
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <Link
              href="/dashboard/organization#"
              className={`font-medium h-[60px] flex items-center justify-start text-sm ${"text-[#003465] bg-[#D9EDFF]"} gap-1 py-[18px] px-7`}
            >
              <Hospital />
              Organization Profile
            </Link>
            <Link
              href="/dashboard/organization/hdh/view"
              className={`font-medium h-[60px] flex items-center justify-start text-sm ${"text-[#003465] bg-[#D9EDFF]"} gap-1 py-[18px] px-7`}
            >
              <WebIcon className="fill-current" />
              Check HMS
            </Link>
            <Link
              href="/dashboard/organization/dhdh/backup"
              className={`font-medium h-[60px] flex items-center justify-start text-sm ${"text-[#003465] bg-[#D9EDFF]"} gap-1 py-[18px] px-7`}
            >
              <CloudIcon className="fill-current" />
              Backup Restore
            </Link>
          </div>
        </aside>
        <div className="px-10 pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md">
          {<EditOrg />}
        </div>
      </div>
    </div>
  );
};

export default OrgPage;
