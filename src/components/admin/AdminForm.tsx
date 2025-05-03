"use client";
import React from "react";
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
import {
  Check,
  CheckCircle2,
  CircleArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FieldBox from "../shared/form/FieldBox";
import ProfileImageUploader from "../ui/ImageUploader";
import { useRouter } from "next/navigation";

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

export default function AdminForm() {
  const form = useForm<AdminFormSchemaType>({
    resolver: zodResolver(AdminFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "JP",
      lastName: "Morgan",
      email: "jpMorgan@gmail.com",
      phoneNumber: "0818888888",
      role: "",
      company: "Joee Solution",
    },
  });

  const onSubmit = (payload: AdminFormSchemaType) => {
    console.log(payload);
  };

  const handleEdit = () => {};
  const router = useRouter();
  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Create New Admin
      </h2>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full">
                  Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white flex flex-col items-center text-center">
                <AlertDialogHeader className="flex flex-col items-center">
                  <CheckCircle2 className="size-[100px] fill-[#3FA907] text-white" />
                  <AlertDialogTitle className="font-medium text-[#3FA907] text-4xl">
                    Success
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-normal text-base text-[#737373]">
                    You have successfully saved changes
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction className="h-[60px] w-[291px] bg-[#3FA907] text-white font-medium text-base">
                    <button
                      onClick={() => router.push("/dashboard/admin/list")}
                    >
                      Continue
                    </button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* <Button
              onClick={handleEdit}
              type="button"
              className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full"
            >
              Submit
            </Button> */}
          </div>
        </div>
      </FormComposer>
    </>
  );
}
