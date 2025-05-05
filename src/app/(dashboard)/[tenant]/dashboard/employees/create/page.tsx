"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import DataTable from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronRight, Ellipsis, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

const EmployeesTableData = [
  {
    id: 1,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 2,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Adeniyi",
      lastName: "Samuel",
    },
    department_Name: "Nephrology",
    designation: "Nurse",
    status: "Active",
  },
  {
    id: 3,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Umaru",
      lastName: "Newton",
    },
    department_Name: "Oncology",
    designation: "Doctor",
    status: "Inactive",
  },
  {
    id: 4,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 5,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 6,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 7,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 8,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 9,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
  {
    id: 10,
    employee_Name: {
      profilePicture: "/assets/imagePlaceholder.png",
      firstName: "Susan",
      lastName: "Denilson",
    },
    department_Name: "Opthamology",
    designation: "Doctor",
    status: "active",
  },
];

export default function EmployeeRegistrationForm() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  return (
    <section>
      <SectionHeader
        title="Employees"
        description="Employees are the foundation for ensuring good health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <h4 className="font-medium text-2xl text-[#003465] mb-5">Top Search</h4>
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
              <h2 className="font-semibold text-xl text-black">Add Employee</h2>
            </div>
          </header>
          <div className="px-[27px] pb-[35px]"></div>
        </section>
      </div>
    </section>
  );
}
