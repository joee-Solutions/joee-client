"use client";

import DataTable from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
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

  const columns = [
    { header: "ID", key: "id" },
    { header: "Patient name", key: "patientName" },
    { header: "Age", key: "age" },
    { header: "Doctor name", key: "doctorName" },
    { header: "Department", key: "department" },
    { header: "Date", key: "date" },
    { header: "Time", key: "time" },
    { header: "Action", key: "action" },
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
        <DataTable columns={columns} data={appointments}>
          {appointments.map((appointment) => {
            return (
              <TableRow key={appointment.id} className="px-3 odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <TableCell>{appointment.id}</TableCell>
                <TableCell className="py-[21px]">
                  <div className="flex items-center gap-[10px]">
                    <span className="w-[42px] h-[42px] rounded-full overflow-hidden">
                      <Image
                        src={orgPlaceholder}
                        alt="patient image"
                        width={42}
                        height={42}
                        className="object-cover aspect-square w-full h-full rounded-full"
                      />
                    </span>
                    <p className="font-medium text-xs text-black">{appointment.patientName}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-xs text-[#737373]">{appointment.age || "-"}</TableCell>
                <TableCell className="font-semibold text-xs text-[#737373]">{appointment.doctorName}</TableCell>
                <TableCell className="font-semibold text-xs text-[#737373]">{appointment.department}</TableCell>
                <TableCell className="font-semibold text-xs text-[#737373]">{appointment.date}</TableCell>
                <TableCell className="font-semibold text-xs text-[#737373]">{appointment.time}</TableCell>
                <TableCell>
                  <button
                    onClick={() => onViewAppointment(appointment)}
                    className="flex items-center justify-center px-2 h-6 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6]"
                  >
                    <Ellipsis className="text-black size-5" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
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
