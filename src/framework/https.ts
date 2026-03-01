
import axios from "axios";
import { getRefreshToken, getToken } from "./get-token";
import Cookies from "js-cookie";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

let httpNoAuth: any;
let refreshingToking = false;
/** Single in-flight refresh promise so we never POST the same refresh token twice (avoids "Token reused" 401). */
let refreshPromise: Promise<{ token: string; refresh_token: string; user?: any } | null> | null = null;
let refreshSubscribers: Array<(token: string) => void> = [];
let controller = new AbortController();

// Queue for requests waiting for token refresh
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Helper function to decode JWT token and get expiration time
const getTokenExpiration = (token: string): number | null => {
  try {
    // JWT tokens have 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = JSON.parse(atob(paddedPayload));
    
    // Return expiration time in milliseconds (exp is in seconds)
    return decodedPayload.exp ? decodedPayload.exp * 1000 : null;
  } catch (error) {
    console.warn("Failed to decode token:", error);
    return null;
  }
};

// Helper function to check if token expires within specified minutes
const isTokenExpiringSoon = (token: string, minutes: number = 2): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    // If we can't decode, assume it might be expired
    return true;
  }
  
  const now = Date.now();
  const expirationTime = expiration;
  const bufferTime = minutes * 60 * 1000; // Convert minutes to milliseconds
  
  // Check if token expires within the buffer time
  return (expirationTime - now) <= bufferTime;
};

// Only use refresh when access token is expired or expiring soon
const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return Date.now() >= expiration;
};

const shouldTryRefresh = (token: string | null, bufferMinutes: number = 5): boolean => {
  if (!token || typeof token !== "string" || token.trim().length < 10) return true;
  return isTokenExpired(token) || isTokenExpiringSoon(token, bufferMinutes);
};

export const resetController = () => {
  controller.abort();
  controller = new AbortController(); // reassign
};

const getBaseURL = () => {
  if (typeof window === "undefined") return "";
  
  // Use Next.js API proxy route - route.ts will handle proxying to backend
  // This enables client info headers, better logging, and avoids CORS issues
  return "/api";
};

// Tenant from path (e.g. /doe/dashboard -> "doe") when using path-based tenant
const getTenantFromPath = (): string | undefined => {
  if (typeof window === "undefined" || !window.location?.pathname) return undefined;
  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments[0] || undefined;
};

// Tenant from host subdomain (e.g. doe.localhost:3000 -> "doe") so refresh and no-auth requests send correct x-tenant-id
const getTenantFromHost = (): string | undefined => {
  if (typeof window === "undefined" || !window.location?.hostname) return undefined;
  const hostname = window.location.hostname;
  if (hostname.includes("localhost")) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0] !== "localhost") return parts[0];
    return undefined;
  }
  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") return parts[0];
  return undefined;
};

// Prefer subdomain tenant (doe.localhost) so we don't send "dashboard" as tenant when path is /dashboard/...
const getTenantId = (): string | undefined => getTenantFromHost() || getTenantFromPath();

const baseURL = getBaseURL();
console.log("baseURL -->", baseURL);

