"use client"

import React, { FC } from 'react';
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { ChartNoAxesColumn } from "lucide-react";


interface StatCardProps {
  title: string;
  value: number;
  growth: number | null;
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon: React.ReactElement;
}

const StatCard: FC<StatCardProps> = ({ title, value, growth, color, icon }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-[#000000]',
      lineColor: 'rgba(10, 49, 97, 0.8)',
      fillColor: 'rgb(217, 225, 232)',
      bgColor: 'bg-[#003465]',
      growthText: 'text-blue-800',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-900',
      lineColor: 'rgba(34, 197, 94, 0.8)',
      fillColor: 'rgb(200, 241, 179)',
      bgColor: 'bg-[#3fa907]',
      growthText: 'text-green-800',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      lineColor: 'rgba(234, 179, 8, 0.8)',
      fillColor: 'rgb(253, 243, 176)',
      bgColor: 'bg-[#fad902]',
      growthText: 'text-yellow-800',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-900',
      lineColor: 'rgba(239, 68, 68, 0.8)',
      fillColor: 'rgb(252, 218, 218)',
      bgColor: 'bg-[#ec090a]',
      growthText: 'text-red-800',
    },
  };

  const colors = colorMap[color];

  const data = [
    { value: 10 },
    { value: 25 },
    { value: 15 },
    { value: 30 },
    { value: 20 },
    { value: 35 },
  ];

  return (


    <div className=" rounded-lg my-8 shadow-xl hover:shadow-2xl relative overflow-hidden bg-white h-[300px] p-0">

    <div className=" p-4 flex flex-col space-y-4">
      <h3 className="text-black text-[16px] font-medium">{title}</h3>
      <div className="flex items-center justify-between">
        <p className={`text-[32px] font-medium ${colors.text}`}>{value}</p>
        <div className={`rounded-full  h-[36px] w-[36px] flex items-center justify-center ${colors.bgColor}`}>
            {icon}
        </div>
      </div>
    {growth !== null && (
      <div className="flex items-center">
        <span className={`${colors.bgColor} text-white text-sm font-medium px-3 py-2 rounded-full`}>
          {growth > 0 ? "+" : ""}{growth}%
        </span>
      </div>
    )}
    </div>


    <ChartNoAxesColumn className={`${colors.text} flex items-center justify-center text-lg font-medium p-2 bg-white z-10 rounded-lg h-[43px] w-[43px] absolute bottom-4 right-6`}/>
    <div className="absolute bottom-0 left-0 w-full h-[150px] p-0">
      <ResponsiveContainer width="100%" height="100%" className="" >
        <AreaChart data={data} >
        {/* <Tooltip /> */}
        <Area type="monotone" dataKey="value" stroke={colors.lineColor} strokeWidth={4} fill={colors.fillColor} dot={true} fillOpacity={1} />
         
        </AreaChart>
      </ResponsiveContainer>
    </div>

  </div>
  );
};

export default StatCard;