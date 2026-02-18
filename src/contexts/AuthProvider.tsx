"use client";
import { getToken } from "@/framework/get-token";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = getToken();
  const router = useRouter();
  const pathName = usePathname();
  useEffect(() => {
    // Only redirect if we're not already on login/verify-otp pages
    const isAuthPage = pathName.includes("/login") || pathName.includes("/verify-otp") || pathName.includes("/forgot-password");
    
    if (!user && !isAuthPage) {
      router.push("/login");
    } else if (user && pathName.includes("/auth") && !isAuthPage) {
      router.push("/");
    }
  }, [user, pathName, router]);
  return <>{children}</>;
};

export default AuthProvider;
