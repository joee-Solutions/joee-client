"use client";

import { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface OrganizationStatusProps {
  data: {
    activeCount: number;
    inactiveCount: number;
    deactivatedCount: number;
    totalCount: number;
    completionPercentage: number;
  };
  colors: {
    active: string;
    inactive: string;
    deactivated: string;
  };
}

const OrganizationStatus: FC<OrganizationStatusProps> = ({ data, colors }) => {
  const activeData = [{ name: "Active", value: data.activeCount }];
  const inactiveData = [{ name: "Inactive", value: data.inactiveCount }];
  const deactivatedData = [{ name: "Deactivated", value: data.deactivatedCount }];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-medium mb-4">Organizations Status</h3>
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

              <Pie
                data={deactivatedData}
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="50%"
                startAngle={90}
                endAngle={-160}
                paddingAngle={2}
                dataKey="value"
                cornerRadius={10}
              >
                <Cell fill={colors.deactivated} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-xl font-medium">{data.completionPercentage}%</div>
          </div>
        </div>

        <div>
          <p className="text-gray-500 mb-2">Total number of all organizations</p>
          <p className="text-3xl font-medium text-blue-900">{data.totalCount}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <div className="text-center">
            <p className="text-2xl font-medium" style={{ color: colors.active }}>{data.activeCount}</p>
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 " style={{ backgroundColor: colors.active }}></div>
          <p className="text-gray-500 text-sm">Active Organization</p>
          </div>
        </div>

        <div className="text-center">
            <p className="text-2xl font-medium" style={{ color: colors.inactive }}>{data.inactiveCount}</p>
          <div className="flex gap-2 items-center">
            <div className="w-3 h-3 " style={{ backgroundColor: colors.inactive }}></div>
          <p className="text-gray-500 text-sm">Inactive Organization</p>
          </div>
        </div>

        <div className="text-center">
            <p className="text-2xl font-medium" style={{ color: colors.deactivated }}>{data.deactivatedCount}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 " style={{ backgroundColor: colors.deactivated }}></div>
          <p className="text-gray-500 text-sm">Deactivated Organization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationStatus;
