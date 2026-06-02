"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  getLastSession,
  LAST_TENANT_COOKIE,
  restoreLastSessionToCookies,
} from "@/lib/auth-store";
import { getTenantSubdomainFromHost } from "@/lib/tenant-host";

const HomePage = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      let hasAuth = !!Cookies.get("auth_token");

      if (!hasAuth) {
        const restored = await restoreLastSessionToCookies();
        if (restored) hasAuth = true;
      }

      const hostTenant =
        typeof window !== "undefined"
          ? getTenantSubdomainFromHost(window.location.host)
          : null;

      const session = await getLastSession();
      const rememberedTenant =
        hostTenant ||
        session?.tenant ||
        Cookies.get(LAST_TENANT_COOKIE) ||
        null;

      if (hostTenant) {
        router.replace(hasAuth ? "/dashboard" : "/login");
      } else if (hasAuth && rememberedTenant) {
        router.replace(`/${rememberedTenant}/dashboard`);
      } else if (hasAuth) {
        router.replace("/dashboard");
      } else if (rememberedTenant) {
        router.replace(`/${rememberedTenant}/login`);
      } else {
        router.replace("/login");
      }

      setIsChecking(false);
    };
    run();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default HomePage;
