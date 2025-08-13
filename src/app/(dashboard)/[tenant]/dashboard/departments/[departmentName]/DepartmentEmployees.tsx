"use client";

import DataTable from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Search, Upload, ArrowDownUp, Settings2, Ellipsis } from "lucide-react";
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

const employees = [
    {
      id: 1,
      employee_name: {
        name: "Johnson Raymond",
        picture: "/assets/imagePlaceholder.png",
      },
      designation: "Doctor",
      gender: "Male",
    },
    {
      id: 2,
      employee_name: {
          name: "Susan Denilson",
        picture: "/assets/imagePlaceholder.png",
      },
      designation: "Doctor",
      gender: "Female",
    },
    {
      id: 3,
      employee_name: {
        name: "Lazarus Jennifer",
        picture: "/assets/imagePlaceholder.png",
      },
      designation: "Nurse",
      gender: "Female",
     
    },
    {
      id: 4,
      employee_name: {
          name: "Larry Denilson",
        picture: "/assets/imagePlaceholder.png",
      },
      designation: "Doctor",
      gender: "Male",
     
    },
    {
      id: 5,
      employee_name: {
        name: "John Janeth Esther",
      picture: "/assets/imagePlaceholder.png",
    },
      designation: "Receptionist",
      gender: "Female",
    },
    {
      id: 6,
      employee_name: {
        name: "Paul Jameson",
      picture: "/assets/imagePlaceholder.png",
    },
      designation: "Nurse",
      gender: "Male",
    }
  ];


export default function DepartmentEmployeesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");

  return (
    <section className="">
      <header className="flex items-center justify-between gap-5 mb-10">
        <h2 className="font-semibold text-xl text-black">Employees</h2>
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
        tableDataObj={employees[0]}
        bgHeader="bg-[#D9EDFF] text-black"
      >
        {employees.map((data) => {
          return (
            <TableRow key={data.id} className="px-3">
              <TableCell>{data.id}</TableCell>
              <TableCell className="py-[21px]">
                <div className="flex items-center gap-[10px]">
                  <span className="w-[42px] h-42px rounded-full overflow-hidden">
                    <Image
                      src={data.employee_name.picture}
                      alt="patient image"
                      width={42}
                      height={42}
                      className="object-cover aspect-square w-full h-full"
                    />
                  </span>
                  <p className="font-medium text-xs text-black">
                    {data.employee_name.name}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-xs text-[#737373]">
                {data.designation}
              </TableCell>
              <TableCell>
                <div
                  className={`flex items-center justify-center font-medium text-xs h-[30px] w-[69px] rounded-[20px] ${
                    data.gender.toLowerCase() === "male"
                      ? "text-[#3FA907] bg-[#E5F8DA]"
                      : "text-[#EC0909] bg-[#FDE6E6]"
                  }`}
                >
                  {data.gender[0].toUpperCase() + data.gender.slice(1)}
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
        dataLength={employees.length}
        numOfPages={1000}
        pageSize={pageSize}
      />
    </section>
  );
}
