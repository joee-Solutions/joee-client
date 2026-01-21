"use client";

import { EmployeesData } from "@/components/shared/table/data";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView} from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";

type EmployeeData = typeof EmployeesData[0];

export default function Page() {
  const [pageSize, setPageSize] = useState(10);
  const [isAddOrg, setIsAddOrg] = useState<"add" | "none" | "edit">("none");
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const columns: Column<EmployeeData>[] = [
    {
      header: "ID",
      key: "id" as keyof EmployeeData,
      size: 80,
    },
    {
      header: "Employee",
      render: (row) => (
        <div className="flex items-center gap-[10px] py-[21px]">
          <span className="w-[42px] h-[42px] rounded-full overflow-hidden">
            <Image
              src={row.employee.image}
              alt="employee image"
              width={42}
              height={42}
              className="object-cover aspect-square w-full h-full"
            />
          </span>
          <p className="font-medium text-xs text-black">
            {row.employee.employee_name}
          </p>
        </div>
      ),
      size: 200,
    },
    {
      header: "Department",
      key: "department" as keyof EmployeeData,
      size: 150,
    },
    {
      header: "Designation",
      key: "designation" as keyof EmployeeData,
      size: 150,
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`font-semibold text-xs ${
            row.status.toLowerCase() === "active"
              ? "text-[#3FA907]"
              : "text-[#EC0909]"
          }`}
        >
          {row.status}
        </span>
      ),
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
  
        <>
          <section className="p-[29px_14px_30px_24px] shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex justify-between items-center border-b-2  py-4 mb-8">
              <h2 className="font-semibold text-xl text-black">
                Employee List
              </h2>
             
              <Button
              onClick={() => setIsAddOrg("add")}
              className="text-base text-[#4E66A8] font-normal"
            >
              Add Employee 
            </Button>
            </header>
            <header className="flex items-center justify-between gap-5 py-6">
              <ListView pageSize={pageSize} setPageSize={setPageSize} />
                <SearchInput onSearch={(query) => console.log('Searching:', query)} />

              
            </header>
            <DataTable
              columns={columns as any}
              data={EmployeesData as any}
              bgHeader="bg-[#003465] text-white"
            />
            <Pagination
              dataLength={EmployeesData.length}
              numOfPages={1000}
              pageSize={pageSize}
              handlePageClick={handlePageClick}
            />
          </section>
        </>

    </section>
  );
}
