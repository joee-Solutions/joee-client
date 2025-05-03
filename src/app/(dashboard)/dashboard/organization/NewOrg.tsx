"use client";

import FieldBox from "@/components/shared/form/FieldBox";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const NewOrganizationSchema = z.object({
  organizationName: z.string().min(1, "This field is required"),
  address: z.string().min(1, "This field is required"),
  city: z.string().min(1, "This field is required"),
  state: z.string().min(1, "This field is required"),
  zipCode: z.string().min(1, "This field is required").optional(),
  country: z.string().min(1, "This field is required"),
  organizationPhoneNumber: z.string().min(1, "This field is required"),
  organizationFax: z.string().min(1, "This field is required"),
  organizationEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "This field is required"),
  website: z
    .string()
    .url("Invalid URL address")
    .min(1, "This field is required"),
  adminName: z.string().min(1, "This field is required"),
  adminPhoneNumber: z.string().min(1, "This field is required"),
  adminEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "This field is required"),
  organizationType: z.string().min(1, "This field is required"),
});

type NewOrganizationSchemaType = z.infer<typeof NewOrganizationSchema>;

const cities = ["Lagos", "Osogbo"];
const states = ["Lagos", "Osun"];
const countries = ["Nigeria", "Ghana", "Kuwait"];

interface NewOrgProps {
  setIsAddOrg: (val: "add" | "edit" | "none") => void;
}

export default function NewOrg({ setIsAddOrg }: NewOrgProps) {
  const router = useRouter();
  const form = useForm<NewOrganizationSchemaType>({
    resolver: zodResolver(NewOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      organizationName: "",
      address: "",
      adminEmail: "",
      adminName: "",
      adminPhoneNumber: "",
      city: "",
      country: "",
      organizationEmail: "",
      organizationFax: "",
      organizationPhoneNumber: "",
      organizationType: "",
      state: "",
      website: "",
      zipCode: "",
    },
  });

  const onSubmit = (payload: NewOrganizationSchemaType) => {
    console.log(payload);
    router.push("/dashboard/organization/test");
  };

  return (
    <div className="flex flex-col gap-[30px]">
      <div>
        <Button
          onClick={() => setIsAddOrg("none")}
          className="font-semibold text-2xl text-black gap-1 p-0"
        >
          <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
          Create Organization
        </Button>
      </div>
      <div className="pt-10 pb-[52px] px-[49px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md">
        <FormComposer form={form} onSubmit={onSubmit}>
          <div className="flex flex-col gap-[30px]">
            <FieldBox
              name="organizationName"
              control={form.control}
              labelText="Organization name"
              type="text"
              placeholder="Enter here"
            />
            <FieldBox
              name="address"
              control={form.control}
              labelText="Address"
              type="text"
              placeholder="Enter here"
            />

            <div className="flex items-center gap-[30px]">
              <FieldSelect
                name="city"
                control={form.control}
                options={cities}
                labelText="City"
                placeholder="Select"
              />
              <FieldSelect
                name="state"
                control={form.control}
                options={states}
                labelText="State"
                placeholder="Select"
              />
            </div>
            <div className="flex items-center gap-[30px]">
              <FieldBox
                name="zipCode"
                type="text"
                control={form.control}
                labelText="Zip/Post code"
                placeholder="Enter here"
              />
              <FieldSelect
                name="country"
                control={form.control}
                options={countries}
                labelText="Country"
                placeholder="Select"
              />
            </div>
            <div className="flex items-center gap-[30px]">
              <FieldBox
                type="text"
                name="organizationPhoneNumber"
                control={form.control}
                labelText="Organization Phone number"
                placeholder="Enter here"
              />
              <FieldBox
                type="text"
                name="organizationFax"
                control={form.control}
                labelText="Organization Fax"
                placeholder="Enter here"
              />
            </div>
            <div className="flex items-center gap-[30px]">
              <FieldBox
                type="text"
                name="organizationEmail"
                control={form.control}
                labelText="Organization Email"
                placeholder="Enter here"
              />
              <FieldBox
                type="text"
                name="website"
                control={form.control}
                labelText="Website"
                placeholder="Enter here"
              />
            </div>
            <div className="flex items-center gap-[30px]">
              <FieldSelect
                name="organizationType"
                control={form.control}
                options={["hospital"]}
                labelText="Organization Type"
                placeholder="Select"
              />
              <FieldBox
                type="text"
                name="adminName"
                control={form.control}
                labelText="Admin/Contact Person name"
                placeholder="Enter here"
              />
            </div>
            <div className="flex items-center gap-[30px]">
              <FieldBox
                type="text"
                name="adminPhoneNumber"
                control={form.control}
                labelText="Admin Phone number"
                placeholder="Enter here"
              />
              <FieldBox
                type="text"
                name="adminEmail"
                control={form.control}
                labelText="Admin Email"
                placeholder="Enter here"
              />
            </div>

            <Button className="h-[60px] bg-[#003465] text-base font-medium text-white rounded">
              Submit
            </Button>
          </div>
        </FormComposer>
      </div>
    </div>
  );
}