if (typeof window !== "undefined") {
  httpNoAuth = axios.create({
    baseURL: baseURL,
    withCredentials: true, // send cookies with refresh/login so backend can read them
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  
  // Set up interceptors only when httpNoAuth is created
  httpNoAuth.interceptors.request.use(
    (config: any) => {
      const tenantId = getTenantId();
      config.headers = {
        ...config.headers,
        ...(tenantId ? { "x-tenant-id": tenantId } : {}),
      };
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
}

let httpAuth: any;
if (typeof window !== "undefined") {
  httpAuth = axios.create({
    baseURL: baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  
  // Set up request interceptor with proactive token refresh
  httpAuth.interceptors.request.use(
    async (config: any) => {
      const tenantId = getTenantId();
      if (tenantId) {
        config.headers = config.headers || {};
        config.headers["x-tenant-id"] = tenantId;
      }
      const token = getToken();
      let authorization;
      
      if (typeof token === "string" && token.trim().length > 10) {
        // Proactive refresh: Check if token expires within 5 minutes
        if (isTokenExpiringSoon(token, 5)) {
          console.log("Token expires soon, refreshing proactively...");
          
          // If already refreshing, wait for it
          if (refreshingToking) {
            await new Promise<void>((resolve) => {
              refreshSubscribers.push(() => resolve());
            });
            // Get the new token after refresh
            const newToken = getToken();
            if (newToken && typeof newToken === "string" && newToken.trim().length > 10) {
              authorization = `Bearer ${newToken}`;
            }
          } else {
            // Trigger proactive refresh
            try {
              const refreshed = await refreshUser();
              if (refreshed && refreshed.token) {
                const newToken = getToken();
                if (newToken && typeof newToken === "string" && newToken.trim().length > 10) {
                  authorization = `Bearer ${newToken}`;
                  // Notify any queued requests
                  onTokenRefreshed(newToken);
                } else {
                  // Fallback to original token if refresh didn't update it
                  authorization = `Bearer ${token}`;
                }
              } else {
                // Refresh failed, use original token (reactive refresh will handle if it's expired)
                authorization = `Bearer ${token}`;
              }
            } catch (error) {
              console.warn("Proactive token refresh failed, using current token:", error);
              // Use current token, reactive refresh will handle if expired
              authorization = `Bearer ${token}`;
            }
          }
        } else {
          // Token is still valid, use it
          authorization = `Bearer ${token}`;
        }
      } else {
        // No token, check for refresh token
        const refreshed = getRefreshToken();
        if (refreshed) {
          // Try to refresh if we have a refresh token but no access token
          if (!refreshingToking) {
            try {
              await refreshUser();
            } catch (error) {
              console.warn("Failed to refresh token:", error);
            }
          }
          const newToken = getToken();
          if (newToken && typeof newToken === "string" && newToken.trim().length > 10) {
            authorization = `Bearer ${newToken}`;
          } else {
            console.warn("No auth token found for authenticated request:", config.url);
          }
        } else {
          console.warn("No auth token found for authenticated request:", config.url);
          // Don't redirect - let the request fail gracefully so components can handle it
        }
      }
      
      config.headers = {
        ...config.headers,
        authorization,
      };
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Set up response interceptor to handle token expiration
  httpAuth.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      // Only handle token expiration for 401 errors or 403 with specific expired token messages
      // Don't treat "No token" 403 errors as expiration - those are expected when token is missing
      const errorMessage = error?.response?.data?.error?.toLowerCase() || 
                          error?.response?.data?.message?.toLowerCase() || 
                          error?.message?.toLowerCase() || "";
      
      const isNoTokenError = error?.response?.status === 403 && 
                            (errorMessage.includes("no token") || errorMessage.includes("token required"));
      
      // Only treat as token expiration if:
      // 1. 401 status (unauthorized)
      // 2. 403 with expired token message (not "no token")
      const isExpiredResponse = 
        error?.response?.status === 401 ||
        (error?.response?.status === 403 && 
         !isNoTokenError &&
         (errorMessage.includes("jwt expired") ||
          errorMessage.includes("token expired") ||
          errorMessage.includes("invalid token")));

      // Only retry with refresh when (1) we got an expired response AND (2) our token is actually expired/expiring.
      // If token is still valid, don't refresh (avoids unnecessary logout on e.g. "Token reused" 401).
      const currentToken = getToken() ?? null;
      const tokenNeedsRefresh = shouldTryRefresh(currentToken, 5);

      // If token expired and we haven't tried to refresh yet, and our token actually needs refresh
      if (isExpiredResponse && tokenNeedsRefresh && !originalRequest._retry) {
        // If already refreshing, queue this request
        if (refreshingToking) {
          return new Promise((resolve, reject) => {
            refreshSubscribers.push((token: string) => {
              if (token) {
                originalRequest.headers.authorization = `Bearer ${token}`;
                resolve(httpAuth(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            // No refresh token available - don't redirect, just let the request fail
            // Components should handle this gracefully
            console.warn("No refresh token available for token refresh");
            return Promise.reject(error);
          }

          const refreshed = await refreshUser();
          if (refreshed && refreshed.token) {
            // Update the authorization header with new token
            const newToken = getToken();
            if (newToken) {
              originalRequest.headers.authorization = `Bearer ${newToken}`;
              // Notify all queued requests
              onTokenRefreshed(newToken);
              // Retry the original request
              return httpAuth(originalRequest);
            }
          } else {
            // Refresh failed - only clear tokens if we got a definitive auth failure from refresh
            // (handled in catch above for 401/403). Here we just reject.
            console.warn("Token refresh failed - not clearing tokens (may retry)");
            // Don't redirect here - let the request fail and component handle it
          }
        } catch (refreshError: any) {
          // Only clear tokens on definitive auth failure (401/403 from refresh).
          // Do not clear on 500 or network errors so user can retry without being logged out.
          const refreshStatus = refreshError?.response?.status;
          if (refreshStatus === 401 || refreshStatus === 403) {
            console.warn("Token refresh rejected (auth failure), clearing tokens");
            Cookies.remove("refresh_token");
            Cookies.remove("auth_token");
            Cookies.remove("user");
          } else {
            console.warn("Token refresh failed (non-auth error), keeping tokens:", refreshError?.message || refreshError);
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}

const processRequestNoAuth = async (
  method: "post" | "get" | "put" | "delete",
  path: string,
  data?: any,
  callback?: (path: string, data: any, error?: any) => void,
  files?: any[] | File | Blob
) => {
  // Only run on client side
  if (typeof window === "undefined") {
    throw new Error("processRequestNoAuth can only be called on the client side");
  }

  if (!httpNoAuth) {
    throw new Error("httpNoAuth is not initialized");
  }

  console.debug("request -> processDataRequest", path);

  let rt;
  if (files) {
    data = convertToFormData(data, files);
    httpNoAuth.defaults.headers["Content-Type"] = "multipart/form-data";
    method = "post";
  }
  try {
    if (method === "post") {
      rt = await httpNoAuth.post(`${path}`, data);
    } else if (method === "get") {
      rt = await httpNoAuth.get(`${path}`, {
        signal: controller.signal,
      });
    } else if (method === "put") {
      rt = await httpNoAuth.put(`${path}`, data);
    } else if (method === "delete") {
      rt = await httpNoAuth.delete(`${path}`);
    } else {
      throw new Error(`Invalid method, method:${method} path:${path}`);
    }

    if (callback) {
      callback(path, rt.data);
    }

    return rt.data;
  } catch (error) {
    console.log(error);
    if (callback) {
      callback(path, null, error);
    } else {
      throw error;
    }
  }
};

const processRequestAuth = async (
  method: string,
  path: string,
  data?: any,
  callback?: (path: string, data: any, error?: any) => void,
  files?: any[] | File | Blob
) => {
  // Only run on client side
  if (typeof window === "undefined") {
    throw new Error("processRequestAuth can only be called on the client side");
  }

  if (!httpAuth) {
    throw new Error("httpAuth is not initialized");
  }

  console.debug("request -> processDataRequest", path);

  let rt;
  if (files) {
    data = convertToFormData(data, files);
    httpAuth.defaults.headers["Content-Type"] = "multipart/form-data";
    method = "post";
  }

  try {
    if (method === "post") {
      rt = await httpAuth.post(`${path}`, data);
    } else if (method === "get") {
      rt = await httpAuth.get(`${path}`, {
        signal: controller.signal,
      });
    } else if (method === "put") {
      rt = await httpAuth.put(`${path}`, data);
    } else if (method === "patch") {
      rt = await httpAuth.patch(`${path}`, data);
    } else if (method === "delete") {
      rt = await httpAuth.delete(`${path}`);
    } else {
      throw new Error(`Invalid method, method:${method} path:${path}`);
    }

    if (callback) {
      callback(path, rt.data);
    }
    console.log(rt.data, "rt.data");
    return rt.data;
  } catch (error: any) {
    // Token refresh is now handled by the response interceptor
    // Only log errors that weren't handled by the interceptor
    
    // Suppress console.error for 500 errors on schedules endpoint (may not be implemented yet)
    if (error?.response?.status === 500 && path?.includes('/schedule')) {
      // Silently handle 500 errors for schedules endpoint
    } else if (error?.response?.status === 403 && error?.response?.data?.error?.toLowerCase().includes('no token')) {
      // Suppress console.error for 403 "No token" errors - these are expected when token is missing
      // Components should handle this gracefully
      console.warn(`403 Forbidden (No token) for ${path} - request will fail gracefully`);
    } else if (error?.response?.status !== 401 && error?.response?.status !== 403) {
      // Only log non-auth errors (401/403 are handled by interceptor)
      console.error(error);
    }
    
    if (callback) {
      callback(path, null, error);
    } else {
      throw error;
    }
  }
};

const refreshUser = async (): Promise<{ token: string; refresh_token: string; user?: any } | null> => {
  // Only one refresh at a time. If one is in flight, wait for it instead of sending the same token again.
  // Backend uses refresh token rotation: reusing the same token returns 401 "Token reused. Session terminated for security."
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn("No refresh token available");
        return null;
      }

      refreshingToking = true;
      // Send both keys so backend can accept either refresh_token or refreshToken
      const tResponse: any = await processRequestNoAuth(
        "post",
        API_ENDPOINTS.REFRESH_TOKEN,
        { refresh_token: refreshToken, refreshToken }
      );

      // Handle different response structures - match login: { success, data: { tokens: { accessToken, refreshToken }, user } }
      const responseData = tResponse?.data ?? tResponse;
      const inner = responseData?.data ?? responseData;

      const tokens = inner?.tokens ||
                     responseData?.tokens ||
                     {};

      const newToken = tokens?.accessToken ??
                      tokens?.access_token ??
                      inner?.token ??
                      responseData?.token ??
                      responseData?.accessToken ??
                      responseData?.access_token;

      const newRefreshToken = tokens?.refreshToken ??
                            tokens?.refresh_token ??
                            inner?.refresh_token ??
                            responseData?.refresh_token ??
                            responseData?.refreshToken ??
                            refreshToken;

      const userData = inner?.user ??
                      responseData?.data?.user ??
                      responseData?.user ??
                      responseData?.data?.data?.user;

      if (newToken) {
        Cookies.set("auth_token", newToken, {
          expires: 7, // 7 days
          sameSite: 'lax',
          path: '/'
        });
        Cookies.set("refresh_token", newRefreshToken, {
          expires: 30, // 30 days for refresh token
          sameSite: 'lax',
          path: '/'
        });
        if (userData) {
          Cookies.set("user", JSON.stringify(userData), {
            expires: 7, // 7 days
            sameSite: 'lax',
            path: '/'
          });
        }
        console.log("Token refreshed successfully");
        return { token: newToken, refresh_token: newRefreshToken, user: userData };
      } else {
        console.warn("Token refresh response missing token. Response:", tResponse);
        Cookies.remove("refresh_token");
        Cookies.remove("auth_token");
        Cookies.remove("user");
        return null;
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const validationErrors = error?.response?.data?.validationErrors ?? error?.response?.data?.message;
      console.error("Token refresh failed:", status, validationErrors, error?.response?.data);

      // Clear tokens only on definitive auth failure (401/403). Not on 500 or network errors.
      if (status === 401 || status === 403) {
        Cookies.remove("refresh_token");
        Cookies.remove("auth_token");
        Cookies.remove("user");
      }

      return null;
    } finally {
      refreshingToking = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const convertToFormData = (data: any, files: any) => {
  const formData = new FormData();

  // Append each key in data separately instead of as a JSON string
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  if (Array.isArray(files)) {
    // If files is an array, append each file with the same key
    files.forEach((file) => {
      formData.append("file[]", file); // Use `file[]` for backend array support
    });
  } else if (files instanceof File) {
    formData.append("file", files); // Single file upload
  } else if (typeof files === "object") {
    // If files is an object, loop through keys
    Object.keys(files).forEach((key) => {
      let keyFiles = Array.isArray(files[key]) ? files[key] : [files[key]];
      keyFiles.forEach((file) => {
        formData.append(`${key}[]`, file); // `key[]` ensures proper backend parsing
      });
    });
  }

  return formData;
};

// export const convertToFormData = (data: any, files: string | any[] | Blob) => {
//   const formData = new FormData();
//   formData.append("data", JSON.stringify(data));

//   if (Array.isArray(files)) {
//     files.forEach((file, index) => {
//       formData.append(`file${index}`, file);
//     });
//   } else if (typeof files === "object") {
//     Object.keys(files).forEach((key) => {
//       // @ts-ignore
//       let keyFiles = Array.isArray(files[key]) ? files[key] : [files[key]];
//       keyFiles.forEach((file, index) => {
//         formData.append(`${key}${index}`, file);
//       });
//     });
//   } else if (files.constructor.name === "File") {
//     formData.append(`file`, files);
//   }

//   return formData;
// };

export {
  httpAuth,
  httpNoAuth,
  refreshUser,
  processRequestAuth,
  processRequestNoAuth,
};