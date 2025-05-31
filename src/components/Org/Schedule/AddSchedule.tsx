import React, { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";

interface DaySchedule {
  day: string;
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
  schedule?: FormData; // Existing schedule data for editing
  employees: { id: string; name: string }[]; // List of employees
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
    schedules: [],
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Pre-fill the form when editing
  useEffect(() => {
    if (editMode && schedule) {
      setFormData(schedule);
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

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const handleScheduleChange = (
    day: string,
    field: keyof DaySchedule,
    value: string,
    index: number
  ) => {
    setFormData((prev) => {
      const updatedSchedules = prev.schedules.map((schedule, i) =>
        i === index && schedule.day === day
          ? { ...schedule, [field]: value }
          : schedule
      );
      return { ...prev, schedules: updatedSchedules };
    });
  };

  const addTimeSlot = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { day, startTime: "", endTime: "" }],
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter(
        (schedule, i) => !(schedule.day === day && i === index)
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editMode ? "Edit Schedule" : "Add New Schedule"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Employee Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Employee</h3>
          <p className="text-gray-600 mb-4">Select employee to create schedule</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Name
            </label>
            <select
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Date and Time Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Schedule Date and Time</h3>
          <p className="text-gray-600 mb-6">Select the day and time for the schedule</p>

          {/* Day Selection */}
          <div className="mb-6">
            <h4 className="font-medium mb-4">Select Day</h4>
            <div className="flex flex-wrap gap-3">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.selectedDays.includes(day)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-blue-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <h4 className="font-medium mb-4">Select Time</h4>
            <div className="border border-gray-300 rounded-lg">
              {formData.selectedDays.map((day) => {
                const daySchedules = formData.schedules.filter((s) => s.day === day);
                return daySchedules.map((schedule, index) => (
                  <div key={`${day}-${index}`} className="px-4 py-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{schedule.day}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Start Time:</span>
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            handleScheduleChange(day, "startTime", e.target.value, index)
                          }
                          className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">End Time:</span>
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            handleScheduleChange(day, "endTime", e.target.value, index)
                          }
                          className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => addTimeSlot(day)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Plus size={16} />
                      </button>
                      {daySchedules.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(day, index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ));
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editMode ? "Save Changes" : "Add Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;