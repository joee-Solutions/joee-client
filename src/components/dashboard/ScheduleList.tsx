"use client";

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Schedule {
  id: string | number;
  employeeName?: string;
  employee_name?: string;
  name?: string;
  role?: string;
  department?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  image?: string;
  profile_picture?: string;
  profilePicture?: string;
  // API response structure
  user?: {
    id: number;
    firstname?: string;
    lastname?: string;
    first_name?: string;
    last_name?: string;
  };
  availableDays?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

interface ScheduleListProps {
  schedules: Schedule[];
}

const ScheduleList: FC<ScheduleListProps> = ({ schedules }) => {
  const getStatusStyles = (status?: string) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-200 text-green-800';
      case 'inactive':
        return 'bg-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getBorderColor = (status?: string) => {
    if (!status) return 'border-gray-500';
    switch (status.toLowerCase()) {
      case 'active':
        return 'border-green-500';
      case 'inactive':
        return 'border-red-500';
      case 'pending':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  // Map schedule data to display format
  // Handle schedules with availableDays - create one entry per day, or use schedule-level data
  const mappedSchedules: Array<{
    id: string | number;
    name: string;
    role: string;
    department: string;
    image: string;
    status: string;
    date: string;
    time: string;
  }> = [];

  schedules.slice(0, 5).forEach((schedule) => {
    // Extract user's firstname and lastname
    const userFirstname = schedule.user?.firstname || schedule.user?.first_name || "";
    const userLastname = schedule.user?.lastname || schedule.user?.last_name || "";
    const name = `${userFirstname} ${userLastname}`.trim() || 
                 schedule.employeeName || 
                 schedule.employee_name || 
                 schedule.name || 
                 "Unknown";
    
    const role = schedule.role || "Employee";
    const department = schedule.department || "General";
    const image = schedule.image || schedule.profile_picture || schedule.profilePicture || "/assets/orgPlaceholder.png";
    const status = schedule.status || "Active";

    // Handle availableDays array - create one entry per day
    if (schedule.availableDays && Array.isArray(schedule.availableDays) && schedule.availableDays.length > 0) {
      schedule.availableDays.forEach((daySchedule: any, dayIndex: number) => {
        const day = daySchedule.day || "N/A";
        const startTime = daySchedule.startTime || daySchedule.start_time || "";
        const endTime = daySchedule.endTime || daySchedule.end_time || "";
        
        // Format time
        const formatTime = (time: string) => {
          if (!time) return "";
          if (time.includes("am") || time.includes("pm") || time.includes("AM") || time.includes("PM")) {
            return time;
          }
          // Convert 24-hour format to 12-hour format
          const [hours, minutes] = time.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "pm" : "am";
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes || "00"}${ampm}`;
        };

        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);
        const time = formattedStartTime && formattedEndTime 
          ? `${formattedStartTime} - ${formattedEndTime}`
          : formattedStartTime || "N/A";

        mappedSchedules.push({
          id: `${schedule.id}-${dayIndex}`,
          name,
          role,
          department,
          image,
          status,
          date: day,
          time,
        });
      });
    } else {
      // Fallback if no availableDays - use schedule-level data
      const date = schedule.date || "N/A";
      const time = schedule.startTime && schedule.endTime 
        ? `${schedule.startTime} - ${schedule.endTime}`
        : schedule.startTime || "N/A";

      mappedSchedules.push({
        id: schedule.id,
        name,
        role,
        department,
        image,
        status,
        date,
        time,
      });
    }
  });

  // Limit to 5 entries for display
  const displaySchedules = mappedSchedules.slice(0, 5);

  if (displaySchedules.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-lg md:text-xl text-black">Schedule List</h3>
          <Link href="/dashboard/schedules" className="text-blue-600 text-sm flex items-center font-medium">
            View all
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>No schedules available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium text-lg md:text-xl text-black">Schedule List</h3>
        <Link href="/dashboard/schedules" className="text-blue-600 text-sm flex items-center font-medium">
          View all
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="divide-y divide-gray-200">
        {displaySchedules.map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between py-4">
            <div className="flex items-center flex-1">
              <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${getBorderColor(schedule.status)} mr-3`}>
                <Image
                  src={schedule.image}
                  alt={schedule.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <Link href={`/dashboard/schedules`} className="font-semibold text-blue-900 text-sm block">
                  {schedule.name}
                </Link>
                <p className="text-gray-500 text-xs">{schedule.role} • {schedule.department}</p>
                <p className="text-gray-400 text-xs mt-1">{schedule.date} • {schedule.time}</p>
              </div>
            </div>
        
            <span className={`px-4 py-2 rounded-lg text-xs font-semibold ${getStatusStyles(schedule.status)}`}>
              {schedule.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;

