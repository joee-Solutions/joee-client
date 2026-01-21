"use client";

import { Button } from "@/components/ui/button";
import { CircleArrowLeft, Building2, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DepartmentOverview from "./DepartmentOverview";
import DepartmentEmployees from "./DepartmentEmployees";
import userProfileImage from "./../../../../../../../public/assets/doctorMale.png";
import Image from "next/image";

const tabBtns = [
  {
    icon: Building2,
    label: "General Overview",
    currTab: 1,
  },
  {
    icon: Users,
    label: "Employees",
    currTab: 2,
  },
];

// Mock department data - replace with actual data from props or API
const departmentData = {
  name: "Opthamology",
  type: "Department",
  hospital: "JON-KEN Medical Hospital",
  image: userProfileImage,
  initials: "OP",
  description: "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed. Mattis porttitor risus elementum feugiat mauris. Nec tortor quisque turpis blandit mauris at tellus.",
  dateCreated: "17-04-1984",
  employeeCount: 24,
  status: "Active"
};

export default function DepartmentDetailPage() {
  const [currTab, setCurrTab] = useState(1);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="py-10 px-5">
      <div className="flex flex-col gap-[30px]">
        {/* Header with Back Button */}
        <div>
          <Button
            onClick={handleBack}
            className="font-semibold text-2xl text-black gap-3 p-0 hover:bg-transparent"
            variant="ghost"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            {departmentData.name}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[398px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="pb-10 px-[54px] pt-[34px] shadow-[0px_0px_4px_1px_#0000004D] h-max rounded-md bg-white">
            {/* Department Profile Section */}
            <div className="flex flex-col gap-[15px] items-center mb-[30px]">
              {/* Department Image with Overlay */}
              <div className="relative">
                <div className="w-[180px] h-[180px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  <Image
                    width={100}
                    height={100}
                    src={departmentData.image}
                    alt={`${departmentData.name} department`}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Department Initials Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#003465] text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl">
                    {departmentData.initials}
                  </div>
                </div>
              </div>
              
              {/* Department Info */}
              <div className="text-center">
                <p className="font-semibold text-2xl text-black">{departmentData.name}</p>
                <p className="text-xs font-normal text-[#999999] mt-1">{departmentData.type}</p>
                <p className="text-xs font-medium text-[#595959] mt-1">{departmentData.hospital}</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-col gap-5">
              {tabBtns.map((tab) => (
                <Button
                  key={tab.currTab}
                  onClick={() => setCurrTab(tab.currTab)}
                  className={`font-medium h-[60px] justify-start text-sm ${
                    currTab === tab.currTab
                      ? "text-[#003465] bg-[#D9EDFF]"
                      : "text-[#737373] bg-[#F3F3F3]"
                  } gap-3 py-[18px] px-7 hover:bg-[#D9EDFF] hover:text-[#003465]`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="px-[25px] pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md overflow-hidden bg-white">
            {currTab === 1 ? (
              <DepartmentOverview  />
            ) : (
              <DepartmentEmployees  />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}