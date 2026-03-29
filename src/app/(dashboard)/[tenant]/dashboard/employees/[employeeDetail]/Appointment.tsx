"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useMemo, useState } from "react";
import { Search, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { arrayFromApiResponse } from "@/utils/api-array";

type AppointmentDTO = {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function AppointmentPage() {
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
  const { data: appointmentsResponse } = useSWR(
    API_ENDPOINTS.GET_APPOINTMENTS,
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

  const rows = useMemo<AppointmentDTO[]>(() => {
    const all = arrayFromApiResponse(appointmentsResponse);
    const maybeFiltered = employeeId
      ? all.filter((a) => {
          const row = a as Record<string, unknown>;
          const user = row.user as Record<string, unknown> | undefined;
          const doctor = row.doctor as Record<string, unknown> | undefined;
          return String(
            row.userId ?? row.doctorId ?? user?.id ?? doctor?.id ?? ""
          ) === employeeId;
        })
      : all;
    const source = maybeFiltered.length > 0 ? maybeFiltered : all;
    return source.map((a, i) => {
      const row = a as Record<string, unknown>;
      const patient = (row.patient ?? {}) as Record<string, unknown>;
      const patientName = String(
        row.patientName ??
          [patient.first_name, patient.middle_name, patient.last_name]
            .filter(Boolean)
            .join(" ") ??
          "—"
      ).trim();
      const dateRaw = String(
        row.date ?? row.appointmentDate ?? row.scheduledAt ?? row.createdAt ?? ""
      );
      const date =
        dateRaw && !isNaN(new Date(dateRaw).getTime())
          ? new Date(dateRaw).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—";
      return {
        id: String(row.id ?? row.appointmentId ?? i + 1),
        patientName,
        date,
        startTime: String(row.startTime ?? "").trim() || "—",
        endTime: String(row.endTime ?? "").trim() || "—",
        status: String(row.status ?? "pending"),
      };
    });
  }, [appointmentsResponse, employeeId]);

  const columns: Column<AppointmentDTO>[] = [
    { header: "Date", key: "date" },
    { header: "Patients", key: "patientName" },
    {
      header: "Time",
      render(row) {
        return <p className="text-xs font-semibold text-black">{row.startTime} - {row.endTime}</p>;
      },
    },
    {
      header: "Status",
      render(row) {
        const s = row.status.toLowerCase();
        return (
          <div
            className={`flex h-[30px] w-[90px] items-center justify-center rounded-[20px] text-xs font-medium ${
              s === "approved" || s === "active"
                ? "bg-[#E5F8DA] text-[#3FA907]"
                : s === "pending"
                ? "bg-[#FEF9D9] text-[#C8AE00]"
                : "bg-[#FDE6E6] text-[#EC0909]"
            }`}
          >
            {row.status}
          </div>
        );
      },
    },
  ];

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  return (
    <section className="">
      <header className="flex items-center justify-between gap-5 mb-10">
        <h2 className="font-semibold text-xl text-black">Appointments</h2>
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
        searchableKeys={["patientName", "status", "date"] as any}
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
