"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import { X, Edit } from "lucide-react";

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

interface ViewAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewAppointmentModal({
  appointment,
  onClose,
  onEdit,
}: ViewAppointmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-[#003465]">View Appointment</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Name */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Patient name</label>
              <input
                type="text"
                name="patientName"
                value={appointment.patientName}
                disabled
                className="w-full p-3 border border-[#737373] h-14 rounded bg-gray-50"
              />
            </div>

            {/* Appointment With */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment with</label>
              <input
                type="text"
                name="doctorName"
                value={appointment.doctorName}
                disabled
                className="w-full p-3 border border-[#737373] h-14 rounded bg-gray-50"
              />
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment Date</label>
              <input
                type="text"
                name="date"
                value={appointment.date}
                disabled
                className="w-full p-3 border border-[#737373] h-14 rounded bg-gray-50"
              />
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Appointment Time</label>
              <input
                type="text"
                name="time"
                value={appointment.time}
                disabled
                className="w-full p-3 border border-[#737373] h-14 rounded bg-gray-50"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-base text-black font-normal mb-2">Status</label>
              <input
                type="text"
                name="status"
                value={appointment.status}
                disabled
                className="w-full p-3 border border-[#737373] h-14 rounded bg-gray-50"
              />
            </div>
          </div>

          {/* Appointment Description */}
          <div>
            <label className="block text-base text-black font-normal mb-2">
              Appointment Description
            </label>
            <Textarea
              value={appointment.description || ""}
              disabled
              className="w-full p-3 min-h-32 border border-[#737373] rounded bg-gray-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-3 px-8 text-md rounded flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onEdit}
              className="bg-[#003465] hover:bg-[#0d2337] text-white py-3 px-8 text-md rounded flex items-center gap-2"
            >
              <Edit size={18} />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

