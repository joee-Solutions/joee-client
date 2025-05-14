"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { Button } from "@/components/ui/button";
import { ChevronRight, EllipsisVertical, Plus, Search } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const patientCards = [
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

type PatientDto = {
  id: number;
  firstName: string;
  lastName: string;
  picture: string;
  address: string;
  ailment: string;
  age: number;
  phoneNumber: string;
  email: string;
};

const columns: Column<PatientDto>[] = [
  {
    header: "Name",
    render(row) {
      return (
        <div className="flex items-center gap-[10px]">
          <Image
            src={row.picture}
            width={42}
            height={42}
            alt={`${row.firstName} photo`}
            className="rounded-full object-cover shrink-0"
          />
          <p className="font-medium text-xs text-[#737373]">
            {row.firstName} {row.lastName}
          </p>
        </div>
      );
    },
    size: 200,
  },
  {
    header: "Address",
    render(row) {
      return (
        <p className="font-medium text-xs text-[#737373]">{row.address}</p>
      );
    },
  },
  {
    header: "Ailment",
    render(row) {
      return (
        <p className="font-semibold text-xs text-[#737373]">{row.ailment}</p>
      );
    },
  },
  {
    header: "Age",
    render: (row) => (
      <p className="font-semibold text-xs text-[#737373]">{row.age}</p>
    ),
  },
  {
    header: "Phone",
    render: (row) => (
      <p className="font-semibold text-xs text-[#737373]">{row.phoneNumber}</p>
    ),
  },
  {
    header: "Email",
    render: (row) => (
      <p className="font-semibold text-xs text-[#737373]">{row.email}</p>
    ),
  },
  {
    header: "Actions",
    render: (row) => (
      <Link
        href={`/dashboard/patients/${row.firstName}-${row.lastName}`}
        className="flex items-center justify-center px-1 py-1 rounded-[2px] border-b border-[#BFBFBF]"
      >
        See Details <ChevronRight className="text-black size-5" />
      </Link>
    ),
  },
];

const PatientsTableData: PatientDto[] = [
  {
    id: 1,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    ailment: "Lung Cancer",
    age: 29,
    phoneNumber: "(218) 661 8316",
    email: "jenifahudson@gmail.com",
  },
  {
    id: 2,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Adeniyi",
    lastName: "Samuel",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 3,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Umaru",
    lastName: "Newton",
    address: "Los Angeles, U.S.A",
    ailment: "Lung Cancer",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
  },
  {
    id: 4,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 5,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 6,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 7,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 8,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 9,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
  {
    id: 10,
    picture: "/assets/imagePlaceholder.png",
    firstName: "Susan",
    lastName: "Denilson",
    address: "Los Angeles, U.S.A",
    age: 54,
    phoneNumber: "8329393434",
    email: "jenifahudson@gmail.com",
    ailment: "Lung Cancer",
  },
];

export default function PatientPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [rowSelectionIds, setRowSelectionIds] = useState<number[]>([]);
  const toggleRowSelection = (val: number) => {
    setRowSelectionIds((prev) =>
      prev.includes(val) ? prev.filter((id) => id !== val) : [...prev, val]
    );
  };

  const toggleAllRowsSelection = () => {
    // this only cater for when pagination is done from the backend
    const ids = PatientsTableData.map((_, idx) => idx);

    if (rowSelectionIds.length > 0) {
      setRowSelectionIds([]);
      return;
    }

    setRowSelectionIds(ids);
  };

  return (
    <section>
      <SectionHeader
        title="Patients"
        description="Adequate Health care services improves Patients Health   "
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px]">
          {patientCards.map((empCard) => (
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
                  href={`/dashboard/patients/${empCard.name
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
              <h2 className="font-semibold text-xl text-black">Patient List</h2>
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
            <DataTable columns={columns} data={PatientsTableData} />
          </div>
          <Pagination
            dataLength={PatientsTableData.length}
            numOfPages={1000}
            pageSize={10}
          />
        </section>
        <Link
          href="/dashboard/patients/create"
          className="flex justify-center items-center font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 w-[306px] h-[60px] mt-7 self-end"
        >
          Create Patient <Plus size={24} />
        </Link>
      </div>
    </section>
  );
}
