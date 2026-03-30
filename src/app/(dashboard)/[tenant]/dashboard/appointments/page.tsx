"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AppointmentCalendar from "@/components/Org/Appointments/AppointmentCalendar";
import AppointmentList from "@/components/Org/Appointments/AppointmentList";
import AddAppointmentModal from "@/components/Org/Appointments/AddAppointmentModal";
import ViewAppointmentModal from "@/components/Org/Appointments/ViewAppointmentModal";
import EditAppointmentModal from "@/components/Org/Appointments/EditAppointmentModal";
import SuccessModal from "@/components/shared/SuccessModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

type ViewMode = "month" | "week" | "day" | "list";
type ModalMode = "add" | "view" | "edit" | null;

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
  status?: string;
  age?: number;
  appointmentDate: Date;
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

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "Success", message: "" });

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_APPOINTMENTS);
      const raw = Array.isArray(response?.data)
        ? response.data
        : Array.isArray((response as { data?: { data?: unknown[] } })?.data?.data)
          ? (response as { data: { data: unknown[] } }).data.data
          : Array.isArray(response)
            ? response
            : [];
      setAppointments(
        (raw as Record<string, unknown>[]).map((a) => {
          const rec = a as Record<string, unknown>;
          const dateStr = rec.date ?? rec.appointmentDate ?? rec.scheduledAt ?? rec.createdAt;
          const d = dateStr ? new Date(String(dateStr)) : new Date();
          const patient = (rec.patient ?? {}) as Record<string, unknown>;
          const user = (rec.user ?? {}) as Record<string, unknown>;
          const patientName =
            (rec.patientName as string) ??
            (
              [patient.first_name, patient.middle_name, patient.last_name]
                .filter(Boolean)
                .join(" ") || "—"
            );
          const doctorName =
            (rec.doctorName as string) ??
            (
              [user.firstname, user.lastname].filter(Boolean).join(" ") ||
              (user.name as string) ||
              "—"
            );
          const startTime = String(rec.startTime ?? "");
          const endTime = String(rec.endTime ?? "");
          const timeStr =
            startTime && endTime
              ? `${formatTime(startTime)} - ${formatTime(endTime)}`
              : (rec.time as string) ??
                (rec.timeSlot as string) ??
                d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const deptRaw = rec.department;
          const deptName = rec.departmentName ?? rec.department_name;
          const dept =
            typeof deptRaw === "string"
              ? deptRaw
              : (deptRaw as { name?: string } | undefined)?.name ??
                (deptName as string) ??
                (
                  (rec.employee as { department?: { name?: string } } | undefined)?.department
                    ?.name ?? "—"
                );
          const patientId = patient.id ?? patient._id ?? rec.patientId;
          const doctorId = user.id ?? user._id ?? rec.userId ?? rec.doctorId;
          return {
            id: String(rec.id ?? rec.appointmentId ?? ""),
            patientId: patientId != null ? String(patientId) : undefined,
            doctorId: doctorId != null ? String(doctorId) : undefined,
            patientName,
            doctorName,
            department: typeof dept === "string" ? dept : String(dept ?? "—"),
            date: d.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            time: timeStr,
            startTime: (rec.startTime as string) ?? startTime,
            endTime: (rec.endTime as string) ?? endTime,
            description: (rec.description ?? rec.notes) as string | undefined,
            age: (rec.age ?? patient.age) as number | undefined,
            appointmentDate: d,
          };
        })
      );
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to load appointments";
      toast.error(String(msg), { toastId: "appointments-load" });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

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

  const handleSaveAppointment = async (appointmentData: Partial<Appointment>) => {
    const date =
      appointmentData.appointmentDate instanceof Date
        ? appointmentData.appointmentDate
        : new Date(appointmentData.appointmentDate as unknown as string);
    const iso = !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();

    const payload: Record<string, unknown> = {
      patient_id: appointmentData.patientId,
      user_id: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      userId: appointmentData.doctorId,
      date: iso,
      start_time: appointmentData.startTime,
      end_time: appointmentData.endTime || undefined,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      description: appointmentData.description ?? "",
      status: appointmentData.status ?? "pending",
    };

    try {
      if (modalMode === "add") {
        await processRequestOfflineAuth(
          "post",
          API_ENDPOINTS.CREATE_APPOINTMENT(0),
          payload
        );
        setSuccessModal({
          open: true,
          title: "Success",
          message: "Appointment created successfully.",
        });
      } else if (modalMode === "edit" && selectedAppointment) {
        await processRequestOfflineAuth(
          "patch",
          API_ENDPOINTS.UPDATE_APPOINTMENT(0, selectedAppointment.id),
          payload
        );
        setSuccessModal({
          open: true,
          title: "Success",
          message: "Appointment updated successfully.",
        });
      }
      await loadAppointments();
      handleCloseModal();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (e as Error)?.message ??
        "Could not save appointment";
      toast.error(String(msg), { toastId: "appointment-save-error" });
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    const id = appointmentToDelete.id;
    try {
      await processRequestOfflineAuth(
        "delete",
        API_ENDPOINTS.DELETE_APPOINTMENT(0, id)
      );
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
      await loadAppointments();
      setSuccessModal({
        open: true,
        title: "Success",
        message: "Appointment deleted successfully.",
      });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to delete appointment";
      toast.error(String(msg), { toastId: "appointment-delete-error" });
    }
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
          <h2 className="text-3xl font-bold text-black">Appointments</h2>
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
              onDeleteAppointment={handleDeleteAppointment}
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

        {/* Delete Confirmation Modal */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent className="bg-white max-w-md !z-[110]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-black">
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                Are you sure you want to delete the appointment for{" "}
                <span className="font-semibold">
                  {appointmentToDelete?.patientName}
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAppointmentToDelete(null);
                }}
                className="border border-[#D9D9D9] text-[#737373] hover:bg-gray-50"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-[#EC0909] hover:bg-[#D40808] text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <SuccessModal
          open={successModal.open}
          onOpenChange={(open) => setSuccessModal((s) => ({ ...s, open }))}
          title={successModal.title}
          message={successModal.message}
        />
      </div>
    </div>
  );
}
