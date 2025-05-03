"use client";

import { EmployeesData } from "@/components/shared/table/data";

import DataTable from "@/components/shared/table/DataTable";
import { ListView} from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";

export default function Page() {
  const [pageSize, setPageSize] = useState(10);
  const [isAddOrg, setIsAddOrg] = useState<"add" | "none" | "edit">("none");


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
            <DataTable tableDataObj={EmployeesData[0]}>
              {EmployeesData.map((data) => {
                return (
                  <TableRow key={data.id} className="px-3 odd:bg-white even:bg-gray-50  hover:bg-gray-100">
                    <TableCell>{data.id}</TableCell>
                    <TableCell className="py-[21px]">
                      <div className="flex items-center gap-[10px]">
                        <span className="w-[42px] h-42px rounded-full overflow-hidden">
                          <Image
                            src={data.employee.image}
                            alt="employee image"
                            className="object-cover aspect-square w-full h-full"
                          />
                        </span>
                        <p className="font-medium text-xs text-black">
                          {data.employee.employee_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-[#737373]">
                      {data.department}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-[#737373]">
                      {data.designation}
                    </TableCell>
                    <TableCell
                      className={`font-semibold text-xs ${
                        data.status.toLowerCase() === "active"
                          ? "text-[#3FA907]"
                          : "text-[#EC0909]"
                      }`}
                    >
                      {data.status}
                    </TableCell>
                    <TableCell>
                      <button className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]">
                        <Ellipsis className="text-black size-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </DataTable>
            <Pagination
              dataLength={EmployeesData.length}
              numOfPages={1000}
              pageSize={pageSize}
            />
          </section>
        </>

    </section>
  );
}
