import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DaySchedule {
  day: string;
  date?: Date;
  startTime: string;
  endTime: string;
}

interface FormData {
  employeeName: string;
  role: string;
  department: string;
  selectedDays: string[];
  schedules: DaySchedule[];
}

interface AddScheduleModalProps {
  onClose: () => void;
  onSave: (formData: FormData) => void;
  editMode?: boolean;
  schedule?: FormData;
  employees: { id: string; firstname: string; lastname: string; name: string }[];
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  onClose,
  onSave,
  editMode = false,
  schedule,
  employees,
}) => {
  const [formData, setFormData] = useState<FormData>({
    employeeName: "",
    role: "Doctor",
    department: "",
    selectedDays: [],
    schedules: [{ day: "", startTime: "", endTime: "" }], // Start with one schedule day
  });

  // Pre-fill the form when editing
  useEffect(() => {
    if (editMode && schedule) {
      setFormData({
        ...schedule,
        schedules: schedule.schedules.length > 0 
          ? schedule.schedules 
          : [{ day: "", startTime: "", endTime: "" }],
      });
    }
  }, [editMode, schedule]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmployeeChange = (value: string) => {
    setFormData({
      ...formData,
      employeeName: value,
    });
  };

  const addScheduleDay = () => {
    setFormData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { day: "", startTime: "", endTime: "" },
      ],
    }));
  };

  const removeScheduleDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));
  };

  const handleScheduleDateChange = (index: number, date: Date | undefined) => {
    setFormData((prev) => {
      const updatedSchedules = [...prev.schedules];
      updatedSchedules[index] = {
        ...updatedSchedules[index],
        date,
      };
      return { ...prev, schedules: updatedSchedules };
    });
  };

  const handleScheduleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setFormData((prev) => {
      const updatedSchedules = [...prev.schedules];
      updatedSchedules[index] = {
        ...updatedSchedules[index],
        [field]: value,
      };
      return { ...prev, schedules: updatedSchedules };
    });
  };

  const handleSubmit = () => {
    if (!formData.employeeName) {
      alert("Please select an employee");
      return;
    }
    if (formData.schedules.length === 0) {
      alert("Please add at least one schedule day");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 !z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 my-8">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-[#003465] mb-2">
                {editMode ? "Edit Schedule" : "Add Schedule"}
          </h2>
              <p className="text-base text-gray-600">
                {editMode
                  ? "Update the schedule details for an employee"
                  : "Create a new schedule for an employee"}
              </p>
        </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#003465] text-[#003465] rounded-lg hover:bg-[#003465] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Employee Information Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#003465] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#003465]">
                  Employee Information
                </h3>
                <p className="text-sm text-gray-600">
                  Select the employee for this schedule
                </p>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.employeeName}
                onValueChange={handleEmployeeChange}
              >
                <SelectTrigger className="w-full h-14 p-3 border border-gray-300 rounded-lg bg-white">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="!z-[150] bg-white">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.name} className="hover:bg-gray-200">
                      {emp.firstname} {emp.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Days and Times Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#003465] flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#003465]">
                  Schedule Days and Times
                </h3>
                <p className="text-sm text-gray-600">
                  Add the days and times when the employee is available
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date Input */}
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        date={schedule.date}
                        onDateChange={(date) => handleScheduleDateChange(index, date)}
                        placeholder="Pick a date"
                        className="w-full"
                      />
                    </div>

                    {/* Start Time Input */}
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            handleScheduleTimeChange(index, "startTime", e.target.value)
                          }
                          className="w-full h-14 p-3 border border-gray-300 rounded-lg pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#003465]"
                          placeholder="--:-- --"
                        />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* End Time Input */}
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            handleScheduleTimeChange(index, "endTime", e.target.value)
                          }
                          className="w-full h-14 p-3 border border-gray-300 rounded-lg pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#003465]"
                          placeholder="--:-- --"
                        />
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  {formData.schedules.length > 1 && (
                    <button
                      onClick={() => removeScheduleDay(index)}
                      className="mt-4 text-red-600 hover:text-red-800 text-sm flex items-center gap-2"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {/* Add Another Date Button */}
              <button
                onClick={addScheduleDay}
                className="w-full py-3 px-4 border-2 border-[#003465] border-dashed text-[#003465] rounded-lg hover:bg-[#003465] hover:text-white transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                Add Another Date
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#003465] text-white rounded-lg hover:bg-[#002147] transition-colors font-medium"
          >
            {editMode ? "Save Changes" : "Create Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;
