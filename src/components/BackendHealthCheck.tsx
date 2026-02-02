"use client";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { checkBackendConnection } from "@/utils/health-check";

/**
 * Component that checks backend connection on mount and displays a message
 */
export default function BackendHealthCheck() {
  useEffect(() => {
    const checkConnection = async () => {
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
        toast.error("Error checking backend connection", {
          toastId: "backend-connection-check-error",
          autoClose: 5000,
        });
      }
    };

    // Check connection after a short delay to ensure app is fully loaded
    const timeoutId = setTimeout(() => {
      checkConnection();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null; // This component doesn't render anything
}

