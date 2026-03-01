import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import BackendHealthCheck from "@/components/BackendHealthCheck";
import OfflineSync from "@/components/OfflineSync";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";


export const metadata: Metadata = {
  title: "Joee Solutions",
  description: "Your health is our priority",
  icons: {
    icon: "/assets/logo/logo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-poppins" suppressHydrationWarning>
        <BackendHealthCheck />
        <OfflineSync />
        <ServiceWorkerRegistration />
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
