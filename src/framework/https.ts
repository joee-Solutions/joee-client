
import axios from "axios";
import { getRefreshToken, getToken } from "./get-token";
import Cookies from "js-cookie";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

let httpNoAuth: any;
let refreshingToking = false;
let controller = new AbortController();

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
}
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

let httpAuth: any;
if (typeof window !== "undefined") {
  httpAuth = axios.create({
    baseURL: baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}
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

const processRequestNoAuth = async (
  method: "post" | "get" | "put" | "delete",
  path: string,
  data?: any,
  callback?: (path: string, data: any, error?: any) => void,
  files?: any[] | File | Blob
) => {
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
    if (!refreshingToking && error?.response?.status === 401) {
      const refreshed = await refreshUser();
      if (refreshed) {
        return await processRequestAuth(method, path, data, callback);
      }
    } else if (
      !refreshingToking &&
      error.response?.data?.error?.toLowerCase().includes("not authorized")
    ) {
      const refreshed = await refreshUser();
      if (refreshed) {
        return await processRequestAuth(method, path, data, callback);
      }
    }

    console.error(error);
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
    if (getRefreshToken()) {
      refreshingToking = true;
      const tResponse: any = await processRequestNoAuth(
        "post",
        API_ENDPOINTS.REFRESH_TOKEN,
        { refresh_token: getRefreshToken() }
      );
      if (tResponse) {
        Cookies.set("auth_token", tResponse.token, { expires: 1 / 48 });
        Cookies.set("refresh_token", tResponse.refresh_token || getRefreshToken(), { expires: 1 / 48 });
        Cookies.set("user", JSON.stringify(tResponse.user), {
          expires: 1 / 48,
        });
        return tResponse;
      } else {
        Cookies.remove("refresh_token");
        Cookies.remove("auth_token");
        Cookies.remove("user");
      }
    }
  } finally {
    refreshingToking = false;
  }
  return null;
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