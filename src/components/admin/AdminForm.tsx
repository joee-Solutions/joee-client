"use client";
import React, { useState } from "react";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FormComposer from "@/components/shared/form/FormComposer";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FieldBox from "../shared/form/FieldBox";
import ProfileImageUploader from "../ui/ImageUploader";
import { useRouter, usePathname } from "next/navigation";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";

const AdminFormSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  specialty: z.string().optional(),
  designation: z.string().min(1, "Designation is required"),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  hire_date: z.string().optional(),
  image_url: z.string().optional(),
  about: z.string().optional(),
  is_active: z.boolean().default(true),
  create_auth_credentials: z.boolean().default(true),
});

type AdminFormSchemaType = z.infer<typeof AdminFormSchema>;

const designationOptions = ["Admin", "Super Admin", "User"];
const genderOptions = ["Male", "Female", "Other"];

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
      firstname: "",
      lastname: "",
      email: "",
      phone_number: "",
      address: "",
      specialty: "",
      designation: "",
      gender: "",
      date_of_birth: "",
      hire_date: "",
      image_url: "",
      about: "",
      is_active: true,
      create_auth_credentials: true,
    },
  });

  const toISOOrUndefined = (dateStr: string | undefined): string | undefined => {
    if (!dateStr || !dateStr.trim()) return undefined;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) ? d.toISOString() : undefined;
  };

  const onSubmit = async (payload: AdminFormSchemaType) => {
    try {
      setIsSubmitting(true);
      const data = {
        firstname: payload.firstname.trim(),
        lastname: payload.lastname.trim(),
        email: payload.email.trim(),
        phone_number: payload.phone_number.trim(),
        address: (payload.address ?? "").trim() || undefined,
        specialty: (payload.specialty ?? "").trim() || undefined,
        designation: payload.designation.trim(),
        gender: (payload.gender ?? "").trim() || undefined,
        date_of_birth: toISOOrUndefined(payload.date_of_birth),
        hire_date: toISOOrUndefined(payload.hire_date),
        image_url: (payload.image_url ?? "").trim() || undefined,
        about: (payload.about ?? "").trim() || undefined,
        is_active: payload.is_active ?? true,
        create_auth_credentials: payload.create_auth_credentials ?? true,
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
              name="firstname"
              control={form.control}
              labelText="First Name"
              type="text"
              placeholder="Enter first name"
            />
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="lastname"
              control={form.control}
              labelText="Last Name"
              placeholder="Enter last name"
            />
          </div>
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="email"
            name="email"
            control={form.control}
            labelText="Email"
            placeholder="Enter email"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="phone_number"
            control={form.control}
            labelText="Phone number"
            placeholder="Enter phone number"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="address"
            control={form.control}
            labelText="Address"
            placeholder="Enter address"
          />
          <div className="grid grid-cols-2 gap-5 items-start justify-center">
            <FieldSelect
              bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
              name="designation"
              control={form.control}
              options={designationOptions}
              labelText="Designation"
              placeholder="Select"
            />
            <FieldSelect
              bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
              name="gender"
              control={form.control}
              options={genderOptions}
              labelText="Gender"
              placeholder="Select"
            />
          </div>
          <div className="grid grid-cols-2 gap-5 items-start justify-center">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="specialty"
              control={form.control}
              labelText="Specialty"
              placeholder="Enter specialty"
            />
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="date"
              name="date_of_birth"
              control={form.control}
              labelText="Date of birth"
              placeholder=""
            />
          </div>
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="date"
            name="hire_date"
            control={form.control}
            labelText="Hire date"
            placeholder=""
          />
          <FieldTextBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="about"
            control={form.control}
            labelText="About"
            placeholder="Enter about"
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(v) => form.setValue("is_active", v === true)}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create_auth_credentials"
                checked={form.watch("create_auth_credentials")}
                onCheckedChange={(v) => form.setValue("create_auth_credentials", v === true)}
                className="rounded"
              />
              <label htmlFor="create_auth_credentials" className="text-sm font-medium text-gray-700">
                Create auth credentials (allow this admin to sign in)
              </label>
            </div>
          </div>

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
