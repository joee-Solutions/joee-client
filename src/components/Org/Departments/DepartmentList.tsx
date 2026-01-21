"use client";

import { DepartmentList } from "@/components/shared/table/data";
import AddDepartmentForm from "@/components/Org/Departments/AddDepartmentForm";
import OrgManagement from "@/app/(dashboard)/[tenant]/dashboard/organization/OrgManagement";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";
import { useRouter } from "next/navigation";

type DepartmentData = typeof DepartmentList[0]; 
export default function Page() {
  const [pageSize, setPageSize] = useState(10);
  const [isAddOrg, setIsAddOrg] = useState<"add" | "none" | "edit">("none");
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter(); 

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const handleDepartmentClick = (departmentName: string) => {
    // Format the department name for the URL
    const formattedName = departmentName.toLowerCase().replace(/\s+/g, "-");
    // Navigate to the department page
    router.push(`/dashboard/departments/${formattedName}`);
  };

  const columns: Column<DepartmentData>[] = [
    {
      header: "ID",
      key: "id" as keyof DepartmentData,
      size: 80,
    },
    {
      header: "Department",
      render: (row) => (
        <div className="py-[21px]">
          <p
            className="font-medium text-xs text-black cursor-pointer hover:underline"
            onClick={() => handleDepartmentClick(row.department.department_name)}
          >
            {row.department.department_name}
          </p>
        </div>
      ),
      size: 200,
    },
    {
      header: "No. of Employees",
      key: "no_of_empployees" as keyof DepartmentData,
      size: 150,
    },
    {
      header: "Date Created",
      key: "date_created" as keyof DepartmentData,
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
      {isAddOrg === "add" ? (
        <AddDepartmentForm onCancel={() => setIsAddOrg("none")} />
      ) : isAddOrg === "edit" ? (
        <OrgManagement setIsAddOrg={setIsAddOrg} />
      ) : (
        <>
          <section className="p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D]">
            <header className="flex items-center justify-between border-b-2 gap-5 py-2">
              <h2 className="font-semibold text-xl text-black">
                Department List
              </h2>

              <Button
                onClick={() => setIsAddOrg("add")}
                className="text-base text-[#4E66A8] font-normal"
              >
                Add Department
              </Button>
            </header>
            <header className="flex items-center justify-between gap-5 py-6">
              <ListView pageSize={pageSize} setPageSize={setPageSize} />
              <SearchInput
                onSearch={(query) => console.log("Searching:", query)}
              />
            </header>
            <DataTable
              columns={columns as any}
              data={DepartmentList as any}
              bgHeader="bg-[#003465] text-white"
            />
            <Pagination
              dataLength={DepartmentList.length}
              numOfPages={1000}
              pageSize={pageSize}
              handlePageClick={handlePageClick}
            />
          </section>
        </>
      )}
    </section>
  );
}