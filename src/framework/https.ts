
import axios from "axios";
import { getRefreshToken, getToken } from "./get-token";
import Cookies from "js-cookie";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

let httpNoAuth: any;
let refreshingToking = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let controller = new AbortController();

// Queue for requests waiting for token refresh
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
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

const baseURL = getBaseURL();
console.log("baseURL -->", baseURL);

if (typeof window !== "undefined") {
  httpNoAuth = axios.create({
    baseURL: baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  
  // Set up interceptors only when httpNoAuth is created
  httpNoAuth.interceptors.request.use(
    (config: any) => {
      config.headers = {
        ...config.headers,
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
  
  // Set up request interceptor
  httpAuth.interceptors.request.use(
    (config: any) => {
      const token = getToken();
      let authorization;
      if (typeof token === "string" && token.trim().length > 10) {
        authorization = `Bearer ${token}`;
      } else {
        const refreshed = getRefreshToken();
        if (refreshed) {
          const token = getToken();
          if (typeof token === "string" && token.trim().length > 10) {
            authorization = `Bearer ${token}`;
          }
        } else {
          console.warn("No auth token found for authenticated request:", config.url);
          // Don't redirect - let the request fail gracefully so components can handle it
          // window.location.href = "/";
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
      const isTokenExpired = 
        error?.response?.status === 401 ||
        (error?.response?.status === 403 && 
         !isNoTokenError &&
         (errorMessage.includes("jwt expired") ||
          errorMessage.includes("token expired") ||
          errorMessage.includes("invalid token")));

      // If token expired and we haven't tried to refresh yet
      if (isTokenExpired && !originalRequest._retry) {
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
            // Refresh failed - clear tokens but don't redirect immediately
            // Let the component handle the error gracefully
            console.warn("Token refresh failed - tokens cleared");
            Cookies.remove("refresh_token");
            Cookies.remove("auth_token");
            Cookies.remove("user");
            // Don't redirect here - let the request fail and component handle it
          }
        } catch (refreshError) {
          // Refresh failed - clear tokens but don't redirect immediately
          console.error("Token refresh error:", refreshError);
          Cookies.remove("refresh_token");
          Cookies.remove("auth_token");
          Cookies.remove("user");
          // Don't redirect here - let the request fail and component handle it
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

const refreshUser = async () => {
  console.log("token expired, refreshing token");
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    refreshingToking = true;
    const tResponse: any = await processRequestNoAuth(
      "post",
      API_ENDPOINTS.REFRESH_TOKEN,
      { refresh_token: refreshToken }
    );
    
    // Handle different response structures
    const responseData = tResponse?.data || tResponse;
    const newToken = responseData?.token || 
                    responseData?.accessToken || 
                    responseData?.access_token;
    const newRefreshToken = responseData?.refresh_token || 
                          responseData?.refreshToken || 
                          refreshToken; // Keep old refresh token if new one not provided
    const userData = responseData?.user || responseData?.data?.user;

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
      console.warn("Token refresh response missing token");
      Cookies.remove("refresh_token");
      Cookies.remove("auth_token");
      Cookies.remove("user");
      return null;
    }
  } catch (error: any) {
    console.error("Token refresh failed:", error);
    // Clear tokens on refresh failure
    Cookies.remove("refresh_token");
    Cookies.remove("auth_token");
    Cookies.remove("user");
    return null;
  } finally {
    refreshingToking = false;
  }
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