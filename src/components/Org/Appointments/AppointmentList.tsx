"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";
import orgPlaceholder from "./../../../../public/assets/orgPlaceholder.png";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: "Approved" | "Upcoming" | "Pending" | "Canceled";
  description?: string;
  age?: number;
  appointmentDate: Date;
}

interface AppointmentListProps {
  appointments: Appointment[];
  onViewAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onAddAppointment?: () => void;
}

export default function AppointmentList({
  appointments,
  onViewAppointment,
  onEditAppointment,
  onAddAppointment,
}: AppointmentListProps) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const columns: Column<Appointment>[] = [
    {
      header: "ID",
      key: "id" as keyof Appointment,
      size: 80,
    },
    {
      header: "Patient name",
      render: (row) => (
        <div className="flex items-center gap-[10px] py-[21px]">
          <span className="w-[42px] h-[42px] rounded-full overflow-hidden">
            <Image
              src={orgPlaceholder}
              alt="patient image"
              width={42}
              height={42}
              className="object-cover aspect-square w-full h-full rounded-full"
            />
          </span>
          <p className="font-medium text-xs text-black">{row.patientName}</p>
        </div>
      ),
      size: 200,
    },
    {
      header: "Age",
      render: (row) => (
        <span className="font-semibold text-xs text-[#737373]">{row.age || "-"}</span>
      ),
      size: 80,
    },
    {
      header: "Doctor name",
      key: "doctorName" as keyof Appointment,
      size: 150,
    },
    {
      header: "Department",
      key: "department" as keyof Appointment,
      size: 150,
    },
    {
      header: "Date",
      key: "date" as keyof Appointment,
      size: 120,
    },
    {
      header: "Time",
      key: "time" as keyof Appointment,
      size: 120,
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => onViewAppointment(row)}
          className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]"
        >
          <Ellipsis className="text-black size-5" />
        </button>
      ),
      size: 100,
    },
  ];

  return (
    <section className="shadow-[0px_0px_4px_1px_#0000004D] bg-white rounded-lg">
      <header className="flex justify-between items-center border-b-2 py-4 px-6 mb-8">
        <h2 className="font-semibold text-xl text-black uppercase">APPOINTMENT LIST</h2>
        {onAddAppointment && (
          <Button 
            onClick={onAddAppointment}
            className="text-base text-[#4E66A8] font-normal bg-transparent hover:bg-transparent"
          >
            Add Appointment
          </Button>
        )}
      </header>
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between gap-5 py-6">
          <ListView pageSize={pageSize} setPageSize={setPageSize} />
          <SearchInput onSearch={(query) => console.log("Searching:", query)} />
        </div>
        <DataTable
          columns={columns as any}
          data={appointments as any}
          bgHeader="bg-[#003465] text-white"
        />
        <Pagination
          dataLength={appointments.length}
          numOfPages={Math.ceil(appointments.length / pageSize)}
          pageSize={pageSize}
          handlePageClick={handlePageClick}
        />
      </div>
    </section>
  );
}
