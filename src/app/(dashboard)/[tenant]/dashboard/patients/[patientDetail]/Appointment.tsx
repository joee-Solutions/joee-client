"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  ArrowDownUp,
  Ellipsis,
  Eye,
  Plus,
  Search,
  Settings2,
  Upload,
} from "lucide-react";
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

type AppointmentDto = {
  id: number;
  date: string;
  doctor: string;
  status: "Approved" | "Pending" | "Cancelled";
  scheduleAt: string;
};

const columns: Column<AppointmentDto>[] = [
  {
    header: "Date",
    render(row) {
      return <p className="font-semibold text-xs text-black">{row.date}</p>;
    },
  },
  {
    header: "Doctor",
    render(row) {
      return <p className="font-medium text-xs text-black">{row.doctor}</p>;
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
              : row.status.toLowerCase() === "cancelled"
              ? "text-[#EC0909] bg-[#FDE6E6]"
              : "text-[#C8AE00] bg-[#FEF9D9]"
          }`}
        >
          {row.status}
        </div>
      );
    },
  },
  {
    header: "Time",
    render(row) {
      return (
        <p className="font-semibold text-xs text-black">{row.scheduleAt}</p>
      );
    },
  },
  {
    header: "Actions",
    render(row) {
      const pathname = window.location.pathname;
      return (
        <Link
          href={pathname + "/appointment"}
          className="size-9 shadow-[0px_4px_25px_0px_#0000001A] flex items-center justify-center px-2 rounded-[4px] border border-[#BFBFBF] bg-[#EDF0F6]"
        >
          <Eye size={20} className="text-[#003465]" />
        </Link>
      );
    },
  },
];

const PatientsTableData: AppointmentDto[] = [
  {
    id: 1,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Approved",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 2,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Approved",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 3,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Pending",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 4,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Cancelled",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 5,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Approved",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 6,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Cancelled",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 7,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Pending",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 8,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Pending",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 9,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Approved",
    scheduleAt: "11:00am - 12:00pm",
  },
  {
    id: 10,
    date: "17 Jul 2024",
    doctor: "Susan Denilson",
    status: "Cancelled",
    scheduleAt: "11:00am - 12:00pm",
  },
];

export default function Appointment() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");

  let payload = {
    page: 1,
    pageSize: 10,
    sortOrder: "asc",
    type: "Approved",
  };

  useEffect(() => {
    // probably use the payload above to call the api for data for the first time
    // or when the value of sortBy changes
  }, []);

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1;

    payload = {
      page: newPage,
      pageSize: 10,
      sortOrder: sortBy,
      type: filterBy,
    };

    // call the API
  };

  return (
    <section className="">
      <header className="flex items-center justify-between gap-5 mb-10">
        <h2 className="font-semibold text-xl text-black">Appointments</h2>
        <Button className="font-normal text-base text-white bg-[#003465] w-[130px] h-[50px]">
          Export <Upload size={16} />
        </Button>
      </header>
      <div className="flex flex-wrap mb-5 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
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
        data={PatientsTableData}
        bgHeader="bg-[#D9EDFF] text-black"
      />
      <Pagination
        dataLength={PatientsTableData.length}
        numOfPages={10}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
