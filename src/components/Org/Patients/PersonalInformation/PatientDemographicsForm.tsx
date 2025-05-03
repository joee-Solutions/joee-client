"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const PatientDemoSchema = z.object({
  suffix: z.string().min(1, "Suffix is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().min(1, "Middle name is required"),
  lastName: z.string().min(1, "Last name is required"),
  preferedNmae: z.string().min(1, "Preferred name is required"),
  medicalRecord: z.string().min(1, "Medical record number is required"),
  sex: z.string().min(1, "Sex is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  race: z.string().min(1, "Race is required"),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  preferredLanguage: z.string().min(1, "Preferred language is required"),
  interpreterRequired: z.string().min(1, "Interpreter required is required"),
  religion: z.string().min(1, "Religion is required"),
  genderIdentity: z.string().min(1, "Gender identity is required"),
  sexualOrientation: z.string().min(1, "Sexual orientation is required"),
  patientImage: z.string().optional(),
});

type PatientSchemaType = z.infer<typeof PatientDemoSchema>;

export default function PatientInfoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientSchemaType>({
    resolver: zodResolver(PatientDemoSchema),
    mode: "onChange",
  });

  const [fileName, setFileName] = useState("");

  const onSubmit = (data: PatientSchemaType) => {
    console.log(data);
    // Handle form submission
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // Dropdown options as arrays
  const dropdownOptions = {
    suffix: ["Mr.", "Mrs.", "Ms.", "Dr.", "Jr.", "Sr.", "II", "III", "IV"],
    sex: ["Male", "Female", "Other", "Prefer not to say"],
    maritalStatus: ["Single", "Married", "Divorced", "Widowed", "Separated", "Other"],
    race: [
      "White",
      "Black or African American",
      "Asian",
      "Native Hawaiian or Pacific Islander",
      "American Indian or Alaska Native",
      "Other",
      "Prefer not to say",
    ],
    ethnicity: ["Hispanic or Latino", "Not Hispanic or Latino", "Prefer not to say"],
    preferredLanguage: ["English", "Spanish", "French", "Mandarin", "Arabic", "Other"],
    interpreterRequired: ["Yes", "No"],
    religion: [
      "Christianity",
      "Islam",
      "Judaism",
      "Hinduism",
      "Buddhism",
      "None",
      "Other",
      "Prefer not to say",
    ],
    genderIdentity: [
      "Man",
      "Woman",
      "Non-binary",
      "Transgender",
      "Other",
      "Prefer not to say",
    ],
    sexualOrientation: [
      "Heterosexual",
      "Homosexual",
      "Bisexual",
      "Asexual",
      "Other",
      "Prefer not to say",
    ],
  };

  return (
    <div className="mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* First Name */}
               <div>
            <label htmlFor="firstName" className="block text-base text-black font-normal mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("firstName")}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-base text-black font-normal mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("lastName")}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
          </div>
          {/* Dynamic Dropdowns */}
          {Object.entries(dropdownOptions).map(([key, options]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-base text-black font-normal mb-2">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              </label>
              <Select {...register(key as keyof PatientSchemaType)}>
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="z-10 bg-white">
                  {options.map((option, index) => (
                    <SelectItem key={index} value={option} className="hover:bg-gray-200">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors[key as keyof PatientSchemaType] && (
                <p className="text-red-500 text-sm">
                  {errors[key as keyof PatientSchemaType]?.message}
                </p>
              )}
            </div>
          ))}

     

          {/* Upload Patient Image */}
          <div className="md:col-span-2">
            <label htmlFor="patientImage" className="block text-base text-black font-normal mb-2">
              Upload Patient Image
            </label>
            <div className="flex">
              <label
                htmlFor="file-upload"
                className="flex-grow flex items-center px-4 py-3 border border-gray-300 rounded-l-md bg-white text-gray-400 cursor-pointer"
              >
                <span className="mr-2">
                  <Paperclip className="h-5 w-5" />
                </span>
                <span className="truncate">{fileName || "Choose File"}</span>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={handleFileChange}
                />
              </label>
              <Button
                type="button"
                className="w-24 bg-[#003465] hover:bg-[#0d2337] h-14 text-white py-3 px-4 rounded-r-md"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Browse
              </Button>
            </div>
          </div>
        </div>

       
      </form>
    </div>
  );
}