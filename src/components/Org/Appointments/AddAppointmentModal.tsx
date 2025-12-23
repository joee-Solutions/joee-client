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
import Link from "next/link";

const AppointmentSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  appointmentWith: z.string().min(1, "Appointment with is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  appointmentDescription: z.string().optional(),
});

type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

interface AddAppointmentModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AddAppointmentModal({ onClose, onSave }: AddAppointmentModalProps) {
  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    mode: "onChange",
    defaultValues: {
      patientName: "",
      appointmentWith: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentDescription: "",
    },
  });

  const onSubmit = (data: AppointmentSchemaType) => {
    const appointmentDate = new Date(data.appointmentDate);
    onSave({
      ...data,
      appointmentDate,
      status: "Pending",
      date: appointmentDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  };

  // Sample data for dropdowns
  const patients = ["John Janet Esther", "Temitope Denilson", "Jane Smith", "Robert Johnson"];
  const doctors = ["Dr. Deniis Hampton", "Dr. Smith", "Dr. Johnson", "Dr. Williams"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-[#003465]">ADD APPOINTMENT</h2>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/appointments" className="text-[#003465] hover:underline text-sm">
              Appointment List
            </Link>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Patient name</label>
              <Select onValueChange={(value) => form.setValue("patientName", value)}>
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
              <div className="relative">
                <Select onValueChange={(value) => form.setValue("appointmentWith", value)}>
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

