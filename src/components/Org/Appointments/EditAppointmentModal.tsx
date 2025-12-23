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
import { X } from "lucide-react";

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

  // Sample data for dropdowns
  const patients = ["John Janet Esther", "Temitope Denilson", "Jane Smith", "Robert Johnson"];
  const doctors = ["Dr. Deniis Hampton", "Dr. Smith", "Dr. Johnson", "Dr. Williams"];
  const statuses = ["Approved", "Upcoming", "Pending", "Canceled"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-[#003465]">Edit Appointment</h2>
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
                defaultValue={appointment.patientName}
                onValueChange={(value) => form.setValue("patientName", value)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  {patients.map((patient) => (
                    <SelectItem key={patient} value={patient} className="hover:bg-gray-200">
                      {patient}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment With */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment with</label>
              <Select
                defaultValue={appointment.doctorName}
                onValueChange={(value) => form.setValue("appointmentWith", value)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor} className="hover:bg-gray-200">
                      {doctor}
                    </SelectItem>
                  ))}
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
                defaultValue={appointment.status}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="select" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
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
      </div>
    </div>
  );
}

