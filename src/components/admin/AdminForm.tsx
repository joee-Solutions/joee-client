"use client";
import React, { useState } from "react";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FormComposer from "@/components/shared/form/FormComposer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FieldBox from "../shared/form/FieldBox";
import ProfileImageUploader from "../ui/ImageUploader";
import { useRouter, usePathname } from "next/navigation";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";

const AdminFormSchema = z.object({
  firstName: z.string().min(1, "This field is required"),
  lastName: z.string().min(1, "This field is required"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "This field is required"),

  role: z.string().min(1, "This field is required"),
  phoneNumber: z.string().min(1, "This field is required"),
  company: z.string().min(1, "This field is required"),
  profileImage: z.string().optional(),
});

type AdminFormSchemaType = z.infer<typeof AdminFormSchema>;

const orgStatus = ["Admin", "Super Admin", "User"];

function useAdminBasePath() {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0] && segments[0] !== "dashboard" ? segments[0] : null;
  return tenant ? `/${tenant}/dashboard/admin` : "/dashboard/admin";
}

export default function AdminForm() {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<AdminFormSchemaType>({
    resolver: zodResolver(AdminFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "",
      company: "",
    },
  });

  const onSubmit = async (payload: AdminFormSchemaType) => {
    try {
      setIsSubmitting(true);
      const data = {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone_number: payload.phoneNumber,
        role: payload.role,
        company: payload.company,
      };
      await processRequestOfflineAuth("post", API_ENDPOINTS.CREATE_ADMIN, data);
      toast.success("Admin created successfully", { toastId: "admin-create-success" });
      setShowSuccess(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to create admin", { toastId: "admin-create-error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-[30px]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="font-bold text-base text-black">
          Create New Admin
        </h2>
      </div>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <ProfileImageUploader />
          <div className="grid grid-cols-2 gap-5 items-start justify-center">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              name="firstName"
              control={form.control}
              labelText="First Name"
              type="text"
              placeholder="Enter First name "
            />
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="lastName"
              control={form.control}
              labelText="Last Name"
              placeholder="Enter Last name"
            />
          </div>
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="email"
            control={form.control}
            labelText="Email"
            placeholder="Enter email"
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="phoneNumber"
            control={form.control}
            labelText="Phone number"
            placeholder="Enter Phone number"
          />

          <FieldSelect
            bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="role"
            control={form.control}
            options={orgStatus}
            labelText="Role"
            placeholder="Select"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="company"
            control={form.control}
            labelText="Company"
            type="text"
            placeholder="Enter here"
          />

          <div className="flex items-center gap-7">
            <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
              <AlertDialogContent className="bg-white flex flex-col items-center text-center">
                <AlertDialogHeader className="flex flex-col items-center">
                  <CheckCircle2 className="size-[100px] fill-[#3FA907] text-white" />
                  <AlertDialogTitle className="font-medium text-[#3FA907] text-4xl">
                    Success
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-normal text-base text-[#737373]">
                    You have successfully created the admin
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    className="h-[60px] w-[291px] bg-[#3FA907] text-white font-medium text-base"
                    onClick={() => router.push(`${basePath}/list`)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
