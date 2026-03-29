"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { arrayFromApiResponse } from "@/utils/api-array";

type ScheduleDTO = {
  id: string;
  availableDay: string;
  startTime: string;
  endTime: string;
};

export default function SchedulePage() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const params = useParams();
  const employeeSlug = String(params?.employeeDetail ?? "").toLowerCase();

  const { data: employeesResponse } = useSWR(
    API_ENDPOINTS.GET_EMPLOYEE,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true, refreshInterval: 30000, dedupingInterval: 5000 }
  );
  const { data: schedulesResponse } = useSWR(
    API_ENDPOINTS.GET_SCHEDULES,
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

  const rows = useMemo<ScheduleDTO[]>(() => {
    const all = arrayFromApiResponse(schedulesResponse);
    const owned = employeeId
      ? all.filter((s) => {
          const row = s as Record<string, unknown>;
          const user = row.user as Record<string, unknown> | undefined;
          return String(
            user?.id ?? row.employee_id ?? row.employeeId ?? ""
          ) === employeeId;
        })
      : all;
    const source = owned.length > 0 ? owned : all;
    const out: ScheduleDTO[] = [];
    source.forEach((s, i) => {
      const row = s as Record<string, unknown>;
      const days = Array.isArray(row.availableDays) ? row.availableDays : [];
      if (days.length > 0) {
        days.forEach((d, j) => {
          const dayRow = d as Record<string, unknown>;
          out.push({
            id: `${row.id ?? i}-${j}`,
            availableDay: String(dayRow.day ?? "—"),
            startTime: String(dayRow.startTime ?? dayRow.start_time ?? "—"),
            endTime: String(dayRow.endTime ?? dayRow.end_time ?? "—"),
          });
        });
      } else {
        out.push({
          id: String(row.id ?? i + 1),
          availableDay: String(row.day ?? row.date ?? "—"),
          startTime: String(row.start_time ?? row.startTime ?? "—"),
          endTime: String(row.end_time ?? row.endTime ?? "—"),
        });
      }
    });
    return out;
  }, [schedulesResponse, employeeId]);

  const columns: Column<ScheduleDTO>[] = [
    { header: "Day", key: "availableDay" },
    {
      header: "Available Time",
      render(row) {
        return (
          <p className="font-semibold text-xs text-black">
            {row.startTime} - {row.endTime}
          </p>
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
        <h2 className="font-semibold text-xl text-black">Schedules</h2>
        <Button className="font-normal text-base text-white bg-[#003465] w-[130px] h-[50px]">
          Export <Upload />
        </Button>
      </header>

      <DataTable
        columns={columns as any}
        data={rows as any}
        bgHeader="bg-[#D9EDFF] text-black"
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
