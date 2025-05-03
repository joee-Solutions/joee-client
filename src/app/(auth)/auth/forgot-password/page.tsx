"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/icons/Spinner";
import { processRequestNoAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { useRouter } from "next/navigation";

type ForgetPasswordProps = z.infer<typeof schema>;

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const ForgetPassword = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordProps>({
    resolver: zodResolver(schema),
  });

  const handleReset = async (data: ForgetPasswordProps) => {
    try {
      const res = await processRequestNoAuth(
        "post",
        API_ENDPOINTS.FORGOT_PASSWORD,
        data
      );
      if (res) {
        router.push(`/auth/forgot-password/${res.data.token}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="font-poppins container grid place-items-center  bg-[#5882C17D] shadow-lg rounded-2xl border border-blue-500 text-white w-full max-w-[350px] md:max-w-[450px] md:px-8 px-8 py-20 ">
        <div className="form flex flex-col items-center justify-center space-y-12 ">
          <div className="orgDeatails text-center flex flex-col items-center justify-center gap-4">
            <h2 className="login font-bold text-2xl md:text-3xl">
              Forgot Password?
            </h2>
            <span className="text-base">Enter your email for instructions</span>
          </div>
          <form
            action=""
            className="grid w-full max-w-[648px] text-white"
            onSubmit={handleSubmit(handleReset)}
          >
            <div className="grid gap-[6px] mb-7">
              <label htmlFor="login-email" className="text-sm ">
                Email
              </label>
              <Input
                id="login-email"
                placeholder="Enter your email here"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                // onChange={}
                className="text-gray-400"
              />
            </div>
            <Button className="font-medium mt-3 bg-[#003465]" type="submit">
              {isSubmitting ? <Spinner /> : "Send 6-Digit Code"}
            </Button>
          </form>

          <div className="extra-details flex justify-between text-xs md:text-sm mb-7">
            <Link
              href={"/auth/login"}
              className="text-[#FAD900] hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
