"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { processRequestNoAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { Spinner } from "@/components/icons/Spinner";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type VerifyOtpLogin = z.infer<typeof schema>;
const schema = z.object({
  otp: z.string().length(6),
});
const VerifyOtpLoginClient = ({ token }: { token: string }) => {
  useEffect(() => {}, []);
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<VerifyOtpLogin>({
    resolver: zodResolver(schema),
  });
  const handleRest = async (data: VerifyOtpLogin) => {
    if (!data.otp) {
      toast.error("Otp is required");
      return;
    }
    try {
      // Get MFA token from cookie or prop
      const mfaToken = Cookies.get("mfa_token") || token;
      
      if (!mfaToken) {
        toast.error("Session expired. Please login again.", {
          toastId: "session-expired",
        });
        router.push("/login");
        return;
      }

      // Verify OTP with backend
      const rt = await processRequestNoAuth(
        "post",
        API_ENDPOINTS.VERIFY_LOGIN,
        {
          otp: data.otp,
          token: mfaToken,
        }
      );
      
      // Extract auth token from response
      const authToken = 
        rt.data?.data?.token ||
        rt.data?.token ||
        rt.token;
      
      const refreshToken = 
        rt.data?.data?.refresh_token ||
        rt.data?.refresh_token ||
        rt.refresh_token;
      
      const user = 
        rt.data?.data?.user ||
        rt.data?.user ||
        rt.user;

      if (authToken && (rt.status === true || rt?.data?.status === true || authToken)) {
        // Remove MFA token
        Cookies.remove("mfa_token");
        
        // Save authentication tokens
        Cookies.set("auth_token", authToken, {
          expires: 7, // 7 days
          sameSite: 'lax',
          path: '/'
        });
        
        // Save refresh token if provided
        if (refreshToken) {
          Cookies.set("refresh_token", refreshToken, { 
            expires: 30, // 30 days
            sameSite: 'lax',
            path: '/'
          });
        }
        
        // Save user data
        if (user) {
          const userData = typeof user === 'object' ? user : { email: user };
          Cookies.set("user", JSON.stringify(userData), {
            expires: 7, // 7 days
            sameSite: 'lax',
            path: '/'
          });
        }
        
        // Set OTP verified cookie - this ensures user won't be asked for OTP again
        Cookies.set("otp_verified", "true", {
          expires: 365, // 1 year
          sameSite: 'lax',
          path: '/'
        });
        
        toast.success("Login successful!", {
          toastId: "success",
          delay: 1000,
        });
        
        router.push(`/dashboard`);
      } else {
        toast.error("Invalid OTP. Please try again.", {
          toastId: "invalid-otp",
          delay: 2000,
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.error === "Invalid Session"
      ) {
        Cookies.remove("mfa_token");
        router.push("/login");
      }
      
      const errorMessage = 
        error?.response?.data?.error || 
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed. Please try again.";
      
      toast.error(errorMessage, {
        toastId: "error",
        delay: 2000,
      });
    }
  };
  const timer = 60 * 5;

  const handleResendOtp = async () => {
    try {
      // Use the mfa_token from cookie for resending OTP
      const mfaToken = Cookies.get("mfa_token") || token;
      const rt = await processRequestNoAuth("post", API_ENDPOINTS.RESEND_OTP, {
        token: mfaToken,
      });
      if (rt.status === true || rt?.data?.status === true) {
        toast.success(rt.message || rt?.data?.message || "OTP resent successfully", {
          toastId: "success",
          delay: 2000,
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to resend OTP", {
        toastId: "error",
        delay: 2000,
      });
    }
  };
  return (
    <div className="font-poppins container grid place-items-center  bg-[#5882C17D] shadow-lg rounded-2xl border border-blue-500 text-white w-full max-w-[350px] md:max-w-[450px] md:px-8 px-8 py-20 ">
      <div className="form flex flex-col items-center justify-center space-y-8">
        <div className="orgDeatails text-center flex flex-col items-center justify-center gap-2">
          <Image
            src="/assets/auth/reset-otp.png"
            width={50}
            height={20}
            alt="logo"
            className="logo mb-2"
          />
          <h2 className="login font-bold text-2xl md:text-3xl">
            Enter Your Code
          </h2>
          <span className="text-base">We sent a code to your email</span>
        </div>

        <form
          action=""
          id="signup-otp-form"
          className="[--size:large] flex flex-col gap-7 mb-3"
          onSubmit={handleSubmit(handleRest)}
        >
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            onChange={(e) => setValue("otp", e)}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((index, _) => (
                <InputOTPSlot index={_} key={_} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {errors.otp && (
            <span className="text-xs text-red-700">{errors.otp.message}</span>
          )}
          <Button
            className="font-medium text-md my-3 bg-[#003465]"
            type="submit"
          >
            {isSubmitting ? <Spinner /> : "Verify"}
          </Button>
        </form>
      </div>

      <div className="extra-details flex justify-center gap-2 text-xs md:text-sm mb-7">
        Didn&apos;t receive the email?
        <button
          onClick={handleResendOtp}
          className="text-brand-400 hover:underline"
        >
          Click to resend?
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpLoginClient;
