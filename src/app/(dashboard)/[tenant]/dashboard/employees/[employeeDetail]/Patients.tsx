"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useMemo, useState } from "react";
import { Search, Upload, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { arrayFromApiResponse } from "@/utils/api-array";

type PatientDto = {
  id: number | string;
  profilePicture: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  gender: string;
};

export default function PatientPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const params = useParams();
  const employeeSlug = String(params?.employeeDetail ?? "").toLowerCase();

  const { data: employeesResponse } = useSWR(
    API_ENDPOINTS.GET_EMPLOYEE,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );
  const { data: patientsResponse } = useSWR(
    API_ENDPOINTS.GET_PATIENTS,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  const employeeId = useMemo(() => {
    const employees = arrayFromApiResponse(employeesResponse);
    const found = employees.find((u) => {
      const first = String(u.first_name ?? u.firstName ?? u.firstname ?? "").trim();
      const last = String(u.last_name ?? u.lastName ?? u.lastname ?? "").trim();
      return `${first} ${last}`.trim().split(/\s+/).join("-").toLowerCase() === employeeSlug;
    });
    return String(found?.id ?? found?._id ?? "");
  }, [employeesResponse, employeeSlug]);

  const rows = useMemo<PatientDto[]>(() => {
    const all = arrayFromApiResponse(patientsResponse);
    const mapped = all.map((p, i) => {
      const firstName = String(p.first_name ?? p.firstName ?? "").trim();
      const lastName = String(p.last_name ?? p.lastName ?? "").trim();
      const createdRaw = String(p.created_at ?? p.createdAt ?? "");
      const createdAt = createdRaw && !isNaN(new Date(createdRaw).getTime())
        ? new Date(createdRaw).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "—";
      return {
        id: String(p.id ?? p._id ?? i + 1),
        profilePicture: String(p.image_url ?? p.imageUrl ?? p.profile_picture ?? p.profilePicture ?? ""),
        firstName: firstName || String(p.name ?? "Patient"),
        lastName,
        createdAt,
        gender: String(p.gender ?? p.sex ?? "—"),
      };
    });
    if (!employeeId) return mapped;
    const filtered = all.filter((p) => {
      const owner = String(p.employee_id ?? p.doctor_id ?? p.user_id ?? p.created_by ?? "");
      return owner === employeeId;
    });
    return filtered.length === 0 ? mapped : filtered.map((p, i) => ({
      id: String(p.id ?? p._id ?? i + 1),
      profilePicture: String(p.image_url ?? p.imageUrl ?? p.profile_picture ?? p.profilePicture ?? ""),
      firstName: String(p.first_name ?? p.firstName ?? p.name ?? "Patient"),
      lastName: String(p.last_name ?? p.lastName ?? ""),
      createdAt: String(p.created_at ?? p.createdAt ?? "—"),
      gender: String(p.gender ?? p.sex ?? "—"),
    }));
  }, [patientsResponse, employeeId]);

  const columns: Column<PatientDto>[] = [
    { header: "#", key: "id" },
    {
      header: "Patients",
      render(row) {
        return (
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full bg-[#eef2f6]">
              {row.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.profilePicture} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-6 w-6 text-[#94a3b8]" />
              )}
            </span>
            <p className="text-xs font-medium text-black">{row.firstName} {row.lastName}</p>
          </div>
        );
      },
    },
    { header: "Created at", key: "createdAt" },
    {
      header: "Gender",
      render(row) {
        return <p className="text-xs font-semibold text-[#737373]">{row.gender || "—"}</p>;
      },
    },
  ];

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  return (
    <section className="">
      <header className="flex items-center justify-between gap-5 mb-10">
        <h2 className="font-semibold text-xl text-black">Patients</h2>
        <Button className="font-normal text-base text-white bg-[#003465] w-[130px] h-[50px]">
          Export <Upload />
        </Button>
      </header>
      <div className="flex flex-wrap mb-5 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data..."
            className="py-4 px-5 pr-11 min-w-[274px] bg-white w-full font-medium text-sm text-[#4F504F] border border-[#BFBFBF] outline-none"
          />
          <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      <DataTable
        columns={columns as any}
        data={rows as any}
        bgHeader="bg-[#D9EDFF] text-black"
        search={search}
        searchableKeys={["firstName", "lastName", "gender"] as any}
      />
      <Pagination
        dataLength={rows.length}
        numOfPages={Math.max(1, Math.ceil(rows.length / pageSize))}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
