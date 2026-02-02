"use client";

import FieldBox from "@/components/shared/form/FieldBox";
import FieldFileInput from "@/components/shared/form/FieldFileInput";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import FormComposer from "@/components/shared/form/FormComposer";
import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const PatientSchema = z.object({
  firstName: z.string({ required_error: "This field is required" }),
  lastName: z.string({ required_error: "This field is required" }),
  email: z
    .string({ required_error: "This field is required" })
    .email("Invalid email address"),
  phoneNumber: z.string({ required_error: "This field is required" }),
  address: z.string({ required_error: "This field is required" }),
  state: z.string({ required_error: "This field is required" }),
  dob: z.string({ required_error: "This field is required" }),
  specialty: z.string({ required_error: "This field is required" }),
  designation: z.string({ required_error: "This field is required" }),
  department: z.string({ required_error: "This field is required" }),
  gender: z.string({ required_error: "This field is required" }),
  employeeImage: z
    .instanceof(File)
    .refine((f) => ["image/png", "image/jpeg", "image/jpg"].includes(f.type), {
      message: "Unsupported image file",
    }),
  hireDate: z.string({ required_error: "This field is required" }),
  bio: z.string({ required_error: "This field is required" }),
});

type PatientSchemaType = z.infer<typeof PatientSchema>;

export default function PatientRegistrationForm() {
  const router = useRouter();

  const [imagePreviewer, setImagePreviewer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PatientSchemaType>({
    resolver: zodResolver(PatientSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      designation: "",
      department: "",
      state: "",
      phoneNumber: "",
      gender: "",
      dob: "",
      employeeImage: undefined,
      bio: "",
      hireDate: "",
      specialty: "",
    },
  });

  const onSubmit = (payload: PatientSchemaType) => {
    console.log(payload);

    const formData = new FormData();

    const { employeeImage } = payload;

    for (const [key, value] of Object.entries(payload)) {
      if (employeeImage) {
        formData.append("employeeImage", employeeImage);
      }

      formData.append(key, JSON.stringify(value));
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <section>
      <SectionHeader
        title="Patients"
        description="Adequate Health care services improves Patients Health   "
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <section className="shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px]">
            <div className="px-[27px]">
              <h2 className="font-semibold text-xl text-black">Add Patient</h2>
            </div>
          </header>
          <div className="px-[27px] pb-[35px]">
            <FormComposer form={form} onSubmit={onSubmit}>
              <div className="flex flex-col gap-[30px] pt-[33px]">
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldBox
                    control={form.control}
                    labelText="First name"
                    name="firstName"
                    type="text"
                    placeholder="Enter here"
                  />
                  <FieldBox
                    control={form.control}
                    labelText="Last name"
                    name="lastName"
                    type="text"
                    placeholder="Enter here"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldBox
                    control={form.control}
                    labelText="Email"
                    name="email"
                    type="text"
                    placeholder="Enter here"
                  />
                  <FieldBox
                    control={form.control}
                    labelText="Phone number"
                    name="phoneNumber"
                    type="text"
                    placeholder="Enter here"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldBox
                    control={form.control}
                    labelText="Address"
                    name="address"
                    type="text"
                    placeholder="Enter here"
                  />
                  <FieldBox
                    control={form.control}
                    labelText="Region/State"
                    name="state"
                    type="text"
                    placeholder="Enter here"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldBox
                    control={form.control}
                    labelText="Date of Birth"
                    name="dob"
                    type="date"
                    placeholder="Enter here"
                  />
                  <FieldBox
                    control={form.control}
                    labelText="Specialty"
                    name="specialty"
                    type="text"
                    placeholder="Enter here"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldBox
                    control={form.control}
                    labelText="Designation"
                    name="designation"
                    type="text"
                    placeholder="Enter here"
                  />
                  <FieldBox
                    control={form.control}
                    labelText="Department"
                    name="department"
                    type="text"
                    placeholder="Enter here"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldSelect
                    control={form.control}
                    labelText="Gender"
                    name="gender"
                    options={["Male", "Female"]}
                    placeholder="Choose your gender"
                  />
                  <div className="flex">
                    <FieldFileInput
                      control={form.control}
                      labelText="Upload Patient Image"
                      name="employeeImage"
                      fileInputRef={fileInputRef}
                      setImagePreviewer={setImagePreviewer}
                      hidden
                      showInline
                    />
                    <Button
                      type="button"
                      onClick={triggerFileUpload}
                      className="px-5 bg-[#003465] text-white h-[60px] self-end"
                    >
                      Browse
                    </Button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-[18px]">
                  <FieldBox
                    control={form.control}
                    labelText="Hire date"
                    name="hireDate"
                    type="date"
                    placeholder="Enter here"
                  />
                </div>
                <FieldTextBox
                  control={form.control}
                  name="bio"
                  labelText="Short Biography"
                  placeholder="Your Message"
                />
              </div>
              <div className="mt-8 flex gap-[10px]">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  className="h-[60px] w-[200px] border border-[#EC0909] text-[#EC0909] text-base font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="h-[60px] w-[200px] text-base font-medium bg-[#003465] hover:bg-[#003465]/90 text-white"
                >
                  Submit
                </Button>
              </div>
            </FormComposer>
          </div>
        </section>
      </div>
    </section>
  );
}
