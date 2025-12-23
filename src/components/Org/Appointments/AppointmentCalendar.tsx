"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, addMonths, subMonths } from "date-fns";

type ViewMode = "month" | "week" | "day";

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

interface AppointmentCalendarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  appointments: Appointment[];
  onViewAppointment: (appointment: Appointment) => void;
  onAddAppointment: () => void;
}

const getStatusColor = (status: Appointment["status"]) => {
  switch (status) {
    case "Approved":
      return "bg-green-200 text-green-800";
    case "Upcoming":
      return "bg-blue-200 text-blue-800";
    case "Pending":
      return "bg-yellow-200 text-yellow-800";
    case "Canceled":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

export default function AppointmentCalendar({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  appointments,
  onViewAppointment,
  onAddAppointment,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const handlePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => isSameDay(apt.appointmentDate, date));
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] border rounded-lg p-2 cursor-pointer transition-colors ${
                  !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"
                } ${isSelected ? "ring-2 ring-blue-500" : ""} ${isToday ? "bg-blue-50" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600 font-bold" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAppointment(apt);
                      }}
                      className={`text-xs p-1 rounded truncate ${getStatusColor(apt.status)}`}
                    >
                      {apt.time} {apt.patientName}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate) });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[1200px]">
          <div className="font-semibold text-gray-700"></div>
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toString()} className="text-center">
                <div className={`font-semibold py-2 ${isToday ? "text-blue-600" : ""}`}>
                  {format(day, "EEE")}
                </div>
                <div className={`text-2xl font-bold ${isSelected ? "bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto" : ""}`}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="text-xs text-gray-500 py-2 pr-2 text-right">
                {hour === 0 ? "12:00 am" : hour < 12 ? `${hour}:00 am` : hour === 12 ? "12:00 pm" : `${hour - 12}:00 pm`}
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDate(day);
                // Parse time string to get start hour (e.g., "09:00 - 10:00 AM" -> 9)
                const hourAppointments = dayAppointments.filter((apt) => {
                  const timeMatch = apt.time.match(/(\d{1,2}):\d{2}/);
                  if (timeMatch) {
                    let aptHour = parseInt(timeMatch[1]);
                    // Handle AM/PM
                    if (apt.time.toLowerCase().includes('pm') && aptHour !== 12) {
                      aptHour += 12;
                    } else if (apt.time.toLowerCase().includes('am') && aptHour === 12) {
                      aptHour = 0;
                    }
                    return aptHour === hour;
                  }
                  // Fallback: use appointmentDate hour
                  return apt.appointmentDate.getHours() === hour;
                });
                return (
                  <div key={`${day.toString()}-${hour}`} className="border-t border-gray-200 min-h-[60px] relative">
                    {hourAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => onViewAppointment(apt)}
                        className={`absolute inset-x-1 my-1 p-1 rounded text-xs cursor-pointer ${getStatusColor(apt.status)}`}
                      >
                        {apt.time} {apt.patientName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold">{format(currentDate, "EEEE, MMMM d, yyyy")}</div>
        </div>
        <div className="space-y-2">
          {hours.map((hour) => {
            // Parse time string to get start hour
            const hourAppointments = dayAppointments.filter((apt) => {
              const timeMatch = apt.time.match(/(\d{1,2}):\d{2}/);
              if (timeMatch) {
                let aptHour = parseInt(timeMatch[1]);
                // Handle AM/PM
                if (apt.time.toLowerCase().includes('pm') && aptHour !== 12) {
                  aptHour += 12;
                } else if (apt.time.toLowerCase().includes('am') && aptHour === 12) {
                  aptHour = 0;
                }
                return aptHour === hour;
              }
              // Fallback: use appointmentDate hour
              return apt.appointmentDate.getHours() === hour;
            });
            return (
              <div key={hour} className="flex border-t border-gray-200 py-2">
                <div className="w-24 text-sm text-gray-500 pr-4">
                  {hour === 0 ? "12:00 am" : hour < 12 ? `${hour}:00 am` : hour === 12 ? "12:00 pm" : `${hour - 12}:00 pm`}
                </div>
                <div className="flex-1">
                  {hourAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => onViewAppointment(apt)}
                      className={`p-3 rounded mb-2 cursor-pointer ${getStatusColor(apt.status)}`}
                    >
                      <div className="font-semibold">{apt.time} - {apt.patientName}</div>
                      <div className="text-sm">{apt.doctorName}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <Button onClick={handleToday} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={handlePrevious} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={handleNext} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="text-lg font-semibold ml-4">
            {viewMode === "month" && format(currentDate, "MMMM yyyy")}
            {viewMode === "week" && `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`}
            {viewMode === "day" && format(currentDate, "MMMM d, yyyy")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode("month")}
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            className={viewMode === "month" ? "bg-[#003465] text-white" : ""}
          >
            Month
          </Button>
          <Button
            onClick={() => setViewMode("week")}
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            className={viewMode === "week" ? "bg-[#003465] text-white" : ""}
          >
            Week
          </Button>
          <Button
            onClick={() => setViewMode("day")}
            variant={viewMode === "day" ? "default" : "outline"}
            size="sm"
            className={viewMode === "day" ? "bg-[#003465] text-white" : ""}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
}

