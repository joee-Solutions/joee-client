"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  regionState: z.string().min(1, "Region/State is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  specialty: z.string().optional(),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  gender: z.string().min(1, "Gender is required"),
  employeeImage: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  shortBiography: z.string().optional(),
  status: z.boolean().default(false),
});

type EmployeeSchemaType = z.infer<typeof EmployeeSchema>;

export default function AddEmployee() {
  const router = useRouter();
  const [fileSelected, setFileSelected] = useState<string>("");
  
  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(EmployeeSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      regionState: "",
      dateOfBirth: "",
      specialty: "",
      designation: "",
      department: "",
      gender: "",
      employeeImage: "",
      hireDate: "",
      shortBiography: "",
      status: false,
    },
  });

  const onSubmit = (data: EmployeeSchemaType) => {
    console.log(data);
    // Handle form submission
  };

  // Sample data for dropdowns
  const regions = ["New York", "Lagos", "Texas", "Florida", "Abuja"];
  const departments = ["Opthamology", "Nephrology", "Oncology", "Neurology", "Jorthopedics"];
  const genders = ["Male", "Female", "Other", "Prefer not to say"];

  return (
    <div className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
      <div className="flex justify-between items-center border-b-2  py-4 mb-8">
        <h1 className="font-semibold text-xl text-black">ADD EMPLOYEE</h1>
       
          <Button
                              onClick={() =>("add")}
                              className="text-base text-[#003465] font-normal"
                            >
                              Employees List
                            </Button>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First name */}
          <div>
            <label className="block text-base text-black font-normal mb-2">First name</label>
            <Input 
              placeholder="Enter here"
              {...form.register("firstName")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Last name */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Last name</label>
            <Input 
              placeholder="Enter here"
              {...form.register("lastName")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Email</label>
            <Input 
              placeholder="Enter here"
              type="email"
              {...form.register("email")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Phone number */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Phone number</label>
            <Input 
              placeholder="Enter here"
              {...form.register("phoneNumber")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Address */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Address</label>
            <Input 
              placeholder="Enter here"
              {...form.register("address")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Region/State */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Region/State</label>
            <Select onValueChange={(value) => form.setValue("regionState", value)}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {regions.map((region) => (
                  <SelectItem key={region} value={region} className="hover:bg-gray-200">
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date of Birth */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Date of Birth</label>
            <div className="relative">
              <Input 
                placeholder="DD/MM/YYYY"
                type="date"
                {...form.register("dateOfBirth")}
                className="w-full h-14 p-3 border border-[#737373] rounded"
              />
              
            </div>
          </div>
          
          {/* Specialty */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Specialty</label>
            <Input 
              placeholder="Enter here"
              {...form.register("specialty")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Designation */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Designation</label>
            <Input 
              placeholder="Enter here"
              {...form.register("designation")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          {/* Department */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Department</label>
            <Select onValueChange={(value) => form.setValue("department", value)}>
              <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept} className="hover:bg-gray-200">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Gender */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Gender</label>
            <Select onValueChange={(value) => form.setValue("gender", value)}>
              <SelectTrigger className="w-full h-14 p-3 border border-[#737373] rounded flex justify-between items-center">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent className="z-10 bg-white">
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender} className="hover:bg-gray-200">
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Upload Employee Image */}
          <div>
            <label htmlFor="file-upload" className="block text-base text-black font-normal mb-2">Upload Employee Image</label>
            <div className="flex">
              <div className="flex-1 border rounded flex items-center px-4 h-14 border-[#737373]">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </span>
                <span className="text-gray-500">
                  {fileSelected || "Choose File"}
                </span>
              </div>
              <Button 
                type="button"
                className="bg-[#003465] hover:bg-[#0d2337] text-white px-6 py-2 h-14 rounded"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                Browse
              </Button>
              <input 
                id="fileInput"
                type="file" 
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileSelected(file.name);
                    form.setValue("employeeImage", file.name);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Hire date */}
          <div>
            <label className="block text-base text-black font-normal mb-2">Hire date</label>
            <Input 
              placeholder="Enter here"
              type="date"
              {...form.register("hireDate")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
        </div>
        
        {/* Short Biography */}
        <div>
          <label className="block text-base text-black font-normal mb-2">Short Biography</label>
          <Textarea 
            placeholder="Your Message"
            {...form.register("shortBiography")}
            className="w-full p-3 min-h-52 border border-[#737373] rounded"
          />
        </div>
        
        {/* Status */}
        <div>
          <h3 className="text-lg font-medium mb-4">Status</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="active"
                checked={!form.watch("status")}
                onCheckedChange={() => form.setValue("status", false)}
                className="accent-green-600 w-6 h-6 rounded"
              />
              <label htmlFor="active">Active</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inactive"
                checked={form.watch("status")}
                onCheckedChange={() => form.setValue("status", true)}
                className="accent-green-600 w-6 h-6 rounded"
              />
              <label htmlFor="inactive">Inactive</label>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
        <Button
            type="button"
            className=" border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-8 px-16 text-md rounded"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className=" bg-[#003465] hover:bg-[#0d2337] text-white py-8 px-16 text-md rounded"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}