import React from 'react';
import { Schedule } from '../../../types/schedule';


interface ScheduleCardProps {
  schedule: Schedule;
  onViewSchedule: (schedule: Schedule) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onViewSchedule }) => {
  return (
    <div className="relative rounded-lg shadow-md overflow-hidden cursor-pointer">
      <div className={`h-32 ${schedule.color} relative`}>
        {/* Schedule Code Badge */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-md flex items-center justify-center shadow-sm">
          <span className={`font-bold text-lg ${schedule.textColor}`}>
            {schedule.code}
          </span>
        </div>
      </div>
      
      <div className="bg-white p-6 pb-8">
        {/* Profile Image Circle */}
        <div className={`relative -mt-16 w-24 h-24 mx-auto rounded-full overflow-hidden border-4 ${schedule.borderColor} bg-white`}>
          <div className="w-full h-full relative">
            {/* Placeholder for actual image */}
            <div className={`w-full h-full ${schedule.color} opacity-20 flex items-center justify-center`}>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className={`text-2xl font-bold ${schedule.textColor}`}>
                  {schedule.code}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Schedule Name */}
        <h3 className={`text-center text-xl font-bold mt-4 ${schedule.textColor}`}>
          {schedule.name}
        </h3>
        
        {/* Role */}
        <p className={`text-center text-sm mt-1 font-medium ${
          schedule.role === 'Doctor' ? 'text-red-600' : 
          schedule.role === 'Lab Attendant' ? 'text-green-600' : 
          'text-yellow-600'
        }`}>
          {schedule.role}
        </p>
        
        {/* Description */}
        <p className="text-center text-gray-500 text-sm mt-2">
          {schedule.description}
        </p>

        {/* View Schedule Button */}
        <div className="text-center mt-4">
          <button 
            onClick={() => onViewSchedule(schedule)}
            className="bg-slate-700 text-white px-6 py-2 rounded text-sm hover:bg-slate-800 transition-colors"
          >
            View schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;