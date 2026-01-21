"use client";

import { AllOrgTableData } from "@/components/shared/table/data";
import OrgCardStatus, { InactiveOrgCards } from "../OrgStatCard";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableFilter, {
  ListView,
} from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { Ellipsis, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type OrgData = typeof AllOrgTableData[0];

export default function Page() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const columns: Column<OrgData>[] = [
    {
      header: "ID",
      key: "id" as keyof OrgData,
      size: 80,
    },
    {
      header: "Organization",
      render: (row) => (
        <div className="flex items-center gap-[10px] py-[21px]">
          <span className="w-[42px] h-[42px] rounded-full overflow-hidden">
            <Image
              src={row.organization.image}
              alt="organization image"
              width={42}
              height={42}
              className="object-cover aspect-square w-full h-full"
            />
          </span>
          <p className="font-medium text-xs text-black">
            {row.organization.name}
          </p>
        </div>
      ),
      size: 250,
    },
    {
      header: "Date Created",
      key: "created_at" as keyof OrgData,
      size: 150,
    },
    {
      header: "Location",
      key: "location" as keyof OrgData,
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
      <header className="flex items-center gap-6 justify-between flex-wrap mb-[50px]">
        <h2 className="text-2xl text-black font-normal">Organizations</h2>

        <Button className="font-normal text-base text-white bg-[#003465] w-[306px] h-[60px]">
          Create Organization <Plus size={24} />
        </Button>
      </header>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[19px] mb-[48px]">
        {InactiveOrgCards.map((org) => (
          <OrgCardStatus
            key={org.cardType}
            title={org.title}
            statNum={org.statNum}
            cardType={org.cardType}
            chart={org.chart}
            orgIcon={org.orgIcon}
            barChartIcon={org.barChartIcon}
            OrgPercentChanges={
              org.OrgPercentChanges ? org.OrgPercentChanges : undefined
            }
          />
        ))}
      </div>
      <section className="p-[29px_14px_30px_24px] shadow-[0px_0px_4px_1px_#0000004D]">
        <header className="flex items-center justify-between gap-5">
          <h2 className="font-semibold text-xl text-black">
            Inactive Organization List
          </h2>
          <ListView pageSize={pageSize} setPageSize={setPageSize} />
        </header>
        <DataTableFilter />
        <DataTable
          columns={columns as any}
          data={AllOrgTableData as any}
          bgHeader="bg-[#003465] text-white"
        />
        <Pagination
          dataLength={AllOrgTableData.length}
          numOfPages={1000}
          pageSize={pageSize}
          handlePageClick={handlePageClick}
        />
      </section>
    </section>
  );
}
