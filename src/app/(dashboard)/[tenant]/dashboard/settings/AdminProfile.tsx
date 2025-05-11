"use client";
import { DownloadIcon } from "@/components/icons/icon";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AdminSchema = z.object({
  firstName: z.string({ required_error: "This field is required" }),
  lastName: z.string({ required_error: "This field is required" }),
  address: z.string({ required_error: "This field is required" }),
  email: z.string({ required_error: "This field is required" }),
  phoneNumber: z.string({ required_error: "This field is required" }),
  role: z.string({ required_error: "This field is required" }),
  organization: z.string({ required_error: "This field is required" }),
});

type AdminSchemaType = z.infer<typeof AdminSchema>;

export default function AdminProfilePage() {
  const [isDisabled, setIsDisabled] = useState(true);

  const form = useForm<AdminSchemaType>({
    resolver: zodResolver(AdminSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      role: "",
      phoneNumber: "",
      organization: "",
    },
  });

  const onSubmit = (payload: AdminSchemaType) => {
    console.log(payload);

    setIsDisabled(true);
  };

  const handleDisbleForm = () => {
    setIsDisabled(false);
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Admin Profile
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="firstName"
            type="text"
            control={form.control}
            labelText="First Name"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="lastName"
            control={form.control}
            labelText="Last Name"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="address"
            control={form.control}
            labelText="Address"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="email"
            control={form.control}
            labelText="Email"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="phoneNumber"
            control={form.control}
            labelText="Phone number"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldSelect
            bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="role"
            control={form.control}
            options={["admin"]}
            labelText="Title"
            placeholder="Select"
            disabled={isDisabled}
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="organization"
            control={form.control}
            labelText="Organization"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <div className="flex items-center gap-7">
            <Button
              type="button"
              onClick={handleDisbleForm}
              className={`${
                !isDisabled && "hidden"
              } h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full`}
            >
              Edit <Edit size={20} />
            </Button>
            <Button
              className={`${
                isDisabled && "hidden"
              } h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full`}
            >
              Save Changes <DownloadIcon />
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
