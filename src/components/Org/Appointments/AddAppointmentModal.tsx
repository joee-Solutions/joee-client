"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

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
    const appointmentDate = new Date(data.appointmentDate);
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
              <div className="relative">
                <Input
                  type="date"
                  {...form.register("appointmentDate")}
                  className="w-full p-3 border border-[#737373] h-14 rounded pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
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
              <label className="block text-base text-black font-normal mb-2">Start Time</label>
              <Input
                type="time"
                {...form.register("appointmentTime")}
                className="w-full p-3 border border-[#737373] h-14 rounded"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-base text-black font-normal mb-2">End Time</label>
              <Input
                type="time"
                {...form.register("appointmentEndTime")}
                className="w-full p-3 border border-[#737373] h-14 rounded"
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

