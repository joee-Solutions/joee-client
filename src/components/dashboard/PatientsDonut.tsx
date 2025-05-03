"use client";

import { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface AgeGroup {
  range: string;
  percentage: number;
  color: string;
}

interface PatientsDonutProps {
  data: {
    totalPatients: number;
    ageDistribution: AgeGroup[];
  };
}
const PatientsDonut: FC<PatientsDonutProps> = ({ data }) => {
  return (
    <div className=" bg-white p-6 rounded-lg shadow-md h-fit">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-medium text-black">Patients</h2>
        <Link href="#" className="text-blue-800 text-sm flex items-center">
          View all
          <svg
            className="h-4 w-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-center gap-6">
        <div className="mb-6  ">
          <p className="text-gray-500 text-lg">Total Patients</p>
          <p className="text-xl font-medium text-blue-900">
            {data.totalPatients.toLocaleString()} People
          </p>
        </div>

        <div className="flex items-center gap-6  ">
          <div className="w-[200px] h-[200px] ">
            <div className="relative" style={{ width: "100%", height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    dataKey="percentage"
                    stroke="none"
                  >
                    {data.ageDistribution.map((group, index) => (
                      <Cell key={`cell-${index}`} fill={group.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center ">
                <span className="text-black font-bold text-lg">50%</span>
                <span className="text-xs text-[#595959]">Below 30 years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 flex flex-wrap md:flex-col gap-2 items-center md:items-start justify-center ">
          {data.ageDistribution.map((group, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: group.color }}
              ></span>
              <span className="text-sm text-gray-700">{group.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientsDonut;
