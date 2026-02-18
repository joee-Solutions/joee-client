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
import Link from "next/link";

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
        <Link href="/dashboard/appointments" className="text-blue-600 text-sm flex items-center font-medium">
          View all
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
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
