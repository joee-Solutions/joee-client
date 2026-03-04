"use client";

import { DownloadIcon } from "@/components/icons/icon";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/inputShad";

const MIN_LENGTH = 8;
const schema = z
  .object({
    oldPassword: z.string({ required_error: "Current password is required" }),
    password: z
      .string({ required_error: "New password is required" })
      .min(MIN_LENGTH, `Password must be at least ${MIN_LENGTH} characters`)
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Password must contain at least one special character"),
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordSchemaType = z.infer<typeof schema>;

function generatePassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = lowercase + uppercase + numbers + special;
  let pwd = "";
  pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
  pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 4; i < MIN_LENGTH; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function ChangeAdminPassword() {
  const [isDisable, setIsDisable] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [saving, setSaving] = useState(false);

  const onSubmit = async (payload: ChangePasswordSchemaType) => {
    try {
      setSaving(true);
      await processRequestOfflineAuth("patch", API_ENDPOINTS.CHANGE_PASSWORD, {
        old_password: payload.oldPassword,
        new_password: payload.password,
        confirm_password: payload.confirmPassword,
      });
      toast.success("Password changed successfully", { toastId: "password-change" });
      form.reset({ oldPassword: "", password: "", confirmPassword: "" });
      setIsDisable(true);
    } catch (e: any) {
      toast.error((e?.response?.data?.message as string) ?? e?.response?.data?.error ?? "Failed to change password", { toastId: "password-change-error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisableForm = () => {
    setIsDisable(false);
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    form.setValue("password", pwd);
    form.setValue("confirmPassword", pwd);
    form.clearErrors(["password", "confirmPassword"]);
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">Change Password</h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-sm text-gray-600">Current Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="bg-[#D9EDFF] border-[#D9EDFF] h-14 px-4 pr-12"
                      disabled={isDisable}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                      aria-label={showOldPassword ? "Hide password" : "Show password"}
                    >
                      {showOldPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <Button
                type="button"
                onClick={handleGeneratePassword}
                disabled={isDisable}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <RefreshCw className="size-4" />
                Generate password
              </Button>
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password (min 8 chars, upper, lower, number, special)"
                        className="bg-[#D9EDFF] border-[#D9EDFF] h-14 px-4 pr-12"
                        disabled={isDisable}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-sm text-gray-600">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="bg-[#D9EDFF] border-[#D9EDFF] h-14 px-4 pr-12"
                      disabled={isDisable}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-7">
            <Button
              type="button"
              onClick={handleDisableForm}
              className={`${!isDisable && "hidden"} h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full`}
            >
              Edit <Edit size={20} />
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={`${isDisable && "hidden"} h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full`}
            >
              {saving ? (
                <>
                  <span className="inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>Save Changes <DownloadIcon /></>
              )}
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
