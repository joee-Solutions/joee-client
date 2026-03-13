"use client";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect } from "react";
import VerifyOtpLoginClient, { getLoginPath } from "./VerifyLoginOtp";
import { getMfaToken } from "@/framework/get-token";

const VerifyOTP = () => {
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string | undefined;
  const token = getMfaToken();
  useEffect(() => {
    if (!token) {
      router.push(getLoginPath(tenant));
    }
  }, [token, tenant, router]);

  return <VerifyOtpLoginClient token={token!} tenant={tenant} />;
};

export default VerifyOTP;
