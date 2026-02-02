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
    console.log(data);
    try {
      // TODO: Remove this bypass when backend is ready
      // Bypass OTP verification for development - accept any OTP
      const mockAuthToken = `dev_auth_token_${Date.now()}`;
      const mockRefreshToken = `dev_refresh_token_${Date.now()}`;
      const mockUser = {
        id: 1,
        email: "dev@example.com",
        name: "Development User",
      };

      Cookies.remove("mfa_token");
      Cookies.set("auth_token", mockAuthToken, {
        expires: 7, // 7 days
        sameSite: 'lax',
        path: '/'
      });
      Cookies.set("refresh_token", mockRefreshToken, { 
        expires: 30, // 30 days for refresh token
        sameSite: 'lax',
        path: '/'
      });
      Cookies.set("user", JSON.stringify(mockUser), {
        expires: 7, // 7 days
        sameSite: 'lax',
        path: '/'
      });
      // Set OTP verified cookie (0 days = always remember, so use long expiration)
      Cookies.set("otp_verified", "true", {
        expires: 365, // 1 year (effectively "always" for 0 days requirement)
      });
      toast.success("Login successful!", {
        toastId: "success",
        delay: 1000,
      });
      router.push(`/dashboard`);

      // Original code (commented out for now):
      // const rt = await processRequestNoAuth(
      //   "post",
      //   API_ENDPOINTS.VERIFY_LOGIN,
      //   {
      //     otp: data.otp,
      //     token,
      //   }
      // );
      // console.log(rt, "token");
      // if (rt.status === true && rt?.data?.token) {
      //   Cookies.remove("mfa_token");
      //   Cookies.set("auth_token", rt.data.token, {
      //     expires: 1 / 48,
      //   });
      //   // Save refresh token if provided in response
      //   if (rt.data.refresh_token) {
      //     Cookies.set("refresh_token", rt.data.refresh_token, { expires: 1 / 48 });
      //   }
      //   Cookies.set("user", JSON.stringify(rt.data.user), {
      //     expires: 1 / 48,
      //   });
      //   // Set OTP verified cookie (0 days = always remember)
      //   Cookies.set("otp_verified", "true", {
      //     expires: 365, // 1 year (effectively "always" for 0 days requirement)
      //   });
      //   router.push(`/dashboard`);
      // }
    } catch (error: any) {
      console.log(error, "ekekek");
      if (
        error.status === 401 &&
        error.response.data.error === "Invalid Session"
      ) {
        router.push("/login");
      }
      toast.error(error?.response?.data?.error, {
        toastId: "error",
        delay: 2000,
      });
    }
  };
  const timer = 60 * 5;

  const handleResendOtp = async () => {
    try {
      const rt = await processRequestNoAuth("post", API_ENDPOINTS.RESEND_OTP, {
        token,
      });
      if (rt.status === true) {
        toast.success(rt.message, {
          toastId: "success",
          delay: 2000,
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error, {
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
