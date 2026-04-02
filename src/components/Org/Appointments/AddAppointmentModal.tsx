"use client";

import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeSelect24h } from "@/components/ui/time-select-24h";
import { X } from "lucide-react";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { DatePicker } from "@/components/ui/date-picker";

const AppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentWithId: z.string().min(1, "Appointment with is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Start time is required"),
  appointmentEndTime: z.string().optional(),
  appointmentDescription: z.string().optional(),
});

type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

interface AddAppointmentModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AddAppointmentModal({ onClose, onSave }: AddAppointmentModalProps) {
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    mode: "onChange",
    defaultValues: {
      patientId: "",
      appointmentWithId: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentEndTime: "",
      appointmentDescription: "",
    },
  });

  const toISODateLocal = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseInputDate = (raw: string | undefined): Date | undefined => {
    if (!raw) return undefined;
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const year = Number(m[1]);
      const month = Number(m[2]);
      const day = Number(m[3]);
      return new Date(year, month - 1, day);
    }
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

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
          return { id: String(patient.id ?? patient._id ?? ""), name };
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
        const employeesList = employeesData.map((employee: any) => {
          const firstName = employee.first_name || employee.firstName || employee.firstname || employee.name?.split(" ")[0] || "";
          const lastName = employee.last_name || employee.lastName || employee.lastname || employee.name?.split(" ").slice(1).join(" ") || "";
          const name = `${firstName} ${lastName}`.trim() || "Unknown";
          return { id: String(employee.id ?? employee._id ?? ""), name };
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

  const onSubmit = (data: AppointmentSchemaType) => {
    const appointmentDate =
      parseInputDate(data.appointmentDate) ?? new Date();
    const patientName = patients.find((p) => p.id === data.patientId)?.name ?? "";
    const doctorName = employees.find((e) => e.id === data.appointmentWithId)?.name ?? "";
    const timeStr = data.appointmentEndTime
      ? `${data.appointmentTime} - ${data.appointmentEndTime}`
      : data.appointmentTime;
    onSave({
      patientId: data.patientId,
      doctorId: data.appointmentWithId,
      patientName,
      doctorName,
      appointmentDate,
      status: "Pending",
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
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-auto">
        <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-[#003465]">ADD APPOINTMENT</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
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
                      const isoDate = d ? toISODateLocal(d) : "";
                      field.onChange(isoDate);
                    }}
                    popoverTitle="Appointment date"
                    placeholder="Choose appointment date"
                    className="h-14 rounded border border-[#737373] bg-white"
                  />
                )}
              />
            </div>

            {/* Appointment With */}
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
            <label className="block text-base text-black font-normal mb-2">Appointment Description</label>
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
      </div>
    </div>
  );
}

