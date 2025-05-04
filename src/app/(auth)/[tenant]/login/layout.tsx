
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import React from "react";

export const metadata: Metadata = {
  title: "Tenant Login | Joee Solutions ",
  description: "Welcome to Joee Solutions",
};

function TenantLoginLayout({ children }: { children: React.ReactNode }) {
  return (
     <main
      className=""
    >
      <div className="auth-container w-full place-items-center">
      <NextTopLoader color="#000" showSpinner={false} />
      {children}
    </div>
    </main>
  );
}

export default TenantLoginLayout;
