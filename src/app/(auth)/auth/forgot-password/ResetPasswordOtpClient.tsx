"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

type ResetPasswordOtpProps = z.infer<typeof schema>;
const schema = z.object({
  otp: z.string().length(6),
});
const ResetPasswordOtpClient = ({ token }: { token: string }) => {
  useEffect(() => {}, []);
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ResetPasswordOtpProps>({
    resolver: zodResolver(schema),
  });
  const handleRest = async (data: ResetPasswordOtpProps) => {
    if (!data.otp) {
      toast.error("Otp is required");
      return;
    }
    try {
      const res = await processRequestNoAuth("post", API_ENDPOINTS.VERIFY_OTP, {
        otp: data.otp,
        token,
      });
      if (res.status === "success" && res.token) {
        router.push(`/auth/reset-password?token=${res.token}`);
      }
      console.log("res-->", res);
    } catch (error:any) {
      console.log(error, "ekekek");
      toast.error(error?.response?.data.error);
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
        <Link
          href={"/auth/forgot-password"}
          className="text-brand-400 hover:underline"
        >
          Click to resend?
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordOtpClient;
