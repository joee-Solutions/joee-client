"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import VerifyOtpLoginClient from "./VerifyLoginOtp";
import { getMfaToken } from "@/framework/get-token";

const VerifyOTP = () => {
  const router = useRouter();
  const token = getMfaToken();
  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, []);

  return <VerifyOtpLoginClient token={token!} />;
};

export default VerifyOTP;
