"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Ellipsis, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ScheduleDTO = {
  availableDay: string;
  startTime: string;
  endTime: string;
};

const ScheduleTableData: ScheduleDTO[] = [
  {
    availableDay: "Monday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },

  {
    availableDay: "Tuesday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },

  {
    availableDay: "Wednesday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },

  {
    availableDay: "Thursday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },

  {
    availableDay: "Friday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },

  {
    availableDay: "Saturday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },

  {
    availableDay: "Sunday",
    startTime: "11:00am",
    endTime: "12:00pm",
  },
];

const columns: Column<ScheduleDTO>[] = [
  {
    header: "Available days",
    render(row) {
      return (
        <div
          className={`flex items-center justify-center font-medium text-xs h-[30px] w-[80px] rounded-[20px] ${
            row.availableDay.toLowerCase() === "monday"
              ? "text-[#003465] bg-[#E6EBF0]"
              : row.availableDay.toLowerCase() === "tuesday"
              ? "text-[#3FA907] bg-[#E5F8DA]"
              : row.availableDay.toLowerCase() === "wednesday"
              ? "text-[#C8AE00] bg-[#FEF9D9]"
              : row.availableDay.toLowerCase() === "thursday"
              ? "text-[#3FA907] bg-[#E5F8DA]"
              : row.availableDay.toLowerCase() === "friday"
              ? "text-[#C8AE00] bg-[#FEF9D9]"
              : "text-[#EC0909] bg-[#FDE6E6]"
          }`}
        >
          {row.availableDay}
        </div>
      );
    },
  },
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
  {
    header: "Action",
    render(row) {
      return (
        <Button
          type="button"
          className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]"
        >
          <Ellipsis className="text-black size-5" />
        </Button>
      );
    },
  },
];

export default function SchedulePage() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

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
        columns={columns}
        data={ScheduleTableData}
        bgHeader="bg-[#D9EDFF] text-black"
      />
      <Pagination
        dataLength={ScheduleTableData.length}
        numOfPages={1000}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
