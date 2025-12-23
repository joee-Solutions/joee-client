"use client";
import { sideNavigation } from "@/utils/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SideNavigationProps {
  onClose?: () => void;
}

const SideNavigation = ({ onClose }: SideNavigationProps) => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      Cookies.remove("auth_token");
      Cookies.remove("user");
      Cookies.remove("refresh_token");
      Cookies.remove("otp_verified");
      router.push("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };
  const pathName = usePathname();
  const isPathNameMatch = (path: string) => {
    return pathName === path;
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-72 bg-[#003465] overflow-y-scroll z-[100] min-h-screen lg:fixed lg:inset-y-0 relative">
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors z-10"
        aria-label="Close menu"
      >
        <X size={24} />
      </button>

      <div className="text-white py-12 flex flex-col items-center justify-center gap-2 border-b border-white mb-[59px]">
        <Image
          width={200}
          height={200}
          src="/assets/logo/logo.png"
          alt="LociCare Logo"
          className="w-16 h-16"
          priority
        />
        <p>LociCare by Joee</p>
      </div>
      {sideNavigation.map((item, index) => (
        <div key={item.name} className="w-full">
          <div className={cn("flex flex-col items-start gap-4 w-full")}>
            {item.href && (
              <div
                className={cn(
                  "w-full",
                  isPathNameMatch(item.href) ? "pl-8" : "pl-16"
                )}
              >
                <Link
                  className={cn(
                    "text-white flex gap-3 uppercase w-full py-4 items-center",
                    isPathNameMatch(item.href)
                      ? "text-black bg-white rounded-l-full pl-8"
                      : ""
                  )}
                  href={item.href}
                  onClick={handleLinkClick}
                >
                  {item.icon && (
                    <item.icon
                      size={20}
                      className={cn(
                        "text-inherit",
                        isPathNameMatch(item.href)
                          ? "fill-[#0085FF] text-[#0085FF]"
                          : ""
                      )}
                    />
                  )}
                  {item.name}
                  {isPathNameMatch(item.href) && (
                    <span className="bg-black h-1.5 w-1.5 rounded-full"></span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SideNavigation;
