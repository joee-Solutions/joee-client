"use client";

import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AppointmentsByDay {
  day: string;
  male: number;
  female: number;
}

interface AppointmentsChartProps {
  data: {
    clinic: string;
    weeklyGrowth: number;
    appointmentsByDay: AppointmentsByDay[];
  };
}

const AppointmentsChart: FC<AppointmentsChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-fit">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg md:text-xl text-black">
          Appointments
        </h3>
        <div className="flex items-center">
          <span className="bg-[#FAD900] text-white text-xs font-medium px-2 py-1 rounded-full mr-2">
            This Week
          </span>
          <span className="text-green-500 text-sm flex items-center">
            +{data.weeklyGrowth}%
            <svg
              className="h-3 w-3 ml-1"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.6275 0.51272C12.7327 0.512587 12.8369 0.533216 12.9342 0.573424C13.0314 0.613631 13.1198 0.672627 13.1942 0.747034C13.2686 0.821441 13.3276 0.909798 13.3678 1.00704C13.408 1.10428 13.4286 1.2085 13.4285 1.31373L13.4285 10.3647C13.4285 10.5771 13.3441 10.7809 13.1939 10.9311C13.0437 11.0813 12.8399 11.1657 12.6275 11.1657C12.415 11.1657 12.2113 11.0813 12.0611 10.9311C11.9109 10.7809 11.8265 10.5771 11.8265 10.3647L11.8276 3.24498L1.87946 13.1931C1.72943 13.3432 1.52595 13.4274 1.31377 13.4274C1.1016 13.4274 0.898117 13.3432 0.748088 13.1931C0.598059 13.0431 0.513775 12.8396 0.513774 12.6274C0.513775 12.4153 0.59806 12.2118 0.748089 12.0618L10.6962 2.11361L3.57652 2.11474C3.47133 2.11474 3.36716 2.09402 3.26998 2.05377C3.1728 2.01351 3.0845 1.95451 3.01012 1.88013C2.93573 1.80575 2.87673 1.71745 2.83648 1.62026C2.79622 1.52308 2.7755 1.41892 2.7755 1.31373C2.7755 1.20854 2.79622 1.10438 2.83648 1.0072C2.87673 0.910014 2.93573 0.821712 3.01012 0.747331C3.0845 0.67295 3.1728 0.613948 3.26998 0.573693C3.36717 0.533439 3.47133 0.51272 3.57652 0.51272L12.6275 0.51272Z"
                fill="#3FA907"
              />
            </svg>
          </span>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-4">{data.clinic}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.appointmentsByDay}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* <YAxis /> */}
            <Tooltip />
            <XAxis dataKey="day" />
            <Legend />
            <Bar dataKey="male" fill="#0A3161" radius={[4, 4, 0, 0]} />
            <Bar dataKey="female" fill="#FFD700" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentsChart;
