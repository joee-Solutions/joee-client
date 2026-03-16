"use client"

import React, { useState, useEffect } from 'react';
import AddScheduleModal from '@/components/Org/Schedule/AddSchedule';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/table/pagination';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { ListView } from '@/components/shared/table/DataTableFilter';
import { Button } from '@/components/ui/button';
import { processRequestOfflineAuth } from '@/framework/offline-https';
import { API_ENDPOINTS } from '@/framework/api-endpoints';
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import SuccessModal from "@/components/shared/SuccessModal";

interface Schedule {
  id: string;
  code: string;
  name: string;
  role: string;
  color: string;
  textColor: string;
  borderColor: string;
  image: string;
  description: string;
  status: "Active" | "Inactive";
}
interface ScheduleFormData {
  employeeName: string;
  role: string;
  department: string;
  selectedDays: string[];
  schedules: { day: string; startTime: string; endTime: string }[];
}

interface TableDataItem {
  id: number | string;
  name: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  employeeId?: number | string;
  scheduleId?: string;
  rawDay?: string;
}

// Sample data for doctor schedules
const schedules: Schedule[] = [
  {
    id: '1',
    code: 'DH',
    name: 'Denise Hampton',
    role: 'Doctor',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '2',
    code: 'SD',
    name: 'Susan Denilson',
    role: 'Lab Attendant',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '3',
    code: 'CJ',
    name: 'Cole Joshua',
    role: 'Doctor',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipvsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '4',
    code: 'JG',
    name: 'Jenifer Gloria',
    role: 'Nurse',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '5',
    code: 'DS',
    name: 'Denilson Susan',
    role: 'Lab Attendant',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
];



const tableData: TableDataItem[] = [
  { id: 1, name: "Jeremy White", department: "Oncology", date: "20 Dec 2023", startTime: "11:00am", endTime: "12:00am" },
  { id: 2, name: "Gary Campbell", department: "Neurology", date: "18 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 3, name: "Richard Bills", department: "Orthopedics", date: "14 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 4, name: "Carol Tynese", department: "Gynaecology", date: "13 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 5, name: "Dare Adeleke", department: "Cardiology", date: "9 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 6, name: "Rose Hilary", department: "Nephrology", date: "29 Nov 2023", startTime: "11:00am", endTime: "12:00pm" },
];

const createColumns = (
  onEdit: (row: TableDataItem) => void,
  onDelete: (row: TableDataItem) => void
): Column<TableDataItem>[] => [
  {
    header: "S/N",
    render: (row, index = 0) => (
      <p className="font-semibold text-xs text-[#737373]">
        {(index ?? 0) + 1}
      </p>
    ),
    size: 80,
  },
  {
    header: "Employee",
    key: "name" as keyof TableDataItem,
    size: 200,
  },
  { header: "Department", key: "department" as keyof TableDataItem, size: 150 },
  { header: "Date", key: "date" as keyof TableDataItem, size: 120 },
  { header: "Start Time", key: "startTime" as keyof TableDataItem, size: 120 },
  { header: "End Time", key: "endTime" as keyof TableDataItem, size: 120 },
  {
    header: "Action",
    render: (row) => (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button 
            type="button"
            className="flex items-center justify-center px-2 py-1 rounded-[2px] border border-[#BFBFBF] bg-[#EDF0F6] hover:bg-[#D9DDE5] transition-colors relative z-10"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="text-black size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-[100]">
          <DropdownMenuItem
            onClick={() => onEdit(row)}
            className="cursor-pointer flex items-center gap-2"
          >
            <Edit className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(row)}
            className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    size: 100,
  },
];

const SchedulesPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [scheduleToEdit, setScheduleToEdit] = useState<TableDataItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<TableDataItem | null>(null);
  const [schedulesData, setSchedulesData] = useState<TableDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<{ id: string; firstname: string; lastname: string; name: string }[]>([]);
  const [successModal, setSuccessModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "Success",
    message: "",
  });

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  // Load schedules from API
  useEffect(() => {
    loadSchedules();
    loadEmployees();
  }, []);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_SCHEDULES);
      
      // Handle different response structures
      const schedules = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      // Transform API data to TableDataItem format
      // Handle schedules that may have multiple availableDays - create one row per day
      const transformedSchedules: TableDataItem[] = [];
      
      schedules.forEach((schedule: any, scheduleIndex: number) => {
        // Extract user's firstname and lastname
        const userFirstname = schedule.user?.firstname || schedule.user?.first_name || schedule.user?.firstName || "";
        const userLastname = schedule.user?.lastname || schedule.user?.last_name || schedule.user?.lastName || "";
        const employeeName = `${userFirstname} ${userLastname}`.trim() || "Unknown Employee";
        
        // Extract department
        const department = schedule.department || 
                          schedule.employee?.department?.name || 
                          schedule.department?.name || 
                          schedule.department_name || 
                          "General";
        
        // Get user/employee ID
        const userId = schedule.user?.id || schedule.employee_id || schedule.employee?.id || schedule.employeeId;
        
        // Handle availableDays array - create one row per day
        if (schedule.availableDays && Array.isArray(schedule.availableDays) && schedule.availableDays.length > 0) {
          schedule.availableDays.forEach((daySchedule: any, dayIndex: number) => {
            const day = daySchedule.day || "";
            const startTime = daySchedule.startTime || daySchedule.start_time || "09:00";
            const endTime = daySchedule.endTime || daySchedule.end_time || "17:00";
            
            // Format time to include AM/PM
            const formatTime = (time: string) => {
              if (!time) return "09:00am";
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
            
            const scheduleId = String(schedule.id ?? schedule._id ?? scheduleIndex);
            transformedSchedules.push({
              id: `${schedule.id || scheduleIndex}-${dayIndex}`,
              name: employeeName,
              department,
              date: day ? (day.length === 10 ? new Date(day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : day) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              startTime: formatTime(startTime),
              endTime: formatTime(endTime),
              employeeId: userId,
              scheduleId,
              rawDay: day || undefined,
            });
          });
        } else {
          // Fallback if no availableDays - use schedule-level data
          const date = schedule.date || 
                      schedule.schedule_date || 
                      schedule.appointment_date ||
                      new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
          
          const startTime = schedule.start_time || schedule.startTime || "09:00am";
          const endTime = schedule.end_time || schedule.endTime || "05:00pm";
          
          const scheduleId = String(schedule.id ?? schedule._id ?? scheduleIndex);
          const dateStr = typeof date === "string" ? date : (date && new Date(date).toISOString?.().split("T")[0]);
          transformedSchedules.push({
            id: schedule.id || schedule._id || scheduleIndex + 1,
            name: employeeName,
            department,
            date: typeof date === 'string' ? date : new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            startTime,
            endTime,
            employeeId: userId,
            scheduleId,
            rawDay: dateStr,
          });
        }
      });

      setSchedulesData(transformedSchedules);
    } catch (error: any) {
      console.error("Failed to load schedules:", error);
      setSchedulesData([]);
      if (error?.response?.status !== 500) {
        toast.error("Failed to load schedules", { toastId: "schedule-load-error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_EMPLOYEE);
      const employeesData = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      const employeesList = employeesData.map((employee: any) => {
        const firstname = employee.first_name || employee.firstName || employee.firstname || employee.name?.split(" ")[0] || "";
        const lastname = employee.last_name || employee.lastName || employee.lastname || employee.name?.split(" ").slice(1).join(" ") || "";
        const name = `${firstname} ${lastname}`.trim() || employee.email || "Unknown Employee";
        return {
          id: String(employee.id || employee._id || ""),
          firstname,
          lastname,
          name,
        };
      });

      setEmployees(employeesList);
    } catch (error: any) {
      console.error("Failed to load employees:", error);
      setEmployees([]);
    }
  };


  const handleEdit = (row: TableDataItem): void => {
    setScheduleToEdit(row);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleDelete = (row: TableDataItem): void => {
    setScheduleToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!scheduleToDelete) return;
    
    try {
      const employeeId = (scheduleToDelete as any).employeeId || scheduleToDelete.id;
      if (!employeeId) {
        toast.error("Employee ID not found", { toastId: "schedule-delete-error" });
        return;
      }

      await processRequestOfflineAuth("delete", API_ENDPOINTS.DELETE_SCHEDULE(employeeId));
      
      setSchedulesData(schedulesData.filter((schedule) => schedule.id !== scheduleToDelete.id));
      toast.success("Schedule deleted successfully", { toastId: "schedule-delete-success" });
      setIsDeleteModalOpen(false);
      setScheduleToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete schedule:", error);
      toast.error("Failed to delete schedule", { toastId: "schedule-delete-error" });
    }
  };

  const handleCreateSchedule = (): void => {
    setScheduleToEdit(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsEditMode(false);
    setIsAddModalOpen(false);
    setScheduleToEdit(null);
  };

  const handleSave = async (formData: ScheduleFormData): Promise<void> => {
    try {
      // Find employee ID from employee name (match by full name)
      const selectedEmployee = employees.find(emp => {
        const empFullName = `${emp.firstname} ${emp.lastname}`.trim();
        return empFullName === formData.employeeName || emp.name === formData.employeeName;
      });
      if (!selectedEmployee) {
        toast.error("Employee not found", { toastId: "schedule-save-error" });
        return;
      }

      const employeeId = selectedEmployee.id;
      
      // Backend expects availableDays[].day (string), startTime (HH:mm), endTime (HH:mm); no duplicate days
      const toHHmm = (t: string | undefined): string => {
        if (!t || typeof t !== "string") return "09:00";
        const trimmed = t.trim();
        const part = trimmed.slice(0, 5); // "HH:mm"
        if (/^\d{1,2}:\d{2}$/.test(part)) return part;
        if (trimmed.length >= 5) return trimmed.slice(0, 5);
        return "09:00";
      };
      const seenDays = new Set<string>();
      const availableDays: Array<{ day: string; startTime: string; endTime: string }> = [];
      for (const schedule of formData.schedules) {
        const dateVal = (schedule as any).date;
        const dayStr = !dateVal
          ? ""
          : typeof dateVal === "string"
            ? dateVal.split("T")[0]
            : dateVal.toISOString?.().split("T")[0] ?? "";
        if (!dayStr || seenDays.has(dayStr)) continue;
        seenDays.add(dayStr);
        availableDays.push({
          day: dayStr,
          startTime: toHHmm(schedule.startTime),
          endTime: toHHmm(schedule.endTime),
        });
      }

      const schedulePayload = {
        availableDays,
      };

      if (isEditMode && scheduleToEdit) {
        // Update existing schedule
        const editEmployeeId = (scheduleToEdit as any).employeeId || scheduleToEdit.id;
        await processRequestOfflineAuth("patch", API_ENDPOINTS.UPDATE_SCHEDULE(editEmployeeId), schedulePayload);
        toast.success("Schedule updated successfully", { toastId: "schedule-update-success" });
        setSuccessModal({ open: true, title: "Success", message: "Schedule updated successfully." });
      } else {
        // Create new schedule
        await processRequestOfflineAuth("post", API_ENDPOINTS.CREATE_SCHEDULE(employeeId), schedulePayload);
        toast.success("Schedule created successfully", { toastId: "schedule-create-success" });
        setSuccessModal({ open: true, title: "Success", message: "Schedule created successfully." });
      }
      
      handleCloseModal();
      await loadSchedules(); // Reload schedules after save
    } catch (error: any) {
      console.error("Failed to save schedule:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save schedule";
      toast.error(errorMessage, { toastId: "schedule-save-error" });
    }
  };

  // const handleAddSchedule = (): void => {
  //   setIsAddModalOpen(true);
  // };

  const filteredSchedules = schedulesData.filter((schedule) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      schedule.name?.toLowerCase().includes(query) ||
      schedule.department?.toLowerCase().includes(query) ||
      schedule.date?.toLowerCase().includes(query)
    );
  });

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8">
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D] bg-white rounded-lg">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px] px-[27px]">
            <h2 className="font-semibold text-xl text-black">Schedule List</h2>

            <Button
              onClick={handleCreateSchedule}
              className="flex items-center gap-2 font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 px-6 h-[40px] rounded"
            >
              Add Schedule <Plus size={20} />
            </Button>
          </header>
          <div className="px-[27px] pb-[35px]">
            <div className="py-[30px] flex justify-between gap-10">
              <ListView pageSize={pageSize} setPageSize={setPageSize} />
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search data..."
                  className="py-[10px] px-5 pr-11 rounded-[30px] min-w-[318px] bg-[#E6EBF0] w-full font-medium text-sm text-[#4F504F] border-[0.2px] border-[#F9F9F9] outline-none"
                />
                <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <p className="text-lg">Loading schedules...</p>
              </div>
            ) : filteredSchedules.length > 0 ? (
              <DataTable columns={columns as any} data={filteredSchedules as any} bgHeader="bg-[#003465] text-white" />
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <p className="text-lg">No schedules found</p>
              </div>
            )}
          </div>
          {filteredSchedules.length > 0 && (
          <Pagination
              dataLength={filteredSchedules.length}
              numOfPages={Math.ceil(filteredSchedules.length / pageSize)}
              pageSize={pageSize}
            handlePageClick={handlePageClick}
          />
          )}
        </section>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddScheduleModal
          onClose={handleCloseModal}
          onSave={handleSave}
          employees={employees}
          editMode={isEditMode}
          schedule={scheduleToEdit ? (() => {
            const toHHmm = (t: string | undefined): string => {
              if (!t || typeof t !== "string") return "09:00";
              const s = t.trim();
              if (/^\d{1,2}:\d{2}$/.test(s)) return s.length === 4 ? `0${s}` : s;
              const match = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
              if (match) {
                let h = parseInt(match[1], 10);
                const m = match[2]?.padStart(2, "0") ?? "00";
                if (match[3]?.toLowerCase() === "pm" && h < 12) h += 12;
                if (match[3]?.toLowerCase() === "am" && h === 12) h = 0;
                return `${String(h).padStart(2, "0")}:${m}`;
              }
              return "09:00";
            };
            const sameScheduleRows = schedulesData.filter(
              (r) => (r.scheduleId != null && r.scheduleId === (scheduleToEdit as TableDataItem).scheduleId) ||
                      (r.employeeId != null && r.employeeId === (scheduleToEdit as TableDataItem).employeeId)
            );
            const rows = sameScheduleRows.length > 0 ? sameScheduleRows : [scheduleToEdit];
            const schedules = rows.map((row) => {
              const d = row.rawDay ?? row.date;
              const dateParsed = !d ? undefined : typeof d === "string" && d.length === 10 ? new Date(d) : typeof d === "string" ? new Date(d) : d;
              const dateObj = dateParsed instanceof Date && !isNaN(dateParsed.getTime()) ? dateParsed : undefined;
              return {
                day: typeof row.rawDay === "string" ? row.rawDay : "",
                date: dateObj,
                startTime: toHHmm(row.startTime),
                endTime: toHHmm(row.endTime),
              };
            }).sort((a, b) => (a.day || "").localeCompare(b.day || ""));
            return {
            employeeName: scheduleToEdit.name,
            role: "Doctor",
            department: scheduleToEdit.department,
            selectedDays: [],
              schedules: schedules.length > 0 ? schedules : [{
              day: "",
                date: undefined,
                startTime: "09:00",
                endTime: "17:00",
              }],
            };
          })() : undefined}
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
              Are you sure you want to delete the schedule for{" "}
              <span className="font-semibold">
                {scheduleToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteModalOpen(false);
                setScheduleToDelete(null);
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
  );
};

export default SchedulesPage;