import { processRequestAuth, processRequestNoAuth } from "@/framework/https";
import { getResponseErrorMessage } from "@/utils/data.utils";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { createStore } from "zustand/vanilla";
import { devtools, persist } from "zustand/middleware";
import Cookies from "js-cookie";

export type TenantState = {
  user: null | any;
  isLoading?: boolean;
  error?: string;
};

export type TenantActions = {
  request: (
    method: "get" | "post" | "put" | "delete",
    path: string,
    data?: any,
    auth?: boolean
  ) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  logOut: () => void;

  setStateItem: (item: { [key: string]: any }) => void;
};

export type TenantStore = TenantState & TenantActions;

export const defaultInitState: TenantState = {
  user: null,
  isLoading: false,
  error: undefined,
} as any;

export const createTenantStore = (
  initState: TenantState = defaultInitState
) => {
  return createStore<TenantStore>()(
    devtools(
      persist(
        (set, get) => ({
          ...initState,
          setStateItem: (item) => {
            set((state: any) => {
              const newState = { ...state };
              Object.entries(item).forEach(([key, value]) => {
                if (
                  typeof value === "object" &&
                  !Array.isArray(value) &&
                  value !== null
                ) {
                  newState[key] = { ...state[key], ...value };
                } else {
                  newState[key] = value;
                }
              });
              return newState;
            });
          },

          //
          signIn: async (staffId, password) => {
            const res = await get().request("post", API_ENDPOINTS.LOGIN, {
              staffId,
              password,
            });
            if (res?.token) {
              Cookies.set("auth_token", res?.token, {
                expires: new Date(Date.now() + 3600 * 1000),
                secure: true,
                sameSite: "strict",
              });
              set({
                user: res.staff,
                timeStamp: new Date(Date.now()),
              });
            }
            return res;
          },
          logOut: () => {
            Cookies.remove("auth_token");
            set({ user: null });
          },
          request: async (method, path, data, auth = true) => {
            set({ isLoading: true, error: undefined });
            try {
              const process = auth ? processRequestAuth : processRequestNoAuth;
              const response = await process(method, path, data);
              return response;
            } catch (e) {
              // useSiteStore
              //   .getState()
              //   .showNotice(getResponseErrorMessage(e), 'error')
              set({ error: getResponseErrorMessage(e) });
              return { error: e };
            } finally {
              set({ isLoading: false });
            }
          },
        }),
        { name: "tenant-store" }
      )
    )
  );
};

export type StoreKey = keyof Pick<TenantState, "user">;
