"use client";

import DataTable from "@/components/shared/table/DataTable";
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

const AppointmentTableData = [
  {
    date: "21 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Approved",
  },
  {
    date: "22 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Approved",
  },
  {
    date: "23 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Pending",
  },
  {
    date: "24 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Cancelled",
  },
  {
    date: "25 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Cancelled",
  },
  {
    date: "26 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Approved",
  },
  {
    date: "27 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Pending",
  },
  {
    date: "28 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Cancelled",
  },
  {
    date: "29 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Approved",
  },
  {
    date: "30 Jan 2024",
    patients: {
      firstName: "Susan",
      lastName: "Denilson",
    },
    time: { start: "11:00am", end: "12:00pm" },
    status: "Approved",
  },
];

export default function AppointmentPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");

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
        tableDataObj={AppointmentTableData[0]}
        bgHeader="bg-[#D9EDFF] text-black"
      >
        {AppointmentTableData.map((data, i) => {
          return (
            <TableRow
              key={data.patients.firstName + data.date + i}
              className="px-3"
            >
              <TableCell>{data.date}</TableCell>
              <TableCell className="py-[21px]">
                <div className="flex items-center gap-[10px]">
                  <p className="font-medium text-xs text-black">
                    {data.patients.firstName} {data.patients.lastName}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-xs text-black">
                {data.time.start} {data.time.end}
              </TableCell>
              <TableCell>
                <div
                  className={`flex items-center justify-center font-medium text-xs h-[30px] w-[69px] rounded-[20px] ${
                    data.status.toLowerCase() === "approved"
                      ? "text-[#3FA907] bg-[#E5F8DA]"
                      : data.status.toLowerCase() === "pending"
                      ? "text-[#C8AE00] bg-[#FEF9D9]"
                      : "text-[#EC0909] bg-[#FDE6E6]"
                  }`}
                >
                  {data.status}
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={"/dashboard/organization/1234"}
                  className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]"
                >
                  <Ellipsis className="text-black size-5" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>
      <Pagination
        dataLength={AppointmentTableData.length}
        numOfPages={1000}
        pageSize={pageSize}
      />
    </section>
  );
}
