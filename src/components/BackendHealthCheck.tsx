"use client";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { checkBackendConnection } from "@/utils/health-check";

/**
 * Checks backend only when online. When offline, skips the check so the Next.js
 * API proxy never calls DigitalOcean (avoids ENOTFOUND / getaddrinfo in server logs).
 */
export default function BackendHealthCheck() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const checkConnection = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      try {
        const isConnected = await checkBackendConnection();
        if (isConnected) {
          toast.success("Successfully connected to backend API", {
            toastId: "backend-connection-success",
            autoClose: 3000,
          });
        } else {
          toast.error("Unable to connect to backend API", {
            toastId: "backend-connection-error",
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.error("Error checking backend connection:", error);
        if (typeof navigator !== "undefined" && !navigator.onLine) return;
        toast.error("Error checking backend connection", {
          toastId: "backend-connection-check-error",
          autoClose: 5000,
        });
      }
    };

    const schedule = () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      timeoutId = setTimeout(checkConnection, 1000);
    };

    schedule();

    const onOnline = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkConnection, 500);
    };
    window.addEventListener("online", onOnline);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
