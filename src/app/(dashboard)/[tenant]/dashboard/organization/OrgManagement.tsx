"use client";

import { Button } from "@/components/ui/button";
import { CircleArrowLeft, Hospital } from "lucide-react";
import { useState } from "react";
import EditOrg from "./EditOrg";
import CheckHMS from "./CheckHMS";
import OrgBackupRestore from "./OrgBackupRestore";
import Image from "next/image";
import orgProfileImage from "./../../../../../../public/assets/orgProfileImage.png";
import { CloudIcon, WebIcon } from "@/components/icons/icon";

interface OrgManagementProps {
  setIsAddOrg: (val: "add" | "edit" | "none") => void;
}

export default function OrgManagement({ setIsAddOrg }: OrgManagementProps) {
  const [currTab, setCurrTab] = useState<1 | 2 | 3>(1);

  return (
    <div className="flex flex-col gap-[30px]">
      <div>
        <Button
          onClick={() => setIsAddOrg("none")}
          className="font-semibold text-2xl text-black gap-1 p-0"
        >
          <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
          Edit Organization
        </Button>
      </div>
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
            <Button
              onClick={() => setCurrTab(1)}
              className={`font-medium h-[60px] justify-start text-sm ${
                currTab === 1
                  ? "text-[#003465] bg-[#D9EDFF]"
                  : "text-[#737373] bg-[#F3F3F3]"
              } gap-1 py-[18px] px-7`}
            >
              <Hospital />
              Organization Profile
            </Button>
            <Button
              onClick={() => setCurrTab(2)}
              className={`font-medium h-[60px] justify-start text-sm ${
                currTab === 2
                  ? "text-[#003465] bg-[#D9EDFF]"
                  : "text-[#737373] bg-[#F3F3F3]"
              } gap-1 py-[18px] px-7`}
            >
              <WebIcon className="fill-current" />
              Check HMS
            </Button>
            <Button
              onClick={() => setCurrTab(3)}
              className={`font-medium h-[60px] justify-start text-sm ${
                currTab === 3
                  ? "text-[#003465] bg-[#D9EDFF]"
                  : "text-[#737373] bg-[#F3F3F3]"
              } gap-1 py-[18px] px-7`}
            >
              <CloudIcon className="fill-current" />
              Backup Restore
            </Button>
          </div>
        </aside>
        <div className="px-10 pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md">
          {currTab === 1 ? (
            <EditOrg />
          ) : currTab === 2 ? (
            <CheckHMS />
          ) : (
            <OrgBackupRestore />
          )}
        </div>
      </div>
    </div>
  );
}
