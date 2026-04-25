"use client";
import MainHeader from "@/components/shared/MainHeader";
import SideNavigation from "@/components/shared/SideNavigation";
import RoleGuard from "@/components/auth/RoleGuard";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { saveLastSession } from "@/lib/auth-store";
import { getTenantId } from "@/framework/https";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keep IndexedDB backup in sync whenever the user is in the dashboard with a cookie session
  // (repairs missed persistence from navigating away before saveLastSession finished).
  useEffect(() => {
    if (!Cookies.get("auth_token")) return;
    saveLastSession(getTenantId()).catch(() => {});
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <RoleGuard>
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
    </RoleGuard>
  );
};

export default DashboardLayout;
