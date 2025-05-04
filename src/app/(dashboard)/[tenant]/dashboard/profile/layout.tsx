import React from "react";

const AdminProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 pb-20 flex flex-col gap-[30px]">
      <header>
        <h3
          className="font-semibold text-2xl text-black gap-1 p-0 flex items-center"
        >
         Admin Overview
        </h3>
      </header>
      {children}
    </div>
  );
};

export default AdminProfileLayout;
