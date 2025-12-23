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
    const subdomain = host.split(".")[0];
    const rootDomain = subdomain === "localhost" || subdomain === "www" || host.indexOf(".") === -1;
    
    setIsRootDomain(rootDomain);
    
    if (rootDomain) {
      // Root domain access - don't redirect, just show message
      console.log("Root domain accessed - tenant subdomain required");
      return;
    }
    
    // Tenant subdomain - check auth and redirect to login if needed
    if (!Cookies.get("auth_token")) {
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
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Joee Solutions</h1>
          <p className="text-gray-600 mb-6">
            Please access the application via a tenant subdomain.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code className="bg-gray-100 px-2 py-1 rounded">tenant.localhost:3000</code>
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
