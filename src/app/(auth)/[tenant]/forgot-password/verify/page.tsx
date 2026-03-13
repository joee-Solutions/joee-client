"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ResetPasswordOtpClient from "../ResetPasswordOtpClient";

function ForgotPasswordVerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  if (!email) {
    return (
      <div className="font-poppins container grid place-items-center bg-[#5882C17D] shadow-lg rounded-2xl border border-blue-500 text-white w-full max-w-[350px] md:max-w-[450px] px-8 py-20">
        <p className="text-center">Missing email. Please start from the forgot password page.</p>
      </div>
    );
  }

  return <ResetPasswordOtpClient email={email} />;
}

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="font-poppins container grid place-items-center bg-[#5882C17D] shadow-lg rounded-2xl border border-blue-500 text-white w-full max-w-[350px] md:max-w-[450px] px-8 py-20">
          <p>Loading...</p>
        </div>
      }
    >
      <ForgotPasswordVerifyContent />
    </Suspense>
  );
}
