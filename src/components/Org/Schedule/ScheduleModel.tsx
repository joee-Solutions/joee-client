import React, { useState } from 'react';
import { X, Plus, Edit, Trash, Minus } from 'lucide-react';
import Image from 'next/image';
// import docsImage from "@/public/assets/docs.png";

interface Schedule {
  id: string;
  code: string;
  name: string;
  role: string;
  color: string;
  textColor: string;
  borderColor: string;
  image?: string;
  description: string;
  status: 'Active' | 'Inactive';
  phone?: string;
  schedules?: DaySchedule[];
}

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  color?: string;
}

interface FormData {
  employeeName: string;
  role: string;
  department: string;
  selectedDays: string[];
  schedules: DaySchedule[];
}

interface ScheduleModalProps {
  selectedSchedule?: Schedule;
  isEditMode: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (formData: FormData) => void;
  setIsEditMode: (editMode: boolean) => void;
  employees?: { id: string; name: string; role: string }[];
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  selectedSchedule, 
  isEditMode, 
  onClose, 
  onEdit, 
  onDelete, 
  onSave, 
  setIsEditMode,
  employees = []
}) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [formData, setFormData] = useState<FormData>({
    employeeName: selectedSchedule?.name || '',
    role: selectedSchedule?.role || '',
    department: '',
    selectedDays: selectedSchedule?.schedules?.map(s => s.day) || [],
    schedules: selectedSchedule?.schedules || []
  });

  const [repeatAll, setRepeatAll] = useState(false);

  const handleDayToggle = (day: string) => {
    const isCurrentlySelected = formData.selectedDays.includes(day);
    
    if (isCurrentlySelected) {
      // Remove day from both selectedDays and schedules
      setFormData(prev => ({
        ...prev,
        selectedDays: prev.selectedDays.filter(d => d !== day),
        schedules: prev.schedules.filter(s => s.day !== day)
      }));
    } else {
      // Add day to selectedDays and add a default schedule entry
      setFormData(prev => ({
        ...prev,
        selectedDays: [...prev.selectedDays, day],
        schedules: [...prev.schedules, { day, startTime: '08:00', endTime: '17:00' }]
      }));
    }
  };

  const handleScheduleChange = (day: string, field: 'startTime' | 'endTime', value: string, scheduleIndex?: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, index) => {
        if (schedule.day === day) {
          // If scheduleIndex is provided, only update that specific schedule
          if (scheduleIndex !== undefined) {
            const daySchedules = prev.schedules.filter(s => s.day === day);
            const currentScheduleIndex = prev.schedules.findIndex((s, i) => s.day === day && daySchedules.indexOf(s) === scheduleIndex);
            return index === currentScheduleIndex ? { ...schedule, [field]: value } : schedule;
          } else {
            // Update the first schedule for that day (backwards compatibility)
            const isFirstScheduleOfDay = prev.schedules.findIndex(s => s.day === day) === index;
            return isFirstScheduleOfDay ? { ...schedule, [field]: value } : schedule;
          }
        }
        return schedule;
      })
    }));
  };

  const addTimeSlot = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { day, startTime: '08:00', endTime: '17:00' }]
    }));
  };

  const removeTimeSlot = (day: string, scheduleIndex: number) => {
    setFormData(prev => {
      const daySchedules = prev.schedules.filter(s => s.day === day);
      
      // Don't allow removing the last time slot for a day
      if (daySchedules.length <= 1) {
        return prev;
      }
      
      const updatedSchedules = [...prev.schedules];
      const globalIndex = updatedSchedules.findIndex((s, i) => {
        const currentDaySchedules = updatedSchedules.filter((schedule, idx) => idx <= i && schedule.day === day);
        return s.day === day && currentDaySchedules.length === scheduleIndex + 1;
      });
      
      if (globalIndex !== -1) {
        updatedSchedules.splice(globalIndex, 1);
      }
      
      return {
        ...prev,
        schedules: updatedSchedules
      };
    });
  };

  const getDayColor = (day: string) => {
    const colors = {
      'Monday': 'bg-blue-100 text-blue-800',
      'Tuesday': 'bg-green-100 text-green-800', 
      'Wednesday': 'bg-blue-100 text-blue-800',
      'Thursday': 'bg-gray-100 text-gray-800',
      'Friday': 'bg-yellow-100 text-yellow-800',
      'Saturday': 'bg-purple-100 text-purple-800',
      'Sunday': 'bg-red-100 text-red-800'
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  // Mock data for the schedule details view
  const mockSchedules = [
    { day: 'Monday', startTime: '11:00am', endTime: '1:00pm', color: 'bg-blue-100 text-blue-800' },
    { day: 'Tuesday', startTime: '10:00am', endTime: '12:00pm', color: 'bg-green-100 text-green-800' },
    { day: 'Friday', startTime: '10:00am', endTime: '12:00pm', color: 'bg-yellow-100 text-yellow-800' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className=" w-full  max-h-[90vh] overflow-y-auto">
        
        {!isEditMode ? (
          // Schedule Details View
          <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Schedule Details</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gray-200">
                <Image width={100} height={100} 
                  src={selectedSchedule?.image || "/assets/docs.png"} 
                  alt={selectedSchedule?.name || "Employee"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedSchedule?.name || "Dr. Cole Joshua"}
              </h3>
              <p className="text-gray-600 mb-2">{selectedSchedule?.role || "Dentist"}</p>
              <p className="text-gray-600">{selectedSchedule?.phone || "+234-123-4567-890"}</p>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Schedules</h4>
              
              <div className="bg-blue-50 px-4 py-3 rounded-t-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium text-gray-700">Available days</div>
                  <div className="font-medium text-gray-700">Start Time</div>
                  <div className="font-medium text-gray-700">End Time</div>
                </div>
              </div>

              <div className="border border-t-0 rounded-b-lg">
                {mockSchedules.map((schedule, index) => (
                  <div key={index} className="px-4 py-4 border-b last:border-b-0">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDayColor(schedule.day)}`}>
                          {schedule.day}
                        </span>
                      </div>
                      <div className="font-medium">{schedule.startTime}</div>
                      <div className="font-medium">{schedule.endTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onEdit}
                className="flex-1 bg-blue-900 text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>
              <button 
                onClick={onDelete}
                className="flex-1 border border-red-600 text-red-600 py-3 px-6 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash size={18} />
                Delete
              </button>
            </div>
          </div>
        ) : (
          // Edit Schedule View
          <div className="p-6  max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">EDIT SCHEDULE</h2>
              <div className="flex items-center gap-4">
                <button className="text-blue-600 hover:text-blue-800">Schedule List</button>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Employee Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Employee</h3>
              <p className="text-gray-600 mb-4">Select employee to create schedule</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee name</label>
                <select
                  value={formData.employeeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">select</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Date and Time Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Schedule date and Time</h3>
              <p className="text-gray-600 mb-6">Select the day and time for the specified schedule</p>
              
              {/* Day Selection */}
              <div className="mb-6">
                <h4 className="font-medium mb-4">Select day</h4>
                <div className="flex flex-wrap gap-3">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        formData.selectedDays.includes(day)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300'
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
                
                <div className="bg-gray-50 px-4 py-3 rounded-t-lg">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="font-medium text-gray-700">Day</div>
                    <div className="font-medium text-gray-700">Schedule Time</div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>

                <div className="border border-t-0 rounded-b-lg">
                  {formData.selectedDays.map((day) => {
                    const daySchedules = formData.schedules.filter(s => s.day === day);
                    return daySchedules.map((schedule, scheduleIndex) => (
                      <div key={`${day}-${scheduleIndex}`} className="px-4 py-4 border-b last:border-b-0">
                        <div className="flex justify-between gap-4 items-center">
                          <div className="font-medium">{schedule.day}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Start time:</span>
                            <select
                              value={schedule.startTime}
                              onChange={(e) => handleScheduleChange(schedule.day, 'startTime', e.target.value, scheduleIndex)}
                              className="border border-blue-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="08:00">08:00 AM</option>
                              <option value="09:00">09:00 AM</option>
                              <option value="10:00">10:00 AM</option>
                              <option value="11:00">11:00 AM</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Stop time:</span>
                            <select
                              value={schedule.endTime}
                              onChange={(e) => handleScheduleChange(schedule.day, 'endTime', e.target.value, scheduleIndex)}
                              className="border border-blue-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="10:00">10:00 AM</option>
                              <option value="12:00">12:00 PM</option>
                              <option value="13:00">13:00 PM</option>
                              <option value="16:30">16:30 PM</option>
                            </select>
                          </div>
                          <button
                            onClick={() => addTimeSlot(schedule.day)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Plus size={16} />
                            Add Time
                          </button>
                          <div className="">
                            {daySchedules.length > 1 && (
                              <button
                                onClick={() => removeTimeSlot(schedule.day, scheduleIndex)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                              >
                                <Minus size={16} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ));
                  })}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="repeatAll"
                    checked={repeatAll}
                    onChange={(e) => setRepeatAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="repeatAll" className="text-sm text-gray-700">Repeat all</label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsEditMode(false)}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSave(formData)}
                className="px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleModal;