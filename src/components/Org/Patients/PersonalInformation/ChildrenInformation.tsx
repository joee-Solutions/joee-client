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
  fullName: z.string().min(1, "Full name is required"),
  sex: z.enum(["male", "female", "other"], { required_error: "Sex is required" }),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function GuardianInfoForm() {
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
    console.log("Form submitted:", data);
  };

  return (
    <div className=" mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Guardian Information</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guardian Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-base text-black font-normal mb-2">
              Guardian Full Name
            </label>
            <Input
              type="text"
              id="fullName"
              placeholder="Enter here"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("fullName")}
            />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
          </div>

          {/* Sex */}
          <div>
            <label htmlFor="sex" className="block text-base text-black font-normal mb-2">
              Sex
            </label>
            <Select {...registerSelect("sex")}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                <SelectItem value="male" className="hover:bg-gray-200">Male</SelectItem>
                <SelectItem value="female" className="hover:bg-gray-200">Female</SelectItem>
                <SelectItem value="other" className="hover:bg-gray-200">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.sex && <p className="text-red-500 text-sm">{errors.sex.message}</p>}
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

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-base text-black font-normal mb-2">
              Phone
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

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-base text-black font-normal mb-2">
              Email
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
        </div>

      </form>
    </div>
  );
}