"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useMemo, useState } from "react";
import { Search, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type DepartmentEmployeeRow = {
  id: number | string;
  employee_name: { name: string; picture: string };
  designation: string;
  specialty: string;
  href: string;
};

export default function DepartmentEmployees({ rows }: { rows: DepartmentEmployeeRow[] }) {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const columns: Column<DepartmentEmployeeRow>[] = useMemo(
    () => [
      {
        header: "ID",
        key: "id" as keyof DepartmentEmployeeRow,
        size: 80,
      },
      {
        header: "Employee Name",
        render: (row) => (
          <div className="flex items-center gap-[10px] py-[21px]">
            <span className="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full bg-[#eef2f6]">
              {row.employee_name.picture?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.employee_name.picture}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-7 w-7 text-[#94a3b8]" strokeWidth={1.25} aria-hidden />
              )}
            </span>
            <p className="text-xs font-medium text-black">{row.employee_name.name}</p>
          </div>
        ),
        size: 250,
      },
      {
        header: "Designation",
        key: "designation" as keyof DepartmentEmployeeRow,
        size: 150,
      },
      {
        header: "Specialty",
        render: (row) => (
          <p className="text-xs font-semibold text-[#737373]">{row.specialty || "—"}</p>
        ),
        size: 140,
      },
      {
        header: "Actions",
        render: (row) => (
          <Link
            href={row.href}
            className="inline-flex h-7 items-center justify-center rounded-[4px] border border-[#003465] px-3 text-xs font-medium text-[#003465] hover:bg-[#003465] hover:text-white"
          >
            View
          </Link>
        ),
        size: 100,
      },
    ],
    []
  );

  const numOfPages = Math.max(1, Math.ceil(rows.length / pageSize));

  return (
    <section className="">
      <header className="mb-10 flex items-center justify-between gap-5">
        <h2 className="text-xl font-semibold text-black">Employees</h2>
        <Button className="h-[50px] w-[130px] bg-[#003465] text-base font-normal text-white">
          Export <Upload />
        </Button>
      </header>
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data..."
            className="min-w-[274px] bg-white py-4 pl-5 pr-11 text-sm font-medium text-[#4F504F] outline-none w-full border border-[#BFBFBF]"
          />
          <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#999999]" />
        </div>

      </div>
      <DataTable
        columns={columns as any}
        data={rows as any}
        bgHeader="bg-[#D9EDFF] text-black"
        search={search}
        searchableKeys={["designation", "specialty"] as any}
      />
      <Pagination
        dataLength={rows.length}
        numOfPages={numOfPages}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
