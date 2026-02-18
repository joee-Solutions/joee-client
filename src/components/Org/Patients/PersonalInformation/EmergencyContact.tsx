import React from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
export const emergencySchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional().refine(
    (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
    { message: "Invalid phone number format" }
  ),
  email: z.string().email("Invalid email address").optional(),
  relationship: z.string().optional(),
  permission: z.enum(["Yes", "No"]).optional(),
});

export default function EmergencyContactForm() {
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   setValue,
  //   watch,
  // } = useForm<FormData>({
  //   resolver: zodResolver(schema),
  // });

  const {
    register,
    formState: { errors },
  } = useFormContext<Pick<FormDataStepper, 'emergency'>>();

  return (
    <div className=" mx-auto p-6 ">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contact Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-base text-black font-normal mb-2"
            >
              Emergency Contact Name
            </label>
            <Input
              type="text"
              id="name"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("emergency.name")}
            />
            {
              errors.emergency?.name && (
                <p className="text-red-500 text-sm">
                  {errors.emergency.name.message}
                </p>
              )
            }
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-base text-black font-normal mb-2"
            >
              Emergency Contact Phone
            </label>
            <Input
              type="text"
              id="phone"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("emergency.phone")}
            />
            {errors.emergency?.phone && (
              <p className="text-red-500 text-sm">
                {errors.emergency.phone.message}
              </p>
            )}
          </div>

          {/* Emergency Contact Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-base text-black font-normal mb-2"
            >
              Emergency Contact Email
            </label>
            <Input
              type="email"
              id="email"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("emergency.email")}
            />
            {errors.emergency?.email && (
              <p className="text-red-500 text-sm">
                {errors.emergency.email.message}
              </p>
            )}
          </div>

          {/* Relationship */}
          <div>
            <label
              htmlFor="relationship"
              className="block text-base text-black font-normal mb-2"
            >
              Relationship
            </label>
            <Input
              type="text"
              id="relationship"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("emergency.relationship")}
            />
            {errors.emergency?.relationship && (
              <p className="text-red-500 text-sm">
                {errors.emergency.relationship.message}
              </p>
            )}
          </div>

          {/* Permission to Contact Emergency Contact */}

          <div className="md:col-span-2">
            <label
              htmlFor="emergency.permission"
              className="block text-base text-black font-normal mb-2"
            >
              Permission to Contact Emergency Contact
            </label>

            <Controller
              name="emergency.permission"
              control={useFormContext().control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    <SelectItem value="Yes" className="hover:bg-gray-200">
                      Yes
                    </SelectItem>
                    <SelectItem value="No" className="hover:bg-gray-200">
                      No
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {
              errors.emergency?.permission && (
                <p className="text-red-500 text-sm">
                  {errors.emergency.permission.message}
                </p>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
