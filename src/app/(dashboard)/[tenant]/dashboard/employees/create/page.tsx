"use client";

import FieldBox from "@/components/shared/form/FieldBox";
import FieldFileInput from "@/components/shared/form/FieldFileInput";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import FormComposer from "@/components/shared/form/FormComposer";
import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const employeeCards = [
  {
    id: 1,
    name: "Denise Hampton",
    role: "Doctor",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorFemale.png",
    rgbColorCode: "0, 52, 101",
  },
  {
    id: 2,
    name: "Susan Denilson",
    role: "Lab Attendant",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/labAttendant.png",
    rgbColorCode: "63, 169, 7",
  },
  {
    id: 3,
    name: "Cole Joshua",
    role: "Doctor",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorMale.png",
    rgbColorCode: "236, 9, 9",
  },
  {
    id: 4,
    name: "Jenifer Gloria",
    role: "Nurse",
    description:
      "Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. ",
    picture: "/assets/doctorFemale.png",
    rgbColorCode: "225, 195, 0",
  },
];

const EmployeeSchema = z.object({
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

type EmployeeSchemaType = z.infer<typeof EmployeeSchema>;

export default function EmployeeRegistrationForm() {
  const router = useRouter();

  const [imagePreviewer, setImagePreviewer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(EmployeeSchema),
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
      hireDate: undefined,
      specialty: "",
    },
  });

  const onSubmit = (payload: EmployeeSchemaType) => {
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
        title="Employees"
        description="Employees are the foundation for ensuring good health"
      />
      <div className="flex flex-col py-[50px] px-[30px]">
        <h4 className="font-medium text-2xl text-[#003465] mb-5">Top Search</h4>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] gap-[19px]">
          {employeeCards.map((empCard) => (
            <div
              key={empCard.id}
              className="rounded-[10px] shadow-[0px_4px_4px_0px_#00000040] bg-white flex flex-col overflow-hidden"
            >
              <div
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(${empCard.rgbColorCode},.8)), url('/assets/sectionHeaderBG.png')`,
                }}
                className={`h-[87.2px] bg-cover bg-no-repeat`}
              ></div>
              <div className="pb-5 flex flex-col items-center px-5">
                <div
                  style={{
                    borderWidth: "3px",
                    borderColor: `rgb(${empCard.rgbColorCode})`,
                  }}
                  className="size-[80px] -mt-10 rounded-full mb-[10px] flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={empCard.picture}
                    width={80}
                    height={80}
                    alt={`${empCard.name} photo`}
                  />
                </div>
                <h3 className="font-medium text-sm text-black">
                  {empCard.name}
                </h3>
                <p
                  style={{ color: `rgb(${empCard.rgbColorCode})` }}
                  className="font-medium text-xs text-center mt-2"
                >
                  {empCard.role}
                </p>
                <p className="font-normal text-[10px] my-2 text-center text-[#999999]">
                  {empCard.description}
                </p>
                <Link
                  href={`/dashboard/employees/${empCard.name
                    .split(" ")
                    .join("-")}`}
                  className="rounded-[4px] px-5 py-1 text-white font-medium text-xs bg-[#003465]"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px]">
            <div className="px-[27px]">
              <h2 className="font-semibold text-xl text-black">Add Employee</h2>
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
                      labelText="Upload Employee Image"
                      name="employeeImage"
                      fileInputRef={fileInputRef}
                      setImagePreviewer={setImagePreviewer}
                      hidden
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
