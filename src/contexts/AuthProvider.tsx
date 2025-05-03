"use client";
import { getToken } from "@/framework/get-token";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = getToken();
  const router = useRouter();
  const pathName = usePathname();
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    } else {
      if (pathName.includes("auth")) {
        router.push("/");
      }
    }
  }, []);
  return <>{children}</>;
};

export default AuthProvider;
