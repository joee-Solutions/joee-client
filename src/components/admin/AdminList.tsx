"use client";

import { AdminListData, AppointmentData } from "@/components/shared/table/data";

import DataTable from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";

export default function AdminList() {
  const [pageSize, setPageSize] = useState(10);
  const [isAddOrg, setIsAddOrg] = useState<"add" | "none" | "edit">("none");

  return (
    <section className="px-[30px] mb-10">
      <>
        <section className="p-[29px_14px_30px_24px] shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex items-center justify-between gap-5 py-2 border-b">
            <h2 className="font-medium text-xl text-black">Admin List</h2>
          </header>
          <header className="flex items-center justify-between gap-5 py-6 mt-3">
            <ListView pageSize={pageSize} setPageSize={setPageSize} />
            <SearchInput
              onSearch={(query) => console.log("Searching:", query)}
            />
          </header>
          <DataTable tableDataObj={AdminListData[0]}>
            {AdminListData.map((data) => {
              return (
                <TableRow
                  key={data.ID}
                  className="px-3 odd:bg-white even:bg-gray-50  hover:bg-gray-100 py-4"
                >
                  <TableCell>{data.ID}</TableCell>
                  {/* <TableCell className="py-[21px]">
                      <div className="flex items-center gap-[10px]">
                        <span className="w-[42px] h-42px rounded-full overflow-hidden">
                          <Image
                            src={data.appointment.image}
                            alt="employee image"
                            className="object-cover aspect-square w-full h-full"
                          />
                        </span>
                        <p className="font-medium text-xs text-black">
                          {data.appointment.patient_name}
                        </p>
                      </div>
                    </TableCell> */}
                  <TableCell className="font-semibold text-xs text-[#737373] py-8">
                    {data.name}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-[#737373]">
                    {data.role}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-[#737373]">
                    {data.address}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-[#737373]">
                    {data.phoneNumber}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-[#737373]">
                    {data.email}
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
            dataLength={AppointmentData.length}
            numOfPages={1000}
            pageSize={pageSize}
          />
        </section>
      </>
    </section>
  );
}
