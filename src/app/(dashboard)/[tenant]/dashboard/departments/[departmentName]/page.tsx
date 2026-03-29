"use client";

import { Button } from "@/components/ui/button";
import { Building2, CircleArrowLeft, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Cookies from "js-cookie";
import DepartmentOverview, { type DepartmentDetailModel } from "./DepartmentOverview";
import DepartmentEmployees, { type DepartmentEmployeeRow } from "./DepartmentEmployees";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { arrayFromApiResponse } from "@/utils/api-array";

const tabBtns = [
  { icon: Building2, label: "General Overview", currTab: 1 },
  { icon: Users, label: "Employees", currTab: 2 },
];

function departmentSlugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function formatDeptDate(input: unknown): string {
  if (!input) return "—";
  const d = typeof input === "string" || input instanceof Date ? new Date(input as string) : null;
  if (!d || isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "D";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapUserToDepartmentRow(user: Record<string, unknown>, index: number): DepartmentEmployeeRow {
  const first = String(user.first_name ?? user.firstName ?? user.firstname ?? "").trim();
  const last = String(user.last_name ?? user.lastName ?? user.lastname ?? "").trim();
  const name = `${first} ${last}`.trim() || String(user.username ?? user.email ?? `Employee ${index + 1}`);
  const picture = String(
    user.image_url ?? user.imageUrl ?? user.profile_picture ?? user.profilePicture ?? ""
  );
  const designation = String(user.role ?? user.designation ?? user.job_title ?? "—");
  const specialty = String(user.specialty ?? user.specialization ?? "—");
  const id: string | number = (user.id ?? user._id ?? index + 1) as string | number;
  const slug = name.split(/\s+/).join("-");
  return {
    id,
    employee_name: { name, picture },
    designation,
    specialty,
    href: `/dashboard/employees/${slug}`,
  };
}

export default function DepartmentDetailPage() {
  const [currTab, setCurrTab] = useState(1);
  const router = useRouter();
  const params = useParams();
  const slugParam = String(params?.departmentName ?? "").toLowerCase();

  const organizationName = useMemo(() => {
    try {
      const raw = Cookies.get("user");
      if (!raw) return "Organization";
      const u = JSON.parse(raw);
      return String(u?.name ?? u?.organization_name ?? u?.domain ?? u?.tenant?.name ?? "Organization");
    } catch {
      return "Organization";
    }
  }, []);

  const fetcher = (url: string) => processRequestOfflineAuth("get", url);

  const { data: departmentsResponse, isLoading: departmentsLoading } = useSWR(
    API_ENDPOINTS.GET_DEPARTMENTS,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  const { data: employeesResponse } = useSWR(API_ENDPOINTS.GET_EMPLOYEE, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
    dedupingInterval: 5000,
  });

  const departmentRecord = useMemo(() => {
    const list = arrayFromApiResponse(departmentsResponse);
    return list.find(
      (d) => departmentSlugFromName(String(d.name ?? d.department_name ?? "")) === slugParam
    );
  }, [departmentsResponse, slugParam]);

  const departmentId = departmentRecord
    ? String(departmentRecord.id ?? departmentRecord._id ?? "")
    : "";

  const employeesInDepartment = useMemo(() => {
    if (!departmentId) return [];
    const users = arrayFromApiResponse(employeesResponse);
    return users.filter((u) => {
      const ud = String(
        (u.department as { id?: string | number } | undefined)?.id ??
          u.department_id ??
          u.departmentId ??
          ""
      );
      return ud === departmentId;
    });
  }, [employeesResponse, departmentId]);

  const departmentModel = useMemo((): DepartmentDetailModel | null => {
    if (!departmentRecord) return null;
    const name = String(departmentRecord.name ?? departmentRecord.department_name ?? "Department");
    const rawStatus = departmentRecord.status ?? (departmentRecord.is_active === false ? "Inactive" : "Active");
    const status =
      String(rawStatus).toLowerCase() === "inactive" ? "Inactive" : "Active";
    const countFromApi = Number(
      departmentRecord.userCount ??
        departmentRecord.employee_count ??
        departmentRecord.employeeCount ??
        0
    );
    const employeeCount =
      employeesInDepartment.length > 0 ? employeesInDepartment.length : countFromApi;

    return {
      id: departmentId,
      name,
      description: String(
        departmentRecord.description ?? departmentRecord.departmentDescription ?? ""
      ),
      dateCreated: formatDeptDate(
        departmentRecord.created_at ?? departmentRecord.createdAt ?? departmentRecord.dateCreated
      ),
      employeeCount,
      status,
    };
  }, [departmentRecord, departmentId, employeesInDepartment.length]);

  const employeeRows = useMemo(
    () => employeesInDepartment.map((u, i) => mapUserToDepartmentRow(u, i)),
    [employeesInDepartment]
  );

  const handleBack = () => {
    router.back();
  };

  const displayName = departmentModel?.name ?? "Department";

  if (!departmentsLoading && !departmentModel) {
    return (
      <div className="px-5 py-10">
        <Button
          onClick={() => router.push("/dashboard/departments")}
          variant="ghost"
          className="mb-6 gap-2 p-0 text-[#003465] hover:bg-transparent"
        >
          <CircleArrowLeft className="size-8 fill-[#003465] text-white" />
          Back to departments
        </Button>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">Department not found</p>
          <p className="mt-2 text-sm">
            No department matches &quot;{slugParam}&quot;. It may have been removed or the link is outdated.
          </p>
        </div>
      </div>
    );
  }

  if (departmentsLoading || !departmentModel) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-5 py-10">
        <p className="text-gray-500">Loading department…</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-10">
      <div className="flex flex-col gap-[30px]">
        <div>
          <Button
            onClick={handleBack}
            className="gap-3 p-0 text-2xl font-semibold text-black hover:bg-transparent"
            variant="ghost"
          >
            <CircleArrowLeft className="size-[39px] fill-[#003465] text-white" />
            {displayName}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[398px_1fr]">
          <aside className="h-max rounded-md bg-white px-[54px] pb-10 pt-[34px] shadow-[0px_0px_4px_1px_#0000004D]">
            <div className="mb-[30px] flex flex-col items-center gap-[15px]">
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#E8F4FD]">
                <span className="text-4xl font-bold text-[#003465]">
                  {initialsFromName(departmentModel.name)}
                </span>
              </div>

              <div className="text-center">
                <p className="text-2xl font-semibold text-black">{departmentModel.name}</p>
                <p className="mt-1 text-xs font-normal text-[#999999]">Department</p>
                <p className="mt-1 text-xs font-medium text-[#595959]">{organizationName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {tabBtns.map((tab) => (
                <Button
                  key={tab.currTab}
                  onClick={() => setCurrTab(tab.currTab)}
                  className={`h-[60px] justify-start gap-3 py-[18px] pl-7 pr-7 text-sm font-medium hover:bg-[#D9EDFF] hover:text-[#003465] ${
                    currTab === tab.currTab
                      ? "bg-[#D9EDFF] text-[#003465]"
                      : "bg-[#F3F3F3] text-[#737373]"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </aside>

          <div className="overflow-hidden rounded-md bg-white px-[25px] pb-[56px] pt-[32px] shadow-[0px_0px_4px_1px_#0000004D]">
            {currTab === 1 ? (
              <DepartmentOverview department={departmentModel} />
            ) : (
              <DepartmentEmployees rows={employeeRows} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
