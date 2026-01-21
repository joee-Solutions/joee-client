"use client";

import { AdminListData, AppointmentData } from "@/components/shared/table/data";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";

type AdminData = typeof AdminListData[0];

export default function AdminList() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAddOrg, setIsAddOrg] = useState<"add" | "none" | "edit">("none");

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const columns: Column<AdminData>[] = [
    {
      header: "ID",
      key: "ID" as keyof AdminData,
      size: 100,
    },
    {
      header: "Name",
      key: "name" as keyof AdminData,
      size: 200,
    },
    {
      header: "Role",
      key: "role" as keyof AdminData,
      size: 150,
    },
    {
      header: "Address",
      key: "address" as keyof AdminData,
      size: 250,
    },
    {
      header: "Phone Number",
      key: "phoneNumber" as keyof AdminData,
      size: 150,
    },
    {
      header: "Email",
      key: "email" as keyof AdminData,
      size: 200,
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
          <header className="flex items-center justify-between gap-5 py-2 border-b">
            <h2 className="font-medium text-xl text-black">Admin List</h2>
          </header>
          <header className="flex items-center justify-between gap-5 py-6 mt-3">
            <ListView pageSize={pageSize} setPageSize={setPageSize} />
            <SearchInput
              onSearch={(query) => console.log("Searching:", query)}
            />
          </header>
          <DataTable
            columns={columns as any}
            data={AdminListData as any}
            bgHeader="bg-[#003465] text-white"
          />
          <Pagination
            dataLength={AdminListData.length}
            numOfPages={Math.max(1, Math.ceil(AdminListData.length / pageSize))}
            pageSize={pageSize}
            handlePageClick={handlePageClick}
          />
        </section>
      </>
    </section>
  );
}
