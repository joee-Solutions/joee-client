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
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type LoginProps = z.infer<typeof schema>;

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  // password must contain a lowercase, uppercase letter, a number and a special character but must be validated seperately
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{":;'?/>.<,])(?=.*[a-zA-Z]).{8,}$/,
      {
        message:
          "Password must contain at least one lowercase, uppercase, number and one special character",
      }
    ),
});

const TenantLoginPage = () => {
  const router = useRouter();
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
  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handleFormSubmit = async (data: LoginProps) => {
    try {
      const rt = await processRequestNoAuth("post", API_ENDPOINTS.LOGIN, data);
      if (rt) {
        Cookies.set("mfa_token", rt.data.token, { expires: 1 / 48 });
        router.push("/verify-otp");
      }
    } catch (error: any) {
      toast.error(error?.response?.data.error);
      if (error?.status === 401) {
        setErrMessage(error?.response?.data.error);
      }
    }
  };

  useEffect(() => {
    if (errMessage.toLowerCase().includes("user")) {
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
  }, [errMessage]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-24  items-center justify-center font-poppins place-items-center">
      <div className="content col-span-1 text-white hidden md:flex flex-col justify-center space-y-8">
        <h1 className="header font-bold text-4xl md:text-8xl">Welcome!</h1>
        <div className="line border-2 border-white w-40"></div>
        <div className="line border-3 border-white"></div>
        <span className="welcom md:w-3/4 text-lg leading-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui
          repudiandae, saepe reprehenderit voluptate at a ipsum atque quod
          debitis. Excepturi magnam officia soluta ex at. Iusto fugiat numquam
          error doloremque?
        </span>
      </div>
      <div className=" col-span-1 shadow-lg rounded-2xl  border border-blue-500 text-white z-40 w-full max-w-[350px] md:max-w-[550px] md:px-8 px-8 py-20 [linear-gradient:rgb()] bg-[#5882C147]">
        <div className="form flex flex-col px-12 md:px-20  items-center justify-center space-y-4  ">
          <div className="orgDeatails flex flex-col items-center justify-center gap-4">
            <Image
              alt="logo"
              src="/assets/auth/otp.png"
              width={80}
              height={60}
              className="logo"
            />
            <span className=" ">
              <span className="font-medium text-2xl md:text-3xl">
                {" "}
                LociCare{" "}
              </span>
              by Joee
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
