"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ArrowDownUp, Ellipsis, Search, Settings2, Upload } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppointmentDTO = {
  date: string;
  firstName: string;
  lastName: string;
  startTime: string;
  endTime: string;
  status: string;
};

const AppointmentTableData: AppointmentDTO[] = [
  {
    date: "21 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Approved",
  },
  {
    date: "22 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Approved",
  },
  {
    date: "23 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Pending",
  },
  {
    date: "24 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Cancelled",
  },
  {
    date: "25 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Cancelled",
  },
  {
    date: "26 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Approved",
  },
  {
    date: "27 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Pending",
  },
  {
    date: "28 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Cancelled",
  },
  {
    date: "29 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Approved",
  },
  {
    date: "30 Jan 2024",
    firstName: "Susan",
    lastName: "Denilson",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    status: "Approved",
  },
];

const columns: Column<AppointmentDTO>[] = [
  {
    header: "Date",
    render(row) {
      return <p>{row.date}</p>;
    },
  },
  {
    header: "Patients",
    render(row) {
      return (
        <div className="flex items-center gap-[10px] py-[21px]">
          <p className="font-medium text-xs text-black">
            {row.firstName} {row.lastName}
          </p>
        </div>
      );
    },
  },
  {
    header: "Time",
    render(row) {
      return (
        <p className="font-semibold text-xs text-black">
          {row.startTime} {row.endTime}
        </p>
      );
    },
  },
  {
    header: "Status",
    render(row) {
      return (
        <div
          className={`flex items-center justify-center font-medium text-xs h-[30px] w-[80px] rounded-[20px] ${
            row.status.toLowerCase() === "approved"
              ? "text-[#3FA907] bg-[#E5F8DA]"
              : row.status.toLowerCase() === "pending"
              ? "text-[#C8AE00] bg-[#FEF9D9]"
              : "text-[#EC0909] bg-[#FDE6E6]"
          }`}
        >
          {row.status}
        </div>
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

export default function AppointmentPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

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

        <div className="ml-auto">
          <Select
            value={sortBy}
            onValueChange={(sortVal: string) => {
              setSortBy(sortVal);
            }}
          >
            <SelectTrigger className="flex py-4 gap-2 h-full min-w-max rounded-[8px] border border-[#B2B2B2] focus:ring-transparent">
              <ArrowDownUp className="text-[#595959] size-5" />
              <SelectValue placeholder={sortBy ? sortBy : "Sort"} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {["Name", "Date", "Location", "Status"].map((currSortVal) => (
                <SelectItem
                  key={currSortVal}
                  value={`${currSortVal}`}
                  className="cursor-pointer hover:bg-[#003465] hover:text-white"
                >
                  {currSortVal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={filterBy}
            onValueChange={(filterVal: string) => {
              setFilterBy(filterVal);
            }}
          >
            <SelectTrigger className="flex py-4 gap-2 h-full min-w-max rounded-[8px] border border-[#B2B2B2] focus:ring-transparent">
              <Settings2 className="text-[#595959] size-5" />
              <SelectValue placeholder={filterBy ? filterBy : "Filter"} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {["Name", "Date", "Location", "Status"].map((currFilterVal) => (
                <SelectItem
                  key={currFilterVal}
                  value={`${currFilterVal}`}
                  className="cursor-pointer hover:bg-[#003465] hover:text-white"
                >
                  {currFilterVal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={AppointmentTableData}
        bgHeader="bg-[#D9EDFF] text-black"
      />
      <Pagination
        dataLength={AppointmentTableData.length}
        numOfPages={1000}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
