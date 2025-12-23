import AuthProvider from "@/contexts/AuthProvider";
import React from "react";
import { ToastContainer } from "react-toastify";
import Image from "next/image";

// didn't export this layout
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full min-h-[100vh] grid place-items-center p-5 md:p-8 relative z-[100] [background:radial-gradient(#0085FF,#003465)]">
      <div className="auth-container w-full relative bg- px-5 md:px-8 py-8 flex flex-col place-items-center min-h-[100vh]">
        <div className=" hidden md:inline-block">
          <Image
            src={"/assets/auth/icon1.png"}
            alt="icon1"
            width={400}
            height={400}
            className="fixed bottom-[0px] left-[300px] opacity-5 bg-blend-luminosity -z-10 "
            style={{ opacity: '50%' }}
          ></Image>

          <Image
            src={"/assets/auth/icon2.png"}
            alt="icon2"
            width={200}
            height={200}
            className="fixed bottom-[0px] right-[0px] "
          ></Image>
          <Image
            src={"/assets/auth/icon3.png"}
            alt="icon3"
            width={140}
            height={140}
            className="fixed top-[122.87px] left-[329.03px]"
          ></Image>
          <Image
            src={"/assets/auth/icon4.png"}
            alt="icon4"
            width={140}
            height={140}
            className="fixed top-0 right-40"
          ></Image>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          <AuthProvider>{children}</AuthProvider>
        </div>
        <ToastContainer />
        <p className="mt-auto pt-4 pb-2 md:pb-4 text-center md:text-left w-full text-gray-400 text-xs md:text-sm z-50">
          Copyright © 2025 JOEE Solutions. All Rights Reserved
        </p>
      </div>
    </main>
  );
}
