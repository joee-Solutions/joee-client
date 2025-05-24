"use client";

import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  CircleArrowLeft,
  FilePlus,
  HeartPulse,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import userProfileImage from "./../../../../../../../public/assets/doctorMale.png";
import { useState } from "react";
import { AppointmentIcon, ScheduleIcon } from "@/components/icons/icon";
import PersonalInfo from "./PersonalInfo";
import AppointmentPage from "./Appointment";
import SchedulePage from "./Uploads";
import PatientPage from "../page";
import { FaUser } from "react-icons/fa";
import MedicalInfo from "./MedicalInfo";
import Patients from "./MedicalRecords";
import Uploads from "./Uploads";
import Appointment from "./Appointment";
import MedicalRecords from "./MedicalRecords";

const tabBtns = [
  {
    icon: FaUser,
    label: "Personal Information",
    currTab: 1,
  },
  {
    icon: HeartPulse,
    label: "Medical Information",
    currTab: 2,
  },
  {
    icon: FilePlus,
    label: "Medical Records",
    currTab: 3,
  },
  {
    icon: CalendarClock,
    label: "Appointments",
    currTab: 4,
  },
  {
    icon: Upload,
    label: "Uploads",
    currTab: 5,
  },
];

export default function MedicalInformationPage() {
  const [currTab, setCurrTab] = useState<number>(1);

  const path = usePathname().split("/");
  const router = useRouter();
  const userName = path[path.length - 1].replace("-", " ");

  return (
    <section className="py-10 px-5">
      <div className="flex flex-col gap-[30px]">
        <div>
          <Button
            onClick={() => router.back()}
            className="font-semibold text-2xl text-black gap-1 p-0"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            {userName}
          </Button>
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
                <p className="font-semibold text-2xl text-black">{userName}</p>
                <p className="text-xs font-normal text-[#999999] mt-1">
                  Dentist
                </p>
                <p className="text-xs font-medium text-[#595959] mt-1">
                  +234-123-4567-890
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {tabBtns.map((tab) => (
                <Button
                  key={tab.currTab}
                  onClick={() => setCurrTab(tab.currTab)}
                  className={`font-medium h-[60px] justify-start text-sm ${
                    currTab === tab.currTab
                      ? "text-[#003465] bg-[#D9EDFF]"
                      : "text-[#737373] bg-[#F3F3F3]"
                  } gap-1 py-[18px] px-7`}
                >
                  <tab.icon />
                  {tab.label}
                </Button>
              ))}
            </div>
          </aside>
          <div className="px-[25px] pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md overflow-hidden">
            {currTab === 1 ? (
              <PersonalInfo />
            ) : currTab === 2 ? (
              <MedicalInfo />
            ) : currTab === 3 ? (
              <MedicalRecords />
            ) : currTab === 4 ? (
              <Appointment />
            ) : (
              <Uploads />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
