"use client";
import DynamicTabCompContent from "@/components/Org/DynamicTabCompContent";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = [
  "Departments",
  "Employees",
  "Patients",
  "Appointments",
  "Schedule",
  "Manage Organization",
];

export type TabVal =
  | "Departments"
  | "Employees"
  | "Patients"
  | "Appointments"
  | "Schedule"
  | "Manage Organization";
const ViewPage = () => {
  const [activeTab, setActiveTab] = useState<TabVal>("Departments");

  return (
    <div className="w-full  mx-auto">
      <h2 className="text-lg font-semibold mb-4">General Overview</h2>

      {/* Tabs Navigation */}
      <div className="flex  mb-10 border-b gap-10">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={cn(
              `px-4 py-2 border-b-4`,
              activeTab === tab
                ? "border-[#003465] font-semibold"
                : "border-transparent hover:border-[#003465] text-gray-500 hover:text-[#003465]",
              index === 0 ? "pl-0" : "pl-4"
            )}
            onClick={() => setActiveTab(tab as TabVal)}
          >
            {tab}
          </button>
        ))}
      </div>

        <DynamicTabCompContent tabName={activeTab} />
 
    </div>
  );
};

export default ViewPage;

