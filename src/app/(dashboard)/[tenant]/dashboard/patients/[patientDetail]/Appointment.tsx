"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import Pagination from "@/components/shared/table/pagination";
import { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  ArrowDownUp,
  Ellipsis,
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

type PatientDto = {
  id: number;
  profilePicture: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  gender: string;
};

const columns: Column<PatientDto>[] = [
  {
    header: "#",
    key: "id",
  },
  {
    header: "Patients",
    render(row) {
      return (
        <div className="flex items-center gap-[10px]">
          <span className="w-[42px] h-42px rounded-full overflow-hidden">
            <Image
              src={row.profilePicture}
              alt="patient image"
              width={42}
              height={42}
              className="object-cover aspect-square w-full h-full"
            />
          </span>
          <p className="font-medium text-xs text-black">
            {row.firstName} {row.lastName}
          </p>
        </div>
      );
    },
  },
  {
    header: "Created at",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">{row.createdAt}</p>
      );
    },
  },
  {
    header: "Gender",
    render(row) {
      return (
        <div
          className={`flex items-center justify-center font-medium text-xs h-[30px] w-[69px] rounded-[20px] ${
            row.gender.toLowerCase() === "male"
              ? "text-[#3FA907] bg-[#E5F8DA]"
              : "text-[#EC0909] bg-[#FDE6E6]"
          }`}
        >
          {row.gender[0].toUpperCase() + row.gender.slice(1)}
        </div>
      );
    },
  },
  {
    header: "Actions",
    render(row) {
      return (
        <Link
          href={"/dashboard/organization/1234"}
          className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]"
        >
          <Ellipsis className="text-black size-5" />
        </Link>
      );
    },
  },
];

const PatientsTableData = [
  {
    id: 1,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 2,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "female",
  },
  {
    id: 3,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 4,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 5,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 6,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 7,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 8,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 9,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
  },
  {
    id: 10,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    createdAt: "20 Jan 2024",
    gender: "male",
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
    sortOrder: "",
    type: "upcoming",
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
      sortOrder: "",
      type: sortBy,
    };

    // call the API
  };

  return (
    <section className="">
      <header className="flex items-center justify-between gap-5 mb-10">
        <h2 className="font-semibold text-xl text-black">Medical Records</h2>
        <Button className="font-normal text-base text-white bg-[#003465] w-[130px] h-[50px]">
          New record <Plus />
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
        data={PatientsTableData}
        bgHeader="bg-[#D9EDFF] text-black"
      />
      <Pagination
        dataLength={PatientsTableData.length}
        numOfPages={1000}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
