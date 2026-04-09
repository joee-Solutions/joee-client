"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import { SearchInput } from "@/components/ui/search";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

type PatientAppointmentRow = {
  id: string;
  sn: number;
  date: string;
  time: string;
  doctorName: string;
  department: string;
};

function parseDateOnlyToLocalDate(raw: unknown): Date {
  if (raw == null) return new Date();
  const s = String(raw).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    return new Date(year, month - 1, day);
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? new Date() : dt;
}

function formatDateForUI(raw: unknown): string {
  const dt = parseDateOnlyToLocalDate(raw);
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(t: string): string {
  if (!t || typeof t !== "string") return "";
  const parts = t.trim().split(/[:\s]/).filter(Boolean);
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function Appointment() {
  const params = useParams();
  const patientId = params?.patientDetail ? String(params.patientDetail) : "";

  const { data: appointmentsResponse } = useSWR(
    API_ENDPOINTS.GET_APPOINTMENTS,
    (url: string) => processRequestOfflineAuth("get", url),
    { revalidateOnFocus: true }
  );

  const [searchQuery, setSearchQuery] = useState("");

  const appointments: PatientAppointmentRow[] = useMemo(() => {
    const raw =
      Array.isArray((appointmentsResponse as any)?.data?.data)
        ? (appointmentsResponse as any).data.data
        : Array.isArray((appointmentsResponse as any)?.data)
          ? (appointmentsResponse as any).data
          : Array.isArray(appointmentsResponse)
            ? appointmentsResponse
            : [];

    const rows: PatientAppointmentRow[] = (raw as any[]).filter((rec) => {
      const patient = rec.patient ?? {};
      const candidate =
        rec.patientId ??
        rec.patient_id ??
        rec.patient?.id ??
        rec.patient?._id ??
        patient.id ??
        patient._id;
      if (candidate == null) return false;
      return String(candidate) === patientId;
    }).map((rec, idx) => {
      const dateStr = rec.date ?? rec.appointmentDate ?? rec.scheduledAt ?? rec.createdAt;
      const date = formatDateForUI(dateStr);

      const startTime = String(rec.startTime ?? "");
      const endTime = String(rec.endTime ?? "");
      const time = startTime && endTime
        ? `${formatTime(startTime)} - ${formatTime(endTime)}`
        : (rec.time as string) ?? "";

      const user = rec.user ?? {};
      const doctorName =
        (rec.doctorName as string) ??
        [user.firstname, user.lastname].filter(Boolean).join(" ") ??
        (user.name as string) ??
        "—";

      const deptRaw = rec.department;
      const department = rec.departmentName ?? rec.department_name ?? (typeof deptRaw === "string" ? deptRaw : deptRaw?.name) ?? "—";

      return {
        id: String(rec.id ?? rec.appointmentId ?? ""),
        sn: idx + 1,
        date,
        time,
        doctorName: String(doctorName),
        department: String(department),
      };
    });

    return rows;
  }, [appointmentsResponse, patientId]);

  const columns: Column<PatientAppointmentRow>[] = [
    {
      header: "S/N",
      key: "sn",
      render: (_row, index = 0) => <span className="font-semibold text-xs text-[#737373]">{index + 1}</span>,
      size: 80,
    },
    { header: "Date", key: "date", size: 160 },
    { header: "Time", key: "time", size: 220 },
    { header: "Doctor", key: "doctorName", size: 220 },
    { header: "Department", key: "department", size: 220 },
  ];

  return (
    <section className="">
      <header className="flex items-center justify-between gap-5 mb-10">
        <h2 className="font-semibold text-xl text-black">Appointments</h2>
      </header>

      <div className="mb-6">
        <SearchInput
          placeholder="Search appointments..."
          onSearch={(q) => setSearchQuery(q)}
        />
      </div>

      {appointments.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#737373]">No appointments found.</div>
      ) : (
      <DataTable
        columns={columns}
          data={appointments as any}
        bgHeader="bg-[#D9EDFF] text-black"
          search={searchQuery}
          searchableKeys={["doctorName", "department", "date", "time"]}
        />
      )}
    </section>
  );
}
