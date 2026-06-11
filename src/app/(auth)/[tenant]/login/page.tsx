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
import { shouldSuppressUserFacingApiError } from "@/framework/api-errors";
import { processRequestNoAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { Spinner } from "@/components/icons/Spinner";
import Cookies from "js-cookie";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { saveLastSession } from "@/lib/auth-store";
import { getTenantSubdomainFromHost } from "@/lib/tenant-host";
import { offlineAuthService } from "@/lib/offline/offlineAuth";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

/** Public support / contact form URL (override in env). */
const SUPPORT_FORM_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPPORT_FORM_URL?.trim()) ||
  "mailto:support@joee.solutions";

function dashboardHrefForTenant(tenantSlug?: string): string {
  const hostTenant =
    typeof window !== "undefined"
      ? getTenantSubdomainFromHost(window.location.host)
      : null;
  if (hostTenant) return "/dashboard";
  return tenantSlug ? `/${tenantSlug}/dashboard` : "/dashboard";
}

function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

const TenantLoginPage = () => {
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errMessage, setErrMessage] = useState<string>("");
  const [, setUser] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    setError,
    watch,
  } = useForm<LoginProps>({
    resolver: zodResolver(schema),
    // reValidateMode: "onChange",
  });

  // Check if device is offline
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

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

  const handleFormSubmit = async (formData: LoginProps) => {
    // Check if offline - try offline login first
    if (isOffline || !navigator.onLine) {
      try {
        // Attempt offline login using cached credentials
        const offlineResult = await offlineAuthService.verifyCredentialsOffline(
          formData.email,
          formData.password
        );

        if (offlineResult.success && offlineResult.token && offlineResult.userData) {
          // Offline login successful
          Cookies.set("auth_token", offlineResult.token, { expires: 1 });
          Cookies.set("user", JSON.stringify(offlineResult.userData), { expires: 1 });
          setUser(offlineResult.userData);

          toast.success("Offline login successful", { toastId: "offline-login-success" });
          router.push("/dashboard");
          return;
        } else {
          // No cached credentials or invalid
          const errorMessage =
            offlineResult.error ||
            "No offline credentials found. Please login while online first to enable offline login.";
          toast.error(errorMessage, {
            toastId: "offline-login-error",
            autoClose: 5000,
          });
          return;
        }
      } catch (error: any) {
        toast.error(
          "Offline login failed. Please check your credentials or login while online.",
          {
            toastId: "offline-login-error",
          }
        );
        return;
      }
    }

    try {
      setErrMessage("");
      
      // Include tenant/domain so backend can resolve organization (avoids "Organization not found")
      const payload = {
        email: normalizeEmail(formData.email),
        password: formData.password,
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
        const loginData = response.data?.data ?? response.data;
        const hasMfaRequired = loginData?.mfa_required === true;
        const mfaTokenFromData = loginData?.token; // When mfa_required: true, data.token is the OTP verification token
        const accessToken = 
          loginData?.tokens?.accessToken ||
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
            loginData?.tokens?.refreshToken ||
            response.data?.tokens?.refreshToken;
          const user =
            loginData?.user ||
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
            const roles = loginData?.roles ?? response.data?.roles ?? [];
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
            // Cache encrypted credentials for true offline email/password login.
            try {
              const normalizedEmail = normalizeEmail(formData.email);
              if (normalizedEmail && formData.password && accessToken) {
                await offlineAuthService.storeCredentials(
                  normalizedEmail,
                  formData.password,
                  accessToken,
                  userData
                );
              }
            } catch {
              /* non-fatal */
            }
          }

          Cookies.set("otp_verified", "true", {
            expires: 365,
            sameSite: "lax",
            path: "/",
          });

          try {
            await saveLastSession(tenant);
          } catch {
            /* non-fatal */
          }

          toast.success("Login successful!", {
            toastId: "login-success",
            autoClose: 3000,
          });

          router.push(dashboardHrefForTenant(tenant));
          return;
        }

        // Unexpected: neither MFA token nor accessToken
        console.error("Login response:", response);
        toast.error("Unexpected response from server. No authentication token received.", {
          toastId: "login-error",
        });
      }
    } catch (error: any) {
      if (shouldSuppressUserFacingApiError(error)) {
        try {
          const offlineResult = await offlineAuthService.verifyCredentialsOffline(
            formData.email,
            formData.password
          );
          if (offlineResult.success && offlineResult.token && offlineResult.userData) {
            Cookies.set("auth_token", offlineResult.token, { expires: 1 });
            Cookies.set("user", JSON.stringify(offlineResult.userData), { expires: 1 });
            setUser(offlineResult.userData);
            toast.success("Offline login successful", { toastId: "offline-login-success" });
            router.push("/dashboard");
            return;
          }
        } catch {
          /* fall through — no user-facing backend_unreachable message */
        }
        console.warn("Login: API unreachable, no cached credentials");
        return;
      }

      // Check if error is due to offline
      if (!navigator.onLine || isOffline) {
        // Try offline login as fallback
        try {
          const offlineResult = await offlineAuthService.verifyCredentialsOffline(
            formData.email,
            formData.password
          );

          if (offlineResult.success && offlineResult.token && offlineResult.userData) {
            Cookies.set("auth_token", offlineResult.token, { expires: 1 });
            Cookies.set("user", JSON.stringify(offlineResult.userData), { expires: 1 });
            setUser(offlineResult.userData);

            toast.success("Offline login successful", { toastId: "offline-login-success" });
            router.push("/dashboard");
            return;
          }
        } catch (offlineError) {
          // Fall through to show error
        }

        toast.error(
          "Login requires internet connection. Please check your network and try again.",
          {
            toastId: "offline-login-error",
          }
        );
        return;
      }

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
        <h1 className="header font-bold text-2xl md:text-3xl lg:text-4xl leading-tight ">Welcome to LoCiCare!</h1>
        <div className="line border-2 border-white w-40"></div>
        <div className="line border-3 border-white"></div>
        <span className="welcom md:w-3/4 text-lg leading-8">
        Empowering Missions. Strengthening Communities.
        Together, we connect people, data, and care—driving innovation, compassion, and operational excellence to advance community well-being.
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
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-base md:text-lg">
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
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Offline Mode:</strong> You can login using previously saved credentials.
                  If you haven&apos;t logged in online before, please connect to the internet first.
                </p>
              </div>
            )}
            <Button
              className="font-medium mb-3 bg-[#003465]"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : isOffline ? "Login Offline" : "Login"}
            </Button>
          </form>

          <p className="mt-4 w-full text-center text-[11px] sm:text-xs text-white/90 leading-relaxed px-1">
            By logging into LociCare, you confirm the statements in{" "}
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="text-[#FAD900] underline font-medium hover:text-[#ffe433] bg-transparent border-0 p-0 cursor-pointer inline"
            >
              Privacy and security
            </button>
            .
          </p>

          <AlertDialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
            <AlertDialogContent className="max-w-lg sm:max-w-xl max-h-[min(88vh,640px)] overflow-y-auto bg-white text-gray-900 border-gray-200 !z-[120]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-semibold text-[#003465] pr-6">
                  Privacy and security
                </AlertDialogTitle>
              </AlertDialogHeader>
              <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                <p className="font-semibold text-gray-900">
                  LociCare by JOEE Solutions sensitive health data, and it is our shared duty to protect it.
                </p>
                <p>By logging into LociCare, I confirm that:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>I have been granted authorized access to LociCare for my work-related tasks.</li>
                  <li>I am signing in with my own email address and credentials, not using someone else&apos;s.</li>
                  <li>I will not use the software for any actions that are infringing, or unlawful.</li>
                  <li>
                    My access is for a lawful purpose in accordance with data privacy, security, confidentiality
                    regulations and all other relevant laws.
                  </li>
                  <li>I will only retrieve the minimum necessary information required for my duties.</li>
                </ul>
                <p>
                  Any unauthorized use of this system is strictly forbidden and may result in criminal or civil
                  penalties.
                </p>
                <p>
                  Please contact us{" "}
                  <Link
                    href={SUPPORT_FORM_URL}
                    {...(SUPPORT_FORM_URL.startsWith("mailto:")
                      ? {}
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    className="text-[#003465] underline font-medium hover:text-[#002147]"
                  >
                    here
                  </Link>{" "} support@joee.solutions
                  for support.
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#003465] text-white hover:bg-[#003465]/90 border-0 sm:mt-0">
                  Close
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default TenantLoginPage;
