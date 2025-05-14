"use client";

import { Button } from "@/components/ui/button";
import { CircleArrowLeft } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import userProfileImage from "./../../../../../../../public/assets/doctorMale.png";
import { useState } from "react";
import {
  AppointmentIcon,
  PasswordLockIcon,
  PatientsIcon,
  RoleIcon,
  ScheduleIcon,
  UserIcon,
} from "@/components/icons/icon";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";
import PatientPage from "./Patients";
import AppointmentPage from "./Appointment";
import SchedulePage from "./Schedules";
import AssignRolePage from "./AssignRole";

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
    icon: PatientsIcon,
    label: "Patients",
    currTab: 3,
  },
  {
    icon: AppointmentIcon,
    label: "Appointments",
    currTab: 4,
  },
  {
    icon: ScheduleIcon,
    label: "Schedules",
    currTab: 5,
  },
  {
    icon: RoleIcon,
    label: "Assign roles",
    currTab: 6,
  },
];

export default function EmployeeDetailPage() {
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
                  <tab.icon
                    fill={currTab === tab.currTab ? "#003465" : "#737373"}
                  />
                  {tab.label}
                </Button>
              ))}
            </div>
          </aside>
          <div className="px-[25px] pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md overflow-hidden">
            {currTab === 1 ? (
              <PersonalInfo />
            ) : currTab === 2 ? (
              <ChangePassword />
            ) : currTab === 3 ? (
              <PatientPage />
            ) : currTab === 4 ? (
              <AppointmentPage />
            ) : currTab === 5 ? (
              <SchedulePage />
            ) : (
              <AssignRolePage />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
