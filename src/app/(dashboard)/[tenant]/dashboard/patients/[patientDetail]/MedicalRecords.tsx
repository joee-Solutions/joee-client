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
  Trash,
  Trash2,
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
import { usePathname } from "next/navigation";

type MedicalRecordDto = {
  id: number;
  name: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  createdAt: string;
};

const MedicalRecordTableData: MedicalRecordDto[] = [
  {
    id: 1,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 2,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 3,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 4,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 5,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 6,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 7,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 8,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 9,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
  {
    id: 10,
    name: "JOE102",
    complaint: "Back pain, Discomfort at back",
    diagnosis: "Back pain, Discomfort at back",
    treatment: "Back pain, Discomfort at back",
    prescription: "Back pain, Discomfort at back",
    createdAt: "20 Jan 2024",
  },
];

export default function MedicalRecords() {
  const pathName = usePathname();
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterBy, setFilterBy] = useState("");

  const numOfPages = Math.ceil(MedicalRecordTableData.length / pageSize);

  const filteredRows = MedicalRecordTableData.map((mr) => {
    if (search.length > 3) {
      const isInlcuded = mr.name.includes(search);
      if (isInlcuded) return mr;
    }

    return mr;
  });

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
        <Link
          href={`${pathName}/new-record`}
          className="flex items-center justify-center gap-2 font-normal text-base text-white bg-[#003465] w-[200px] h-[50px]"
        >
          New record <Plus />
        </Link>
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
      <div className="overflow-x-auto">
        <section className="w-max min-w-[700px] grid gap-[10px]">
          {filteredRows.map((tr, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[max-content_max-content_1fr_max-content] gap-[50px] rounded-[4px] py-5 px-[14px] bg-[#F3F3F3] even:bg-[#D9EDFF]`}
            >
              <p className="font-medium text-xs text-[#595959]">
                {tr.createdAt}
              </p>
              <p className="font-semibold text-xs text-[#003465]">{tr.name}</p>
              <div className="flex flex-col gap-1">
                <p className="font-normal text-xs text-[#595959]">
                  <span className="text-black font-medium text-xs">
                    Complaints:
                  </span>{" "}
                  {tr.complaint}
                </p>
                <p className="font-normal text-xs text-[#595959]">
                  <span className="text-black font-medium text-xs">
                    Diagnosis:
                  </span>{" "}
                  {tr.diagnosis}
                </p>
                <p className="font-normal text-xs text-[#595959]">
                  <span className="text-black font-medium text-xs">
                    Treatment:
                  </span>{" "}
                  {tr.treatment}
                </p>
                <p className="font-normal text-xs text-[#595959]">
                  <span className="text-black font-medium text-xs">
                    Prescriptions:
                  </span>{" "}
                  {tr.prescription}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`${pathName}/${tr.name}`}
                  className="flex items-center justify-center h-9 w-9 text-[#003465] bg-white"
                >
                  <Eye size={20} />
                </Link>
                <Button
                  type="button"
                  className="h-9 w-9 text-[#EC0909] bg-white"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          ))}
        </section>
      </div>
      <Pagination
        dataLength={MedicalRecordTableData.length}
        numOfPages={numOfPages}
        pageSize={pageSize}
        handlePageClick={handlePageClick}
      />
    </section>
  );
}
