"use client";

import { ScheduleData } from "@/components/shared/table/data";
import NewOrg from "@/app/(dashboard)/[tenant]/dashboard/organization/NewOrg";
import OrgManagement from "@/app/(dashboard)/[tenant]/dashboard/organization/OrgManagement";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";

type ScheduleDataItem = typeof ScheduleData[0];


export default function ScheduleList() {
  const [pageSize, setPageSize] = useState(10);
  const [isAddOrg, setIsAddOrg] = useState<"add" | "none" | "edit">("none");
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const columns: Column<ScheduleDataItem>[] = [
    {
      header: "ID",
      key: "id" as keyof ScheduleDataItem,
      size: 80,
    },
    {
      header: "Doctor Name",
      render: (row) => (
        <div className="py-[21px]">
          <p className="font-medium text-xs text-black">
            {row.schedule.doctor_name}
          </p>
        </div>
      ),
      size: 200,
    },
    {
      header: "Department",
      key: "department" as keyof ScheduleDataItem,
      size: 150,
    },
    {
      header: "Day",
      key: "day" as keyof ScheduleDataItem,
      size: 120,
    },
    {
      header: "Start Time",
      key: "start_time" as keyof ScheduleDataItem,
      size: 120,
    },
    {
      header: "End Time",
      key: "end_time" as keyof ScheduleDataItem,
      size: 120,
    },
    {
      header: "Actions",
      render: () => (
        <button className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]">
          <Ellipsis className="text-black size-5" />
        </button>
      ),
      size: 100,
    },
  ];

  return (
    <section className="px-[30px] mb-10">
      {isAddOrg === "add" ? (
        <NewOrg setIsAddOrg={setIsAddOrg} />
      ) : isAddOrg === "edit" ? (
        <OrgManagement setIsAddOrg={setIsAddOrg} />
      ) : (
        <>
          <section className="p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D]">
            <header className="flex justify-between items-center border-b-2 py-4 mb-8">
              <h2 className="font-semibold text-xl text-black">Schedule List</h2>

              <Button
                onClick={() => setIsAddOrg("add")}
                className="text-base text-[#4E66A8] font-normal"
              >
                Add Schedule
              </Button>
            </header>
            <header className="flex items-center justify-between gap-5 py-6">
              <ListView pageSize={pageSize} setPageSize={setPageSize} />
              <SearchInput
                onSearch={(query) => console.log("Searching:", query)}
              />
            </header>
            <DataTable
              columns={columns as any}
              data={ScheduleData as any}
              bgHeader="bg-[#003465] text-white"
            />
            <Pagination
              dataLength={ScheduleData.length}
              numOfPages={Math.ceil(ScheduleData.length / pageSize)}
              pageSize={pageSize}
              handlePageClick={handlePageClick}
            />
          </section>
        </>
      )}
    </section>
  );
}