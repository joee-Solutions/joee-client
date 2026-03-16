"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import DepartmentList from "@/app/(dashboard)/[tenant]/dashboard/departments/page";

const DepartmentSchema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  departmentDescription: z.string().min(1, "Department description is required"),
  status: z.boolean().default(false)
});

type DepartmentSchemaType = z.infer<typeof DepartmentSchema>;

interface AddDepartmentProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function AddDepartment({ onSubmit: onSubmitProp, onCancel: onCancelProp }: AddDepartmentProps) {
  const router = useRouter();

  const form = useForm<DepartmentSchemaType>({
    resolver: zodResolver(DepartmentSchema),
    mode: "onChange",
    defaultValues: {
      departmentName: "",
      departmentDescription: "",
      status: false
    },
  });

  const onSubmit = (data: DepartmentSchemaType) => {
    if (onSubmitProp) {
      // Transform data to match API expected format
      const transformedData = {
        name: data.departmentName,
        code: data.departmentName.substring(0, 2).toUpperCase(),
        departmentDescription: data.departmentDescription,
        status: data.status ? 'Inactive' : 'Active',
        color: 'bg-blue-600',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-600',
        employeeCount: 0,
      };
      onSubmitProp(transformedData);
    } else {
      console.log(data);
    }
  };

  const handleCancel = () => {
    if (onCancelProp) {
      onCancelProp();
    } else {
      router.back();
    }
  };

  return (
    <div className="px-[27px] pb-[35px]">
    <div className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
      <div className="flex justify-between items-center border-b-2  py-4 mb-8">
        <h1 className="font-semibold text-xl text-black">Add Department</h1>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancel();
            }}
            className="px-4 py-2 bg-[#003465] text-white rounded hover:bg-[#003465]/90 font-medium"
          >
            Department List
          </Button>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <p className="font-medium mb-1">Please fix the following:</p>
            <ul className="list-disc list-inside">
              {form.formState.errors.departmentName?.message && (
                <li>{form.formState.errors.departmentName.message}</li>
              )}
              {form.formState.errors.departmentDescription?.message && (
                <li>{form.formState.errors.departmentDescription.message}</li>
              )}
            </ul>
          </div>
        )}
        <div className="mb-4">
          <div className="flex-1">
            <label className="block text-base text-black font-normal mb-2">Department name</label>
            <Input 
              placeholder="Enter here"
              {...form.register("departmentName")}
              className={`w-full h-14 p-3 border rounded ${form.formState.errors.departmentName ? "border-red-500" : "border-[#737373]"}`}
            />
            {form.formState.errors.departmentName?.message && (
              <span className="text-xs text-red-600 mt-1 block">{form.formState.errors.departmentName.message}</span>
            )}
          </div>
        </div>
        
        <div className="">
          <label className="block text-base text-black font-normal mb-2">Department Description</label>
          <Textarea 
            placeholder="Your Message"
            {...form.register("departmentDescription")}
            className={`w-full p-3 min-h-52 border rounded ${form.formState.errors.departmentDescription ? "border-red-500" : "border-[#737373]"}`}
          />
          {form.formState.errors.departmentDescription?.message && (
            <span className="text-xs text-red-600 mt-1 block">{form.formState.errors.departmentDescription.message}</span>
          )}
        </div>
        
        <div className="">
          <h3 className="block text-base text-black font-normal mb-2">Status</h3>
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
        
        <div className="flex space-x-4 pt-4 ">
          <Button
            type="button"
            className=" border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-8 px-16 text-md rounded"
            onClick={handleCancel}
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
  </div>
  );
}