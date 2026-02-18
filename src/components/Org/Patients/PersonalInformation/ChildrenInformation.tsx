import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDataStepper } from "../PatientStepper";

// Validation schema
export const childrenSchema = z.object({
  fullName: z.string().optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => {
      // Only validate email format if there's a value
      if (!val || val.trim() === "") return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }, "Invalid email address"),
});


export default function GuardianInfoForm() {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext<FormDataStepper>();

  // Watch the date of birth to determine if fields should be required
  const dateOfBirth = watch("demographic.dateOfBirth");
  
  // Calculate if patient is under 18
  const isUnder18 = React.useMemo(() => {
    if (!dateOfBirth) return false;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    return actualAge < 18;
  }, [dateOfBirth]);

  return (
    <div className=" mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Guardian Information</h2>
      
      {isUnder18 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Guardian information (Full Name, Relationship, Phone, and Email) is required for patients under 18 years old.
          </p>
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guardian Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-base text-black font-normal mb-2"
            >
              Guardian Full Name {isUnder18 && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="text"
              id="fullName"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("children.fullName",)}
            />
            {errors.children?.fullName && (
              <p className="text-red-500 text-sm">
                {errors.children.fullName.message}
              </p>
            )}
          </div>

          {/* Sex */}

          <Controller
            name='children.sex'
            control={control}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="Sex"
                  className="block text-base text-black font-normal mb-2"
                >
                  Sex
                </label>
                <Select
                  {...field}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder={`Select Gender`} />

                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {['male', 'female', 'other'].map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-gray-200">
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors?.children?.sex && (
                  <p className="text-red-500 text-sm">{errors.children?.sex.message}</p>
                )}
              </div>
            )}

          />

          {/* Relationship */}
          <div>
            <label
              htmlFor="relationship"
              className="block text-base text-black font-normal mb-2"
            >
              Relationship {isUnder18 && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="text"
              id="relationship"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register('children.relationship')}
            />
            {errors.children?.relationship && (
              <p className="text-red-500 text-sm">
                {errors.children?.relationship.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-base text-black font-normal mb-2"
            >
              Phone {isUnder18 && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="tel"
              id="phone"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("children.phone")}
            />
            {errors.children?.phone && (
              <p className="text-red-500 text-sm">
                {errors.children?.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label
              htmlFor="email"
              className="block text-base text-black font-normal mb-2"
            >
              Email {isUnder18 && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="email"
              id="email"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("children.email")}
            />
            {errors.children?.email && (
              <p className="text-red-500 text-sm">
                {errors.children?.email.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
