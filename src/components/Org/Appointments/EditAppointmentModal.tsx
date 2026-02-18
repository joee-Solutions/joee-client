"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

const AppointmentSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  appointmentWith: z.string().min(1, "Appointment with is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  status: z.enum(["Approved", "Upcoming", "Pending", "Canceled"]),
  appointmentDescription: z.string().optional(),
});

type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

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
  const [patients, setPatients] = useState<Array<{ id: string | number; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string | number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    mode: "onChange",
    defaultValues: {
      patientName: appointment.patientName || "",
      appointmentWith: appointment.doctorName || "",
      appointmentDate: formatDateForInput(appointment.date),
      appointmentTime: appointment.time?.split(" - ")[0] || appointment.time || "",
      status: appointment.status || "Pending",
      appointmentDescription: appointment.description || "",
    },
  });

  // Load patients and employees from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load patients
        const patientsResponse = await processRequestAuth("get", API_ENDPOINTS.GET_PATIENTS);
        const patientsData = Array.isArray(patientsResponse?.data) 
          ? patientsResponse.data 
          : Array.isArray(patientsResponse) 
          ? patientsResponse 
          : [];
        
        const patientsList = patientsData.map((patient: any) => {
          const firstName = patient.first_name || patient.firstName || patient.name?.split(" ")[0] || "";
          const lastName = patient.last_name || patient.lastName || patient.name?.split(" ").slice(1).join(" ") || "";
          const name = `${firstName} ${lastName}`.trim() || patient.email || "Unknown Patient";
          return {
            id: patient.id || patient._id || "",
            name,
          };
        });
        setPatients(patientsList);

        // Load employees
        const employeesResponse = await processRequestAuth("get", API_ENDPOINTS.GET_EMPLOYEE);
        const employeesData = Array.isArray(employeesResponse?.data) 
          ? employeesResponse.data 
          : Array.isArray(employeesResponse) 
          ? employeesResponse 
          : [];
        
        const employeesList = employeesData.map((employee: any) => {
          const firstName = employee.first_name || employee.firstName || employee.name?.split(" ")[0] || "";
          const lastName = employee.last_name || employee.lastName || employee.name?.split(" ").slice(1).join(" ") || "";
          const name = `${firstName} ${lastName}`.trim() || employee.email || "Unknown Employee";
          return {
            id: employee.id || employee._id || "",
            name: `Dr. ${name}`,
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
    onSave({
      ...data,
      appointmentDate,
      date: appointmentDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      doctorName: data.appointmentWith,
    });
  };

  // Helper function to format date for input
  function formatDateForInput(dateString: string): string {
    if (!dateString) return new Date().toISOString().split("T")[0];
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }

  const statuses = ["Approved", "Upcoming", "Pending", "Canceled"];

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
                value={form.watch("patientName")}
                onValueChange={(value) => form.setValue("patientName", value)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="!z-[150] bg-white">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.name} className="hover:bg-gray-200">
                        {patient.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-patients" disabled>No patients available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment With */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment with</label>
              <Select
                value={form.watch("appointmentWith")}
                onValueChange={(value) => form.setValue("appointmentWith", value)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="!z-[150] bg-white">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : employees.length > 0 ? (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name} className="hover:bg-gray-200">
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
              <Input
                type="date"
                {...form.register("appointmentDate")}
                className="w-full p-3 border border-[#737373] h-14 rounded"
              />
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment Time</label>
              <Input
                placeholder="Enter here"
                type="time"
                {...form.register("appointmentTime")}
                className="w-full p-3 border border-[#737373] h-14 rounded"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Status</label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="!z-[150] bg-white">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="hover:bg-gray-200">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

