"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

interface Employee {
  id: number;
  name: string;
  role: string;
  organization: string;
  description?: string;
  image: string;
}

interface EmployeeSectionProps {
  employees: Employee[];
}

const EmployeeSection: FC<EmployeeSectionProps> = ({ employees }) => {
  const mainEmployee = employees[0];
  const otherEmployees = employees.slice(1);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      
      <div className="relative  p-6 text-white  bg-no-repeat bg-center bg-cover h-[170px]" style={{backgroundImage: "url('assets/images/employeebg.png')"}}>
       <div className="absolute inset-0 bg-[#003465] opacity-75 z-0"></div>
      <div className="relative z-10 flex justify-between items-center w-full ">
        <h3 className="font-semibold text-lg ">Employees</h3>
        <Link href="/employees" className="text-sm font-medium flex items-center gap-1 ">
          View all
       
          <svg className="h-3 w-3 ml-1" stroke="currentColor" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M12.2847 0.512721C12.3909 0.512588 12.4961 0.533216 12.5942 0.573424C12.6924 0.613631 12.7815 0.672628 12.8566 0.747035C12.9317 0.821442 12.9912 0.909798 13.0318 1.00704C13.0724 1.10428 13.0932 1.2085 13.0931 1.31373L13.0931 10.3647C13.0931 10.5771 13.0079 10.7809 12.8563 10.9311C12.7047 11.0813 12.4991 11.1657 12.2847 11.1657C12.0703 11.1657 11.8647 11.0813 11.7131 10.9311C11.5615 10.7809 11.4764 10.5771 11.4764 10.3647L11.4775 3.24498L1.43809 13.1931C1.28669 13.3432 1.08134 13.4274 0.867217 13.4274C0.653097 13.4274 0.447747 13.3432 0.296341 13.1931C0.144936 13.0431 0.0598778 12.8396 0.0598778 12.6274C0.0598778 12.4153 0.144937 12.2118 0.296342 12.0618L10.3358 2.11361L3.15072 2.11474C3.04456 2.11474 2.93945 2.09402 2.84137 2.05377C2.7433 2.01351 2.65418 1.95451 2.57912 1.88013C2.50406 1.80575 2.44451 1.71745 2.40389 1.62026C2.36327 1.52308 2.34236 1.41892 2.34236 1.31373C2.34236 1.20854 2.36327 1.10438 2.40389 1.0072C2.44451 0.910015 2.50406 0.821712 2.57912 0.747331C2.65418 0.67295 2.7433 0.613948 2.84137 0.573694C2.93945 0.533439 3.04456 0.51272 3.15072 0.51272L12.2847 0.512721Z" fill="white"/>
</svg>

        </Link>
        </div>
      </div>


      <div className="flex flex-col items-center -mt-12 text-center">
        <div className="relative w-[180px] h-[180px] rounded-full border-8 border-[#003465] overflow-hidden">
          <Image src={mainEmployee.image} alt={mainEmployee.name} fill sizes="180px" className="object-cover" />
        </div>
        <h4 className="mt-4 text-xl font-medium text-black">{mainEmployee.name}</h4>
        <p className="text-gray-500">{mainEmployee.role}</p>
        <p className="text-gray-500">{mainEmployee.organization}</p>
        <p className="mt-3 text-md max-w-lg text-[#999999] px-6">
          {mainEmployee.description}
        </p>
        <button className="my-4 bg-[#003465] text-white px-12 text-lg py-2 rounded-lg shadow hover:bg-[#122a41]">
          View
        </button>
      </div>

    
      <div className="border-t border-gray-200 p-8 grid grid-cols-2 gap-4">
        {otherEmployees.map((employee) => (
          <div key={employee.id} className={`flex items-center gap-3 ${employee.role.includes("Nurse") ? "border-0 md:border-r-2" : "border-0"}`}>
            <div
              className={`relative w-[60px] h-[60px] rounded-full border-2 overflow-hidden ${
                employee.role.includes("Doctor") ? "border-red-500" : "border-yellow-500"
              }`}
            >
              <Image src={employee.image} alt={employee.name} fill sizes="60px" className="object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{employee.name}</h4>
              <p className="text-xs text-gray-500">{employee.role}</p>
              <p className="text-xs text-gray-500">{employee.organization}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSection;
