"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronRight, Ellipsis, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const employeeCards = [
  {
    id: 1,
    name: "Denise Hampton",
    role: "Doctor",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorFemale.png",
    rgbColorCode: "0, 52, 101",
  },
  {
    id: 2,
    name: "Susan Denilson",
    role: "Lab Attendant",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/labAttendant.png",
    rgbColorCode: "63, 169, 7",
  },
  {
    id: 3,
    name: "Cole Joshua",
    role: "Doctor",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorMale.png",
    rgbColorCode: "236, 9, 9",
  },
  {
    id: 4,
    name: "Jenifer Gloria",
    role: "Nurse",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorFemale.png",
    rgbColorCode: "225, 195, 0",
  },
];

type EmployeeDTO = {
  id: number;
  profilePicture: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  designation: string;
  status: string;
};

const EmployeesTableData: EmployeeDTO[] = [
  {
    id: 1,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 2,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Adeniyi",
    lastName: "Samuel",
    departmentName: "Nephrology",
    designation: "Nurse",
    status: "Active",
  },
  {
    id: 3,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Umaru",
    lastName: "Newton",
    departmentName: "Oncology",
    designation: "Doctor",
    status: "Inactive",
  },
  {
    id: 4,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 5,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 6,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 7,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 8,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 9,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 10,
    profilePicture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    departmentName: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
];

const columns: Column<EmployeeDTO>[] = [
  {
    header: "#",
    key: "id",
  },
  {
    header: "Employee Name",
    render(row) {
      return (
        <div className="flex items-center gap-[10px]">
          <span className="w-[42px] h-42px rounded-full overflow-hidden">
            <Image
              src={row.profilePicture}
              alt="employee image"
              width={42}
              height={42}
              className="object-cover aspect-square w-full h-full rounded-full"
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
    header: "Department Name",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">
          {row.departmentName}
        </p>
      );
    },
  },
  {
    header: "Designation",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">
          {row.designation}
        </p>
      );
    },
  },
  {
    header: "Status",
    render(row) {
      return (
        <p
          className={`font-semibold text-xs ${
            row.status.toLowerCase() === "active"
              ? "text-[#3FA907]"
              : "text-[#EC0909]"
          }`}
        >
          {row.status}
        </p>
      );
    },
  },
  {
    header: "Actions",
    render(row) {
      return (
        <Link
          href={`/dashboard/employees/${row.firstName}-${row.lastName}`}
          className="flex items-center justify-center px-1 py-1 rounded-[2px] border-b border-[#BFBFBF]"
        >
          See Details <ChevronRight className="text-black size-5" />
        </Link>
      );
    },
  },
];

export default function EmployeePage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

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
      type: "sortBy",
    };

    // call the API
  };

  return (
    <section>
      <SectionHeader
        title="Employees"
        description="Employees are the foundation for ensuring good health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px]">
          {employeeCards.map((empCard) => (
            <div
              key={empCard.id}
              className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white flex flex-col overflow-hidden"
            >
              <div
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(${empCard.rgbColorCode},.8)), url('/assets/sectionHeaderBG.png')`,
                }}
                className={`h-[87.2px] bg-cover bg-no-repeat`}
              ></div>
              <div className="pb-5 flex flex-col items-center px-5">
                <div
                  style={{
                    borderWidth: "3px",
                    borderColor: `rgb(${empCard.rgbColorCode})`,
                  }}
                  className="size-[80px] -mt-10 rounded-full mb-[10px] flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={empCard.picture}
                    width={80}
                    height={80}
                    alt={`${empCard.name} photo`}
                  />
                </div>
                <h3 className="font-medium text-sm text-black">
                  {empCard.name}
                </h3>
                <p
                  style={{ color: `rgb(${empCard.rgbColorCode})` }}
                  className="font-medium text-xs text-center mt-2"
                >
                  {empCard.role}
                </p>
                <p className="font-normal text-[10px] my-2 text-center text-[#999999]">
                  {empCard.description}
                </p>
                <Link
                  href={`/dashboard/employees/${empCard.name
                    .split(" ")
                    .join("-")}`}
                  className="rounded-[4px] px-5 py-1 text-white font-medium text-xs bg-[#003465]"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px]">
            <div className="px-[27px]">
              <h2 className="font-semibold text-xl text-black">
                Employee List
              </h2>
            </div>
          </header>
          <div className="px-[27px] pb-[35px]">
            <div className="py-[30px] flex justify-between gap-10">
              <ListView pageSize={pageSize} setPageSize={setPageSize} />
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search data..."
                  className="py-[10px] px-5 pr-11 rounded-[30px] min-w-[318px] bg-[#E6EBF0] w-full font-medium text-sm text-[#4F504F] border-[0.2px] border-[#F9F9F9] outline-none"
                />
                <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <DataTable columns={columns} data={EmployeesTableData} />
          </div>
          <Pagination
            dataLength={EmployeesTableData.length}
            numOfPages={1000}
            pageSize={10}
            handlePageClick={handlePageClick}
          />
        </section>
        <Link
          href="/dashboard/employees/create"
          className="flex justify-center items-center font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 w-[306px] h-[60px] mt-7 self-end"
        >
          Create Employees <Plus size={24} />
        </Link>
      </div>
    </section>
  );
}
