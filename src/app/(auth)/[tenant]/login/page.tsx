"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeOffIcon, EyeClosedIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { processRequestNoAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { Spinner } from "@/components/icons/Spinner";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { saveLastSession, getLastSession, restoreLastSessionToCookies } from "@/lib/auth-store";

type LoginProps = z.infer<typeof schema>;

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    // Original validation (commented out for development):
    // .min(8, { message: "Password must be at least 8 characters long" })
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;'?/>.<,])(?=.*[a-zA-Z]).{8,}$/,
    //   {
    //     message:
    //       "Password must contain at least one lowercase, uppercase, number and one special character",
    //   }
    // ),
});

const TenantLoginPage = () => {
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errMessage, setErrMessage] = useState<string>("");
  const [offlineSession, setOfflineSession] = useState<{ name: string } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    setError,
  } = useForm<LoginProps>({
    resolver: zodResolver(schema),
    // reValidateMode: "onChange",
  });

  // Check for saved session when offline (for "Continue as [user]")
  useEffect(() => {
    const check = async () => {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setIsOffline(offline);
      if (offline) {
        const session = await getLastSession();
        if (session?.user) {
          const name =
            session.user?.name ||
            session.user?.email ||
            session.user?.first_name ||
            [session.user?.first_name, session.user?.last_name].filter(Boolean).join(" ") ||
            "Saved account";
          setOfflineSession({ name: String(name) });
        } else {
          setOfflineSession(null);
        }
      } else {
        setOfflineSession(null);
      }
    };
    check();
  }, []);

  const handleContinueOffline = async () => {
    const restored = await restoreLastSessionToCookies();
    if (restored) {
      toast.success("Restored your session. You're viewing cached data.", { toastId: "offline-restore" });
      router.push(tenant ? `/${tenant}/dashboard` : "/dashboard");
    } else {
      toast.error("No saved session found. Connect to the internet to sign in.", { toastId: "offline-no-session" });
    }
  };

  // Check if user has already verified OTP (skip OTP for returning users)
  useEffect(() => {
    const otpVerified = Cookies.get("otp_verified");
    if (otpVerified === "true") {
      // User has already verified OTP, they can skip OTP verification
      // This will be handled in the login response
    }
  }, []);
  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handleFormSubmit = async (data: LoginProps) => {
    if (isOffline) {
      toast.error("You're offline. Connect to the internet to sign in, or use \"Continue with saved account\".", {
        toastId: "login-offline",
      });
      return;
    }
    try {
      setErrMessage("");
      
      // Include tenant/domain so backend can resolve organization (avoids "Organization not found")
      const payload = {
        email: data.email,
        password: data.password,
        ...(tenant ? { domain: tenant, tenant } : {}),
      };

      // Make API call to login endpoint
      // x-tenant-id header is set by https interceptor from path; domain in body for backend lookup
      const response = await processRequestNoAuth(
        "post",
        API_ENDPOINTS.LOGIN,
        payload
      );

      // Check if response is successful
      if (response) {
        const data = response.data?.data ?? response.data;
        const hasMfaRequired = data?.mfa_required === true;
        const mfaTokenFromData = data?.token; // When mfa_required: true, data.token is the OTP verification token
        const accessToken = 
          data?.tokens?.accessToken ||
          response.data?.tokens?.accessToken;
        const hasFullLogin = Boolean(accessToken);

        // OTP only when first-time login: backend sends data.token (not data.tokens.accessToken) + mfa_required: true
        // Show OTP page so user can verify; after verify, backend returns data.tokens.accessToken and we go to dashboard
        if (hasMfaRequired && mfaTokenFromData) {
          Cookies.set("mfa_token", mfaTokenFromData, {
            expires: 1 / 24, // 1 hour
            sameSite: "lax",
            path: "/",
          });

          toast.info("Please verify your email with the OTP code sent to you.", {
            toastId: "otp-required",
            autoClose: 3000,
          });

          router.push(
            typeof window !== "undefined" &&
              window.location.hostname.split(".").length > 1 &&
              window.location.hostname.split(".")[0] !== "www"
              ? "/verify-login-otp"
              : tenant
                ? `/${tenant}/verify-login-otp`
                : "/verify-login-otp"
          );
          return;
        }

        // Full login: backend returns { data: { tokens: { accessToken, refreshToken }, user, ... } }
        // Proceed to dashboard
        if (hasFullLogin) {
          const refreshToken =
            data?.tokens?.refreshToken ||
            response.data?.tokens?.refreshToken;
          const user =
            data?.user ||
            response.data?.data?.user ||
            response.data?.user ||
            response.user;
          Cookies.set("auth_token", accessToken, {
            expires: 7,
            sameSite: "lax",
            path: "/",
          });

          if (refreshToken) {
            Cookies.set("refresh_token", refreshToken, {
              expires: 30,
              sameSite: "lax",
              path: "/",
            });
          }

          if (user) {
            const roles = data?.roles ?? response.data?.roles ?? [];
            const userData = {
              ...(typeof user === "object" ? user : { email: user }),
              roles: Array.isArray(roles) ? roles : [roles],
            };
            Cookies.set("user", JSON.stringify(userData), {
              expires: 7,
              sameSite: "lax",
              path: "/",
            });
            if (userData.id != null) {
              Cookies.set("auth_user_id", String(userData.id), {
                expires: 7,
                sameSite: "lax",
                path: "/",
              });
            }
          }

          Cookies.set("otp_verified", "true", {
            expires: 365,
            sameSite: "lax",
            path: "/",
          });

          saveLastSession(tenant).catch(() => {});

          toast.success("Login successful!", {
            toastId: "login-success",
            autoClose: 3000,
          });

          router.push(
            typeof window !== "undefined" &&
              window.location.hostname.split(".").length > 1 &&
              window.location.hostname.split(".")[0] !== "www"
              ? "/dashboard"
              : tenant
                ? `/${tenant}/dashboard`
                : "/dashboard"
          );
          return;
        }

        // Unexpected: neither MFA token nor accessToken
        console.error("Login response:", response);
        toast.error("Unexpected response from server. No authentication token received.", {
          toastId: "login-error",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Extract error message
      const errorMessage = 
        error?.response?.data?.error || 
        error?.response?.data?.message || 
        error?.message || 
        "Login failed. Please check your credentials and try again.";
      
      toast.error(errorMessage, {
        toastId: "login-error",
        autoClose: 5000,
      });
      
      if (error?.response?.status === 401) {
        setErrMessage(errorMessage);
      }
    }
  };

  useEffect(() => {
    if (errMessage.toLowerCase().includes("user") || errMessage.toLowerCase().includes("email")) {
      setError("email", {
        type: "manual",
        message: errMessage,
      });
    } else if (errMessage.toLowerCase().includes("password")) {
      setError("password", {
        type: "manual",
        message: errMessage,
      });
    }
  }, [errMessage, setError]);
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-8 lg:px-24 py-10 items-center justify-center font-poppins place-items-center">
      <div className="content col-span-1 text-white hidden md:flex flex-col justify-center space-y-8 w-full max-w-3xl">
        <h1 className="header font-bold text-4xl md:text-6xl lg:text-6xl leading-tight">Welcome!</h1>
        <div className="line border-2 border-white w-40"></div>
        <div className="line border-3 border-white"></div>
        <span className="welcom md:w-3/4 text-lg leading-8">
          Welcome to LociCare by Joee Solutions. Sign in to access your tenant
          dashboard and manage your healthcare operations efficiently...
        </span>
      </div>
      <div className="col-span-1 shadow-lg rounded-2xl  border border-blue-500 text-white z-40 w-full max-w-[350px] md:max-w-[550px] md:px-8 px-8 py-20 [linear-gradient:rgb()] bg-[#5882C147]">
        <div className="form flex flex-col px-12 md:px-20  items-center justify-center space-y-4  ">
          <div className="orgDeatails flex flex-col items-center justify-center gap-4">
          <Image
              alt="logo"
              src="/assets/auth/otp.png"
              width={80}
              height={60}
              className="logo"
            />
            <span className="flex items-center gap-4 whitespace-nowrap">
              <span className="font-medium text-2xl md:text-3xl">
                LociCare
              </span>
              <span className="text-base md:text-lg whitespace-nowrap">by JOEE Solutions</span>
            </span>
          </div>
          <form
            action=""
            className="grid w-full text-white"
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <div className="grid gap-[6px] mb-7">
              <label htmlFor="login-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="login-email"
                placeholder="username@gmail.com"
                type="email"
                {...register("email")}
                className="text-gray-700"
                error={errors.email?.message}
              />
            </div>
            <div className="grid gap-[6px] mb-3">
              <label htmlFor="login-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                icon={
                  showPassword ? (
                    <EyeOffIcon
                      className="size-5"
                      onClick={handleShowPassword}
                    />
                  ) : (
                    <EyeClosedIcon
                      className="size-5"
                      onClick={handleShowPassword}
                    />
                  )
                }
                placeholder="Enter Password"
                error={errors.password?.message}
                className="text-gray-700"
              />
            </div>
            <div className="extra-details flex justify-between text-xs md:text-sm mb-7">
              <Link
                href={"/forgot-password"}
                className="text-[#FAD900] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            {isOffline && (
              <div className="mb-4 space-y-2">
                <p className="text-sm text-amber-200">You&apos;re offline. Connect to the internet to sign in, or continue with your saved session.</p>
                {offlineSession ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/20"
                    onClick={handleContinueOffline}
                  >
                    Continue as {offlineSession.name}
                  </Button>
                ) : (
                  <p className="text-xs text-gray-300">No saved session. Sign in when you&apos;re back online.</p>
                )}
              </div>
            )}
            <Button
              className="font-medium mb-3 bg-[#003465]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantLoginPage;
