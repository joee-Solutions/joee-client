import { useMemo } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { arrayFromApiResponse } from "@/utils/api-array";

type InfoItemProps = { label: string; value: string };
const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="rounded-lg bg-[#D9EDFF] p-4">
    <p className="text-xs font-medium text-[#666666]">{label}</p>
    <p className="mt-1 text-sm font-semibold text-[#1f2937]">{value || "—"}</p>
  </div>
);

export default function PersonalInfo() {
  const params = useParams();
  const employeeSlug = String(params?.employeeDetail ?? "").toLowerCase();

  const { data: employeesResponse } = useSWR(
    API_ENDPOINTS.GET_EMPLOYEE,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  const employee = useMemo(() => {
    const list = arrayFromApiResponse(employeesResponse);
    return list.find((u) => {
      const first = String(u.first_name ?? u.firstName ?? u.firstname ?? "").trim();
      const last = String(u.last_name ?? u.lastName ?? u.lastname ?? "").trim();
      const name = `${first} ${last}`.trim();
      if (!name) return false;
      return name.split(/\s+/).join("-").toLowerCase() === employeeSlug;
    });
  }, [employeesResponse, employeeSlug]);

  const fullName = `${String(employee?.first_name ?? employee?.firstName ?? employee?.firstname ?? "")} ${String(employee?.last_name ?? employee?.lastName ?? employee?.lastname ?? "")}`.trim();
  const department =
    typeof employee?.department === "object" && employee?.department != null
      ? String((employee.department as { name?: string }).name ?? "")
      : String(employee?.department_name ?? employee?.department ?? "");

  return (
    <div>
      <h2 className="mb-[30px] text-base font-bold text-black">Personal Information</h2>
      <div className="mb-5 rounded-lg bg-[#D9EDFF] p-4">
        <p className="text-xs font-medium text-[#666666]">Short Description</p>
        <p className="mt-2 text-sm text-[#1f2937]">
          {String(employee?.about ?? employee?.bio ?? employee?.biography ?? "") || "—"}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoItem label="Full Name" value={fullName} />
        <InfoItem label="Email" value={String(employee?.email ?? "")} />
        <InfoItem label="Phone Number" value={String(employee?.phone_number ?? employee?.phone ?? employee?.phoneNumber ?? "")} />
        <InfoItem label="Address" value={String(employee?.address ?? "")} />
        <InfoItem label="Region/State" value={String(employee?.state ?? employee?.region ?? "")} />
        <InfoItem label="Department" value={department} />
        <InfoItem label="Designation" value={String(employee?.designation ?? employee?.role ?? employee?.job_title ?? "")} />
        <InfoItem label="Specialty" value={String(employee?.specialty ?? employee?.specialization ?? "")} />
        <InfoItem label="Gender" value={String(employee?.gender ?? employee?.sex ?? "")} />
        <InfoItem label="Date of Birth" value={String(employee?.date_of_birth ?? employee?.dob ?? "")} />
        <InfoItem label="Hire Date" value={String(employee?.hire_date ?? employee?.hireDate ?? "")} />
        <InfoItem label="Status" value={String(employee?.status ?? (employee?.is_active === false ? "inactive" : "active"))} />
      </div>
    </div>
  );
}
