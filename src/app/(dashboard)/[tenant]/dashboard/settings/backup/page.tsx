"use client";

import { CloudBackupIcon, CloudIcon, TrashIcon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { CircleArrowLeft, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RecentBackup from "./RecentBackup";
import EmptyTrash from "./EmptyTrash";

const tabBtns = [
  {
    icon: CloudBackupIcon,
    label: "Backup",
    currTab: 1,
  },
  {
    icon: TrashIcon,
    label: "Trash",
    currTab: 2,
  },
];

export default function Backup() {
  const router = useRouter();
  const [currTab, setCurrTab] = useState(1);

  return (
    <section className="py-[50px] px-[30px]">
      <header className="flex flex-col gap-10">
        <div>
          <Button
            onClick={() => router.back()}
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
      <div>{currTab === 1 ? <RecentBackup /> : <EmptyTrash />}</div>
    </section>
  );
}
