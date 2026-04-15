"use client";

import { Button } from "@/components/ui/button";
import {
  CircleArrowLeft,
  HeartPulse,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import userProfileImage from "./../../../../../../../public/assets/doctorMale.png";
import { useMemo, useState } from "react";
import PersonalInfo from "./PersonalInfo";
import { FaUser } from "react-icons/fa";
import Appointment from "./Appointment";
import useSWR from "swr";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

const tabBtns = [
  {
    icon: FaUser,
    label: "Personal Information",
    currTab: 1,
  },
  {
    icon: HeartPulse,
    label: "Appointments",
    currTab: 2,
  },
];

function patientListHref(tenant: string) {
  return tenant ? `/${tenant}/dashboard/patients` : `/dashboard/patients`;
}

export default function MedicalInformationPage() {
  const [currTab, setCurrTab] = useState<number>(1);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenant = String(params?.tenant ?? "");
  const patientDetail = String(params?.patientDetail ?? "");
  const patientIdFromQuery = Number(searchParams.get("pid") ?? "");
  const patientIdFromPath = /^\d+$/.test(patientDetail) ? Number(patientDetail) : NaN;
  const patientId = Number.isFinite(patientIdFromQuery) && patientIdFromQuery > 0
    ? patientIdFromQuery
    : patientIdFromPath;

  const { data: patientResponse, isLoading } = useSWR(
    Number.isFinite(patientId) && patientId > 0 ? API_ENDPOINTS.GET_PATIENT(patientId) : null,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true }
  );

  const patient = useMemo(() => {
    if (!patientResponse) return null;
    const raw = patientResponse?.data?.data ?? patientResponse?.data ?? patientResponse;
    return raw && typeof raw === "object" ? raw : null;
  }, [patientResponse]);

  const contactInfo = (patient?.contact_info ?? {}) as Record<string, unknown>;
  const firstName = String(patient?.first_name ?? patient?.firstname ?? "").trim();
  const lastName = String(patient?.last_name ?? patient?.lastname ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || "Patient";
  const phone =
    String(
      contactInfo?.phone_number_mobile ??
        contactInfo?.phone_number_home ??
        contactInfo?.phone_number ??
        patient?.phone_number_mobile ??
        ""
    ).trim() || "—";

  const rawImg = String(
    patient?.profile_picture ?? patient?.image ?? patient?.patient_picture ?? patient?.patient_image ?? ""
  ).trim();
  const imageSrc =
    rawImg &&
    (rawImg.startsWith("/") ||
      rawImg.startsWith("http://") ||
      rawImg.startsWith("https://") ||
      rawImg.startsWith("data:"))
      ? rawImg
      : "";

  const backHref = patientListHref(tenant);

  if (!Number.isFinite(patientId) || patientId <= 0) {
    return (
      <section className="py-10 px-5">
        <p className="text-sm text-red-600">Invalid patient link.</p>
        <Button
          type="button"
          onClick={() => router.push(backHref)}
          className="mt-4 bg-[#003465] text-white"
        >
          Back to patients
        </Button>
      </section>
    );
  }

  return (
    <section className="py-10 px-5">
      <div className="flex flex-col gap-[30px]">
        <div>
          <Button
            type="button"
            onClick={() => router.push(backHref)}
            className="font-semibold text-2xl text-black gap-1 p-0 h-auto bg-transparent hover:bg-transparent shadow-none"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            <span className="text-left">
              {isLoading ? "Loading…" : fullName}
            </span>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
          <aside className="pb-10 px-[54px] pt-[34px] pt shadow-[0px_0px_4px_1px_#0000004D] h-max rounded-md">
            <div className="flex flex-col gap-[15px] items-center mb-[30px]">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={fullName}
                  width={180}
                  height={180}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <Image
                  src={userProfileImage}
                  alt="Patient profile picture"
                  width={180}
                  height={180}
                  className="rounded-full object-cover"
                />
              )}
              <div className="text-center">
                <p className="font-semibold text-2xl text-black">
                  {isLoading ? "…" : fullName}
                </p>
                <p className="text-xs font-normal text-[#999999] mt-1">Patient</p>
                <p className="text-xs font-medium text-[#595959] mt-1">{phone}</p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {tabBtns.map((tab) => (
                <Button
                  key={tab.currTab}
                  type="button"
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
            ) : (
              <Appointment />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
