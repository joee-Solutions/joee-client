"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const [isRootDomain, setIsRootDomain] = useState<boolean | null>(null); // null = checking
  
  const handleLogout = async () => {
    console.log("logout");
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
    Cookies.remove("otp_verified"); // Clear OTP verification so user needs to verify again
    router.push("/login");
  };
  
  useEffect(() => {
    // Check if we're on a tenant subdomain
    const host = window.location.host;
    let isRoot = false;
    
    // For Vercel: {tenant}.{project}.vercel.app (4 parts) vs {project}.vercel.app (3 parts)
    if (host.includes(".vercel.app")) {
      const parts = host.split(".");
      isRoot = parts.length === 3; // project.vercel.app (no tenant)
    }
    // For localhost: {tenant}.localhost:3000 vs localhost:3000
    else if (host.includes("localhost")) {
      const parts = host.split(".");
      isRoot = parts[0] === "localhost" || host.indexOf(".") === -1;
    }
    // For production domains
    else {
      const parts = host.split(".");
      isRoot = parts.length <= 2 || parts[0] === "www";
    }
    
    setIsRootDomain(isRoot);
    
    if (isRoot) {
      // Root domain access - don't redirect, just show message
      console.log("Root domain accessed - tenant subdomain required");
      return;
    }
    
    // Tenant subdomain - check auth and redirect to login if needed
    // Only redirect if we're not already on login page and no auth token exists
    const currentPath = window.location.pathname;
    if (!Cookies.get("auth_token") && !currentPath.includes("/login") && !currentPath.includes("/verify-otp")) {
      router.push("/login");
    }
  }, [router]);
  
  // Show loading state while checking
  if (isRootDomain === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isRootDomain) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Joee Solutions</h1>
          <p className="text-lg text-gray-600 mb-4">
            This is a multi-tenant application. Please access it using a tenant subdomain.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 font-semibold mb-2">Tenant Missing</p>
            <p className="text-sm text-yellow-700">
              You're accessing the root domain. To use the application, you need to access it via a tenant subdomain.
            </p>
          </div>
          <div className="space-y-2 text-left bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">tenant.localhost:3000</code> (local development)</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">tenant.vercel.app</code> (Vercel deployment)</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">tenant.yourdomain.com</code> (production)</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            If you're trying to access a specific tenant, please contact your administrator for the correct subdomain.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HomePage;
