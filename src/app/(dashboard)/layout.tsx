"use client";
import MainHeader from "@/components/shared/MainHeader";
import SideNavigation from "@/components/shared/SideNavigation";
import React, { useState } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex w-full relative">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:!block">
        <SideNavigation onClose={closeMobileMenu} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar - Slide in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideNavigation onClose={closeMobileMenu} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:pl-72 w-full">
        <MainHeader onToggleMobileMenu={toggleMobileMenu} />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
