"use client";

import { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface DepartmentsStatusProps {
  data: {
    activeCount: number;
    inactiveCount: number;
    totalCount: number;
    completionPercentage: number;
  };
  colors: {
    active: string;
    inactive: string;
  };
}

const DepartmentsStatus: FC<DepartmentsStatusProps> = ({ data, colors }) => {
  const activeData = [{ name: "Active", value: data.activeCount }];
  const inactiveData = [{ name: "Inactive", value: data.inactiveCount }];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Departments Status</h3>
        <Link href="/dashboard/departments" className="text-blue-600 text-sm flex items-center font-medium">
          View all
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="flex items-center">
   
        <div className="relative flex-shrink-0 mr-8">
          <ResponsiveContainer width={250} height={250}>
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="50%"
                innerRadius="80%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-250}
                paddingAngle={2}
                dataKey="value"
                cornerRadius={10}
              >
                <Cell fill={colors.active} />
              </Pie>

              <Pie
                data={inactiveData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="75%"
                startAngle={90}
                endAngle={-200}
                paddingAngle={2}
                dataKey="value"
                cornerRadius={10}
              >
                <Cell fill={colors.inactive} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-xl font-medium">{data.completionPercentage}%</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-2">Total number of all departments</p>
          <p className="text-3xl font-medium text-blue-900">{data.totalCount}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <div className="text-center">
            <p className="text-2xl font-medium" style={{ color: colors.active }}>{data.activeCount}</p>
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 " style={{ backgroundColor: colors.active }}></div>
          <p className="text-gray-500 text-sm">Active Departments</p>
          </div>
        </div>

        <div className="text-center">
            <p className="text-2xl font-medium" style={{ color: colors.inactive }}>{data.inactiveCount}</p>
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 " style={{ backgroundColor: colors.inactive }}></div>
          <p className="text-gray-500 text-sm">Inactive Departments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsStatus;

