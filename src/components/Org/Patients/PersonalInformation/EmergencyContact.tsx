import React from "react";
import { useForm } from "react-hook-form";
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

// Validation schema
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  relationship: z.string().min(1, "Relationship is required"),
  permission: z.enum(["Yes", "No"], { required_error: "Permission is required" }),
});

type FormData = z.infer<typeof schema>;

export default function EmergencyContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Convert `register` to work with `shadcn/ui` Select
  const registerSelect = (name: keyof FormData) => ({
    value: watch(name) as string,
    onValueChange: (value: string) => setValue(name, value),
  });

  const onSubmit = (data: FormData) => {
    console.log("Emergency Contact Form submitted:", data);
  };

  return (
    <div className=" mx-auto p-6 ">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contact Name */}
          <div>
            <label htmlFor="name" className="block text-base text-black font-normal mb-2">
              Emergency Contact Name
            </label>
            <Input
              type="text"
              id="name"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"

              {...register("name")}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label htmlFor="phone" className="block text-base text-black font-normal mb-2">
              Emergency Contact Phone
            </label>
            <Input
              type="tel"
              id="phone"
              placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"

              {...register("phone")}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          {/* Emergency Contact Email */}
          <div>
            <label htmlFor="email" className="block text-base text-black font-normal mb-2">
              Emergency Contact Email
            </label>
            <Input
              type="email"
              id="email"
              placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"

              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Relationship */}
          <div>
            <label htmlFor="relationship" className="block text-base text-black font-normal mb-2">
              Relationship
            </label>
            <Input
              type="text"
              id="relationship"
              placeholder="Enter here"
           className="w-full h-14 p-3 border border-[#737373] rounded"

              {...register("relationship")}
            />
            {errors.relationship && <p className="text-red-500 text-sm">{errors.relationship.message}</p>}
          </div>

          {/* Permission to Contact Emergency Contact */}
          <div className="md:col-span-2">
            <label htmlFor="permission" className="block text-base text-black font-normal mb-2">
              Permission to Contact Emergency Contact
            </label>
            <Select {...registerSelect("permission")}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                <SelectItem value="Yes" className="hover:bg-gray-200">Yes</SelectItem>
                <SelectItem value="No" className="hover:bg-gray-200">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.permission && <p className="text-red-500 text-sm">{errors.permission.message}</p>}
          </div>
        </div>

      
      </form>
    </div>
  );
}