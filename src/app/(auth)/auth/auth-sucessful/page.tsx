"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const ResetPasswordOtp = () => {
  const [OTP, setOTP] = useState("");

  return (
    <div className="font-poppins container grid place-items-center  bg-[#5882C17D] shadow-lg rounded-2xl border border-blue-500 text-white w-full max-w-[350px] md:max-w-[550px] md:px-8 px-8 py-24 ">
      <div className="form flex flex-col w-fit  items-center justify-center space-y-8">
        <div className="orgDeatails text-center flex flex-col items-center justify-center space-y-4">
          <Image
            src="/assets/auth/success.png"
            width={50}
            height={20}
            alt="logo"
            className="logo mb-2 bg-white rounded-full"
          />
          <h2 className="login font-bold text-2xl md:text-3xl">
            Success
          </h2>
          <span className="text-lg md:w-3/4">Your account Verification was successful</span>
        </div>


          <Button
            className="font-medium w-full text-md mt-3 bg-[#003465]"
            //   onClick={}
          >
            Proceed
          </Button>

      </div>

    </div>
  );
};

export default ResetPasswordOtp;
