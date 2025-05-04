"use client";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const handleLogout = async () => {
    console.log("logout");
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
    router.push("/login");
  };
  useEffect(() => {
    if (!Cookies.get("auth_token")) {
      router.push("/login");
    }
  }, []);
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HomePage;
