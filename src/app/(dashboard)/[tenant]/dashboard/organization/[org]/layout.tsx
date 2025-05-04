import { CircleArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const OrgLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 pb-20 flex flex-col gap-[30px]">
      <div>
        <Link
          href="/dashboard/organization"
          className="font-semibold text-2xl text-black gap-1 p-0 flex items-center"
        >
          <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
          John Ken Hospital
        </Link>
      </div>
      {children}
    </div>
  );
};

export default OrgLayout;
