"use client";
import { sideNavigation } from "@/utils/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SideNavigation = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      Cookies.remove("auth_token");
      Cookies.remove("user");
      // Cookies.remove()
      router.push("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };
  const pathName = usePathname();
  const isPathNameMatch = (path: string) => {
    return pathName === path;
  };
  return (
    <div className="lg:fixed lg:w-72 bg-[#003465] overflow-y-scroll z-[100] min-h-screen lg:inset-y-0">
      <div className=" text-white py-12 flex flex-col items-center justify-center gap-2">
        <Image
          width={200}
          height={200}
          src="/assets/logo/logo.png"
          alt=""
          className="w-16 h-16"
        />
        <p>LociCare by Joee</p>
      </div>
      <div className="border-b border-white"></div>
      {sideNavigation.map((item, index) => (
        <div key={item.name} className="w-full">
          {item.showRuler && <div className="border-b border-white"></div>}
          <div className={cn("flex flex-col items-start gap-4  py-6 w-full")}>
            {item.isTitle ? (
              <p className="text-[#E6E6E6] flex gap-3 uppercase pl-16">
                {item.name}
              </p>
            ) : (
              item.href && (
                <div
                  className={cn(
                    " w-full",
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
                  >
                    {item.icon && (
                      <item.icon
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
                      <span className="bg-black  h-1.5 w-1.5 rounded-full"></span>
                    )}
                  </Link>
                </div>
              )
            )}
            <div className="flex flex-col w-full">
              {item.children &&
                item.children.map((child) => {
                  return (
                    <div key={child.title} className="py-1  w-full">
                      <div className="flex   gap-1">
                        {!child.href ? (
                          <button
                            className="capitalize whitespace-nowrap pl-16 text-white flex gap-3"
                            onClick={handleLogout}
                          >
                            {child.icon && (
                              <child.icon className="text-white h-5 w-5" />
                            )}
                            {child.title}
                          </button>
                        ) : (
                          <div
                            className={cn(
                              "pl-16 w-full",
                              isPathNameMatch(child.href) ? "pl-8" : ""
                            )}
                          >
                            <Link
                              href={child.href}
                              className={cn(
                                `capitalize whitespace-nowrap text-white items-center w-full flex gap-3 py-4`,
                                isPathNameMatch(child.href)
                                  ? "text-black  bg-white  rounded-l-full pl-8"
                                  : ""
                              )}
                            >
                              {child.icon && (
                                <child.icon
                                  className={cn(
                                    "text-white h-5 w-5 relative z-10 ",
                                    isPathNameMatch(child.href)
                                      ? " text-[#0085FF]"
                                      : ""
                                  )}
                                />
                              )}
                              {child.title}
                              {isPathNameMatch(child.href) && (
                                <span className="bg-black  h-1.5 w-1.5 rounded-full"></span>
                              )}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          {item.showRuler && index + 1 !== item.children?.length && (
            <div className="border-b border-white"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SideNavigation;
