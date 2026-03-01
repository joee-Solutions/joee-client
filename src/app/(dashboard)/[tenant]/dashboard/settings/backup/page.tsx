"use client";

import { CloudBackupIcon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { CircleArrowLeft } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useState } from "react";
import RecentBackup from "./RecentBackup";
const RestoreTabIcon = ({ fill = "#737373" }: { fill?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 3v5h5" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const tabBtns = [
  { icon: CloudBackupIcon, label: "Backup", currTab: 1 },
  { icon: RestoreTabIcon, label: "Restore", currTab: 2 },
];

export default function Backup() {
  const router = useRouter();
  const params = useParams();
  const tenant = (params?.tenant as string) || "";
  const [currTab, setCurrTab] = useState(1);

  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const isSubdomainMode = segments[0] === "dashboard";
  const settingsHref = isSubdomainMode ? "/dashboard/settings" : tenant ? `/${tenant}/dashboard/settings` : "/dashboard/settings";

  return (
    <section className="py-[50px] px-[30px]">
      <header className="flex flex-col gap-10">
        <div>
          <Button
            onClick={() => router.push(settingsHref)}
            className="font-semibold text-2xl text-black gap-1 p-0"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            Backup Restore
          </Button>
        </div>
        <div className="flex items-center gap-5">
          {tabBtns.map((tab) => (
            <Button
              key={tab.currTab}
              onClick={() => setCurrTab(tab.currTab)}
              className={`font-medium h-[60px] text-base transition-all w-[200px] ${
                currTab === tab.currTab
                  ? "text-[#FFFFFF] bg-[#003465] rounded-[4px]"
                  : "text-[#595959] bg-[#E6E6E6]"
              } gap-1 py-[18px] px-7`}
            >
              <tab.icon
                fill={currTab === tab.currTab ? "#FFFFFF" : "#737373"}
              />
              {tab.label}
            </Button>
          ))}
        </div>
      </header>
      <div>{currTab === 1 ? <RecentBackup /> : <RecentBackup showRestoreOnly />}</div>
    </section>
  );
}
