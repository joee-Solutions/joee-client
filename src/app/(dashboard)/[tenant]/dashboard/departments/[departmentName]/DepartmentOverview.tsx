"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";

export type DepartmentDetailModel = {
  id: string;
  name: string;
  description: string;
  dateCreated: string;
  employeeCount: number;
  status: string;
};

export default function DepartmentOverview({ department }: { department: DepartmentDetailModel }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-black">Department Overview</h2>

      <div className="rounded-lg bg-[#E8F4FD] p-6">
        <h3 className="mb-3 text-sm font-medium text-[#666666]">Description</h3>
        <p className="text-sm leading-relaxed text-[#333333]">
          {department.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-[#E8F4FD] p-4">
          <h4 className="mb-2 text-sm font-medium text-[#666666]">Department name</h4>
          <p className="text-base font-medium text-[#333333]">{department.name}</p>
        </div>

        <div className="rounded-lg bg-[#E8F4FD] p-4">
          <h4 className="mb-2 text-sm font-medium text-[#666666]">Date created</h4>
          <p className="text-base font-medium text-[#333333]">{department.dateCreated}</p>
        </div>

        <div className="rounded-lg bg-[#E8F4FD] p-4">
          <h4 className="mb-2 text-sm font-medium text-[#666666]">Number of employees</h4>
          <p className="text-base font-medium text-[#333333]">{department.employeeCount}</p>
        </div>

        <div className="rounded-lg bg-[#E8F4FD] p-4">
          <h4 className="mb-2 text-sm font-medium text-[#666666]">Status</h4>
          <p className="text-base font-medium text-[#333333]">{department.status}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button
          asChild
          className="bg-[#003465] px-8 py-3 font-medium text-white hover:bg-[#002147]"
        >
          <Link href="/dashboard/departments" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Manage on departments list
          </Link>
        </Button>
      </div>
    </div>
  );
}
