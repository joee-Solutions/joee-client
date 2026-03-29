"use client";

import { Button } from "@/components/ui/button";
import { CircleArrowLeft, UserRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  AppointmentIcon,
  PatientsIcon,
  ScheduleIcon,
  UserIcon,
} from "@/components/icons/icon";
import PersonalInfo from "./PersonalInfo";
import PatientPage from "./Patients";
import AppointmentPage from "./Appointment";
import SchedulePage from "./Schedules";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { arrayFromApiResponse } from "@/utils/api-array";

const tabBtns = [
  {
    icon: UserIcon,
    label: "Personal Information",
    currTab: 1,
  },
  {
    icon: PatientsIcon,
    label: "Patients",
    currTab: 2,
  },
  {
    icon: AppointmentIcon,
    label: "Appointments",
    currTab: 3,
  },
  {
    icon: ScheduleIcon,
    label: "Schedules",
    currTab: 4,
  },
];

export default function EmployeeDetailPage() {
  const [currTab, setCurrTab] = useState<number>(1);
  const router = useRouter();
  const params = useParams();
  const employeeSlug = String(params?.employeeDetail ?? "");

  const { data: employeesResponse, isLoading } = useSWR(
    API_ENDPOINTS.GET_EMPLOYEE,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  const employee = useMemo(() => {
    const list = arrayFromApiResponse(employeesResponse);
    const normalizedSlug = employeeSlug.toLowerCase();
    return list.find((u) => {
      const first = String(u.first_name ?? u.firstName ?? u.firstname ?? "").trim();
      const last = String(u.last_name ?? u.lastName ?? u.lastname ?? "").trim();
      const name = `${first} ${last}`.trim();
      if (!name) return false;
      return name.split(/\s+/).join("-").toLowerCase() === normalizedSlug;
    });
  }, [employeesResponse, employeeSlug]);

  const userName = useMemo(() => {
    if (!employee) return employeeSlug.replace(/-/g, " ");
    const first = String(employee.first_name ?? employee.firstName ?? employee.firstname ?? "").trim();
    const last = String(employee.last_name ?? employee.lastName ?? employee.lastname ?? "").trim();
    return `${first} ${last}`.trim() || employeeSlug.replace(/-/g, " ");
  }, [employee, employeeSlug]);
  const userRole = String(employee?.role ?? employee?.designation ?? employee?.job_title ?? "Employee");
  const userContact = String(
    employee?.phone_number ?? employee?.phone ?? employee?.phoneNumber ?? employee?.email ?? ""
  );

  if (isLoading) {
    return (
      <section className="py-10 px-5">
        <p className="text-gray-500">Loading employee…</p>
      </section>
    );
  }

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
              <div
                className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#eef2f6]"
                aria-hidden
              >
                <UserRound className="h-24 w-24 text-[#94a3b8]" strokeWidth={1.25} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-2xl text-black">{userName}</p>
                <p className="text-xs font-normal text-[#999999] mt-1">
                  {userRole}
                </p>
                <p className="text-xs font-medium text-[#595959] mt-1">
                  {userContact || "—"}
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
              <PatientPage />
            ) : currTab === 3 ? (
              <AppointmentPage />
            ) : (
              <SchedulePage />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
