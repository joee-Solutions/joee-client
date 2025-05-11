import MainHeader from "@/components/shared/MainHeader";
import SideNavigation from "@/components/shared/SideNavigation";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full">
      <div className="hidden lg:!block ">
        <SideNavigation />
      </div>
      <div className="flex flex-col lg:pl-72 w-full">
        <MainHeader />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
