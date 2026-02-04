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
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    setError,
  } = useForm<LoginProps>({
    resolver: zodResolver(schema),
    // reValidateMode: "onChange",
  });

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
    try {
      setErrMessage("");
      
      // Make API call to login endpoint
      // The x-tenant-id header is automatically added by the API proxy based on the host header
      const response = await processRequestNoAuth(
        "post",
        API_ENDPOINTS.LOGIN,
        {
        email: data.email,
          password: data.password,
        }
      );

      // Check if response is successful
      if (response) {
        // Extract tokens from response
        // Postman response structure: { message: "...", data: { message: "...", user: {...}, token: "..." } }
        const authToken = 
          response.data?.data?.token ||  // Postman shows: data.data.token
          response.data?.token ||
          response.token || 
          response.auth_token || 
          response.data?.auth_token;
        
        const mfaToken = 
          response.data?.data?.mfa_token ||
          response.data?.mfa_token ||
          response.mfa_token;
        
        // Check if OTP verification is required (first-time login)
        // Backend indicates OTP is required by:
        // 1. Returning requires_otp: true flag, OR
        // 2. Returning mfa_token instead of direct token, OR
        // 3. Not returning a direct auth token
        const requiresOtp = 
          response.data?.data?.requires_otp === true ||
          response.data?.requires_otp === true ||
          response.requires_otp === true ||
          (!!mfaToken && !authToken); // If mfa_token exists but no auth token, OTP is required
        
        // Check if user has already verified OTP (stored in cookie)
        const otpVerified = Cookies.get("otp_verified") === "true";
        
        // If OTP is required (first-time login) and user hasn't verified yet, redirect to OTP page
        if (requiresOtp && !otpVerified && mfaToken) {
          // Save MFA token for OTP verification
          Cookies.set("mfa_token", mfaToken, {
            expires: 1 / 24, // 1 hour
            sameSite: 'lax',
            path: '/'
          });
          
          toast.info("Please verify your email with the OTP code sent to you.", {
            toastId: "otp-required",
            autoClose: 3000,
          });
          
          router.push("/verify-otp");
          return;
        }
        
        // If we have a direct auth token, OTP is not required (user has logged in before)
        // Proceed with normal login flow
        
        const refreshToken = 
          response.data?.data?.refresh_token ||
          response.data?.refresh_token ||
          response.refresh_token;
        
        // Extract user data - could be in different locations in response
        const user = 
          response.data?.data?.user ||
          response.data?.data?.data?.user ||
          response.data?.user || 
          response.user ||
          response.data?.data;

        if (authToken) {
          // Save authentication tokens with longer expiration (7 days)
          // Using sameSite: 'lax' for better compatibility and path: '/' to ensure cookies are accessible site-wide
          Cookies.set("auth_token", authToken, { 
            expires: 7, // 7 days
            sameSite: 'lax',
            path: '/'
          });
          
          if (refreshToken) {
            Cookies.set("refresh_token", refreshToken, { 
              expires: 30, // 30 days for refresh token
              sameSite: 'lax',
              path: '/'
            });
          }
          
          // Save user data from login response
          if (user) {
            // Ensure we have a proper user object
            const userData = typeof user === 'object' ? user : { email: user };
            Cookies.set("user", JSON.stringify(userData), { 
              expires: 7, // 7 days
              sameSite: 'lax',
              path: '/'
            });
            console.log("Saved user data from login:", userData);
          } else {
            console.warn("No user data found in login response:", response);
          }

          // If we received a direct auth token (not MFA token), user has already verified OTP before
          // Set otp_verified cookie so they won't be asked for OTP again
          if (authToken && !mfaToken) {
            Cookies.set("otp_verified", "true", {
              expires: 365, // 1 year
              sameSite: 'lax',
              path: '/'
            });
          }

          toast.success("Login successful!", {
            toastId: "login-success",
            autoClose: 3000,
          });
          
          router.push("/dashboard");
        } else {
          // Unexpected response format - no token found
          console.error("Login response:", response);
          toast.error("Unexpected response from server. No authentication token received.", {
            toastId: "login-error",
          });
        }
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
