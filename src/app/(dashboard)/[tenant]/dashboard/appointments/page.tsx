"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AppointmentCalendar from "@/components/Org/Appointments/AppointmentCalendar";
import AppointmentList from "@/components/Org/Appointments/AppointmentList";
import AddAppointmentModal from "@/components/Org/Appointments/AddAppointmentModal";
import ViewAppointmentModal from "@/components/Org/Appointments/ViewAppointmentModal";
import EditAppointmentModal from "@/components/Org/Appointments/EditAppointmentModal";

type ViewMode = "month" | "week" | "day" | "list";
type ModalMode = "add" | "view" | "edit" | null;

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

// Mock appointment data
const mockAppointments: Appointment[] = [
  {
    id: "JOE101",
    patientName: "John Janet Esther",
    doctorName: "Dr. Deniis Hampton",
    department: "Cardiology",
    date: "10 February, 2022",
    time: "09:00 - 10:00 AM",
    status: "Pending",
    description: "Back pain, Discomfort at back.",
    age: 43,
    appointmentDate: new Date(2022, 1, 10, 9, 0),
  },
  {
    id: "JOE102",
    patientName: "Temitope Denilson",
    doctorName: "Dr. Smith",
    department: "Neurology",
    date: "10 February, 2022",
    time: "10:00 - 11:00 AM",
    status: "Approved",
    age: 34,
    appointmentDate: new Date(2022, 1, 10, 10, 0),
  },
];

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2022, 1, 10));
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const handleAddAppointment = () => {
    setModalMode("add");
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalMode("view");
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedAppointment(null);
  };

  const handleSaveAppointment = (appointmentData: Partial<Appointment>) => {
    if (modalMode === "add") {
      const newAppointment: Appointment = {
        ...appointmentData as Appointment,
        id: `JOE${Math.floor(Math.random() * 1000)}`,
      } as Appointment;
      setAppointments([...appointments, newAppointment]);
    } else if (modalMode === "edit" && selectedAppointment) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, ...appointmentData } : apt
        )
      );
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/department/department-bg.jpg')`,
          backgroundColor: '#003465',
        }}
      >
        <div className="absolute inset-0 bg-[#003465] bg-opacity-80"></div>
        <div className="relative w-full px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold text-center">Appointments</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
        {/* Title and Controls */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-black mb-4">Appointments</h2>
          
          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200"></div>
              <span className="text-sm text-gray-700">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200"></div>
              <span className="text-sm text-gray-700">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200"></div>
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200"></div>
              <span className="text-sm text-gray-700">Canceled</span>
            </div>
          </div>
        </div>

        {/* Calendar or List View */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setViewMode("month")}
                variant="outline"
                className="mb-4"
              >
                Back to Calendar
              </Button>
            </div>
            <AppointmentList
              appointments={appointments}
              onViewAppointment={handleViewAppointment}
              onEditAppointment={handleEditAppointment}
              onAddAppointment={handleAddAppointment}
            />
          </div>
        ) : (
          <AppointmentCalendar
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={appointments}
            onViewAppointment={handleViewAppointment}
            onAddAppointment={handleAddAppointment}
          />
        )}

        {/* Floating Action Buttons */}
        {viewMode !== "list" && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
            <button
              onClick={() => setViewMode("list")}
              className="w-14 h-14 bg-[#003465] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#002649] transition-colors"
              aria-label="List view"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
            <button
              onClick={handleAddAppointment}
              className="w-16 h-16 bg-[#003465] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#002649] transition-colors text-2xl font-bold"
              aria-label="Add appointment"
            >
              +
            </button>
          </div>
        )}

        {/* Modals */}
        {modalMode === "add" && (
          <AddAppointmentModal
            onClose={handleCloseModal}
            onSave={handleSaveAppointment}
          />
        )}
        {modalMode === "view" && selectedAppointment && (
          <ViewAppointmentModal
            appointment={selectedAppointment}
            onClose={handleCloseModal}
            onEdit={() => handleEditAppointment(selectedAppointment)}
          />
        )}
        {modalMode === "edit" && selectedAppointment && (
          <EditAppointmentModal
            appointment={selectedAppointment}
            onClose={handleCloseModal}
            onSave={handleSaveAppointment}
          />
        )}
      </div>
    </div>
  );
}
