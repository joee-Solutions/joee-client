"use client";

import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { TimeSelect24h } from "@/components/ui/time-select-24h";
import { valueForTimeSelect24h } from "@/utils/time-options";
import { DatePicker } from "@/components/ui/date-picker";

const AppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentWithId: z.string().min(1, "Appointment with is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  appointmentEndTime: z.string().optional(),
  appointmentDescription: z.string().optional(),
});

type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

interface Appointment {
  id: string;
  patientId?: string;
  doctorId?: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  age?: number;
  appointmentDate: Date;
}

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function EditAppointmentModal({
  appointment,
  onClose,
  onSave,
}: EditAppointmentModalProps) {
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  function formatDateForInput(dateString: string): string {
    if (!dateString) return new Date().toISOString().split("T")[0];
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0];
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }

  const parseInputDate = (raw: string | undefined): Date | undefined => {
    if (!raw) return undefined;
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  function initialStartTime(a: Appointment): string {
    return (
      valueForTimeSelect24h(a.startTime) ||
      valueForTimeSelect24h(a.time?.split(" - ")[0]?.trim()) ||
      ""
    );
  }

  function initialEndTime(a: Appointment): string {
    const tail = a.time?.includes(" - ")
      ? a.time.split(" - ")[1]?.trim()
      : "";
    return valueForTimeSelect24h(a.endTime) || valueForTimeSelect24h(tail) || "";
  }

  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    mode: "onChange",
    defaultValues: {
      patientId: appointment.patientId ?? "",
      appointmentWithId: appointment.doctorId ?? "",
      appointmentDate: formatDateForInput(appointment.date),
      appointmentTime: initialStartTime(appointment),
      appointmentEndTime: initialEndTime(appointment),
      appointmentDescription: appointment.description ?? "",
    },
  });

  // Reset form when appointment changes (e.g. opening edit from view or list)
  useEffect(() => {
    form.reset({
      patientId: appointment.patientId ?? "",
      appointmentWithId: appointment.doctorId ?? "",
      appointmentDate: formatDateForInput(appointment.date),
      appointmentTime: initialStartTime(appointment),
      appointmentEndTime: initialEndTime(appointment),
      appointmentDescription: appointment.description ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when appointment changes
  }, [appointment.id, appointment.patientId, appointment.doctorId, appointment.date, appointment.startTime, appointment.endTime, appointment.time, appointment.description]);

  // Load patients and employees from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const patientsResponse = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_PATIENTS);
        const patientsData = Array.isArray(patientsResponse?.data?.data)
          ? patientsResponse.data.data
          : Array.isArray(patientsResponse?.data)
          ? patientsResponse.data
          : Array.isArray(patientsResponse)
          ? patientsResponse
          : [];

        const patientsList = patientsData.map((patient: any) => {
          const firstName = patient.first_name || patient.firstName || patient.name?.split(" ")[0] || "";
          const lastName = patient.last_name || patient.lastName || patient.name?.split(" ").slice(1).join(" ") || "";
          const name = `${firstName} ${lastName}`.trim() || "Unknown Patient";
          return {
            id: String(patient.id ?? patient._id ?? ""),
            name,
          };
        });
        setPatients(patientsList);

        const employeesResponse = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_EMPLOYEE);
        const employeesData = Array.isArray(employeesResponse?.data?.data)
          ? employeesResponse.data.data
          : Array.isArray(employeesResponse?.data)
          ? employeesResponse.data
          : Array.isArray(employeesResponse)
          ? employeesResponse
          : [];
        
        // Display firstname + lastname only (never email)
        const employeesList = employeesData.map((employee: any) => {
          const firstName = employee.first_name || employee.firstName || employee.firstname || employee.name?.split(" ")[0] || "";
          const lastName = employee.last_name || employee.lastName || employee.lastname || employee.name?.split(" ").slice(1).join(" ") || "";
          const name = `${firstName} ${lastName}`.trim() || "Unknown";
          return {
            id: String(employee.id ?? employee._id ?? ""),
            name,
          };
        });
        setEmployees(employeesList);
      } catch (error) {
        console.error("Failed to load patients/employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // When lists load, set patientId/appointmentWithId by name if we have names but no ids
  useEffect(() => {
    if (isLoading) return;
    const pid = form.getValues("patientId");
    const did = form.getValues("appointmentWithId");
    if (!pid && appointment.patientName && patients.length > 0) {
      const name = appointment.patientName.trim();
      const found = patients.find(
        (p) =>
          p.name === name ||
          p.name.includes(name) ||
          name.includes(p.name) ||
          (p.name && name.startsWith(p.name.split(" ")[0] || ""))
      );
      if (found) form.setValue("patientId", found.id);
    }
    if (!did && appointment.doctorName && employees.length > 0) {
      const found = employees.find((e) => e.name === appointment.doctorName || e.name.includes(appointment.doctorName) || `Dr. ${e.name}` === appointment.doctorName);
      if (found) form.setValue("appointmentWithId", found.id);
    }
  }, [isLoading, appointment.patientName, appointment.doctorName, patients, employees]);

  // Restore body scroll when modal closes
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    };
  }, []);

  const onSubmit = (data: AppointmentSchemaType) => {
    const appointmentDate = new Date(data.appointmentDate);
    const timeStr = data.appointmentEndTime
      ? `${data.appointmentTime} - ${data.appointmentEndTime}`
      : data.appointmentTime;
    const patientName = patients.find((p) => p.id === data.patientId)?.name ?? appointment.patientName;
    const doctorName = employees.find((e) => e.id === data.appointmentWithId)?.name ?? appointment.doctorName;
    onSave({
      patientId: data.patientId,
      doctorId: data.appointmentWithId,
      patientName,
      doctorName,
      appointmentDate,
      date: appointmentDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: timeStr,
      startTime: data.appointmentTime,
      endTime: data.appointmentEndTime,
      description: data.appointmentDescription,
    });
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !z-[110] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-[#003465]">
            Edit Appointment
          </AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Patient name</label>
              <Select
                value={form.watch("patientId")}
                onValueChange={(value) => form.setValue("patientId", value)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="!z-[150] bg-white">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id} className="hover:bg-gray-200">
                        {patient.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-patients" disabled>No patients available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment With (doctor name, not email) */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment with</label>
              <Select
                value={form.watch("appointmentWithId")}
                onValueChange={(value) => form.setValue("appointmentWithId", value)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="!z-[150] bg-white">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : employees.length > 0 ? (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id} className="hover:bg-gray-200">
                        {employee.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-employees" disabled>No employees available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment Date</label>
              <Controller
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <DatePicker
                    date={parseInputDate(field.value)}
                    onDateChange={(d) => {
                      const isoDate = d ? d.toISOString().split("T")[0] : "";
                      field.onChange(isoDate);
                    }}
                    popoverTitle="Appointment date"
                    placeholder="Choose appointment date"
                    className="h-14 rounded border border-[#737373] bg-white"
                  />
                )}
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-base text-black font-normal mb-2">
                Start Time (24h)
              </label>
              <TimeSelect24h
                value={form.watch("appointmentTime")}
                onValueChange={(v) =>
                  form.setValue("appointmentTime", v, { shouldValidate: true })
                }
                placeholder="Select start time"
                className="w-full border border-[#737373] h-14 rounded px-3"
                contentClassName="!z-[150] bg-white"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-base text-black font-normal mb-2">
                End Time (24h)
              </label>
              <TimeSelect24h
                optional
                value={form.watch("appointmentEndTime") ?? ""}
                onValueChange={(v) =>
                  form.setValue("appointmentEndTime", v, { shouldValidate: true })
                }
                placeholder="Optional"
                className="w-full border border-[#737373] h-14 rounded px-3"
                contentClassName="!z-[150] bg-white"
              />
            </div>
          </div>

          {/* Appointment Description */}
          <div>
            <label className="block text-base text-black font-normal mb-2">
              Appointment Description
            </label>
            <Textarea
              {...form.register("appointmentDescription")}
              placeholder="Enter appointment description..."
              className="w-full p-3 min-h-32 border border-[#737373] rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-3 px-8 text-md rounded"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#003465] hover:bg-[#0d2337] text-white py-3 px-8 text-md rounded"
            >
              Save
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

