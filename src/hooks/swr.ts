import { processRequestOfflineAuth } from "@/framework/offline-https";

/**
 * Authenticated fetcher function for SWR (offline-aware: returns cache when offline)
 */
export const authFectcher = async (url: string) => {
  if (!url) {
    throw new Error("URL is required");
  }

  try {
    const data = await processRequestOfflineAuth("get", url);
    return data;
  } catch (error: any) {
    // Handle 403 errors gracefully - return null instead of throwing
    // This allows the form to continue working even if some API calls fail
    if (error?.response?.status === 403) {
      console.warn(`403 Forbidden for ${url}: ${error?.response?.data?.error || 'No token'}`);
      // Return null so SWR treats it as "no data" rather than an error
      return null;
    }
    
    // Handle 401 errors - might be token expired, but don't break the page
    if (error?.response?.status === 401) {
      console.warn(`401 Unauthorized for ${url}: Token may be expired`);
      return null;
    }
    
    // For other errors, re-throw so SWR can handle them
    throw error;
  }
};

