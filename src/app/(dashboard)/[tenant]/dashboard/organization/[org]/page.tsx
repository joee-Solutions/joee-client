"use client";
import { WebIcon } from "@/components/icons/icon";
import { Hospital, CloudIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import EditOrg from "../EditOrg";
import Image from "next/image";
import orgProfileImage from "@public/assets/orgProfileImage.png";
import Link from "next/link";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

const OrgPage = () => {
  const [orgData, setOrgData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await processRequestAuth("get", API_ENDPOINTS.GET_PROFILE);
        const profileData = response?.data || response;
        setOrgData(profileData);
      } catch (error: any) {
        console.error("Failed to load organization profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const orgName = orgData?.organization_name || orgData?.organizationName || orgData?.name || orgData?.company || "Organization";
  const orgAddress = orgData?.address || "Address not set";
  const orgImage = orgData?.image || orgData?.logo || orgProfileImage;

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
        <aside className="pb-10 px-[54px] pt-[34px] pt shadow-[0px_0px_4px_1px_#0000004D] rounded-md sm:h-[568px]">
          <div className="flex flex-col gap-[15px] items-center mb-[30px]">
            <Image
              src={orgImage}
              alt="Organization image"
              width={180}
              height={180}
              className="rounded-full object-cover"
            />
            <div className="text-center">
              <p className="font-semibold text-2xl text-black">
                {isLoading ? "Loading..." : orgName}
              </p>
              <p className="text-xs font-normal text-[#999999] mt-1">
                {isLoading ? "Loading..." : orgAddress}
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
