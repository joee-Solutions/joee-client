import { processRequestNoAuth } from "@/framework/https";

/**
 * Checks if the frontend can connect to the backend API
 * Tests the connection through the Next.js API proxy
 * @returns Promise<boolean> - true if connection is successful, false otherwise
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    // Try to make a simple GET request through the API proxy to test the connection
    // We'll use a lightweight endpoint - even a 404 response means the server is reachable
    await processRequestNoAuth("get", "/tenant/department", undefined, undefined);
    // If we get here, connection is working
    return true;
  } catch (error: any) {
    // If we get a response (even 404/500), it means the server is reachable
    // Only network errors indicate connection failure
    if (error?.response) {
      // Server responded, so connection is working
      // Even 404 means the API proxy and backend are reachable
      return true;
    }
    
    // Check if it's a network error (connection failed)
    if (
      error?.code === "ERR_NETWORK" || 
      error?.message?.includes("Network Error") ||
      error?.code === "ECONNABORTED" ||
      error?.message?.includes("timeout")
    ) {
      // Network/timeout error means we can't reach the backend
      return false;
    }
    
    // For other errors, assume connection failed
    return false;
  }
};

