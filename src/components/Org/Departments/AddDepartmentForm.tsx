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
import DepartmentList from "@/app/(dashboard)/[tenant]/dashboard/departments/page";

const DepartmentSchema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  departmentImage: z.string().optional(),
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
  const [fileSelected, setFileSelected] = useState<string>("");
  const [showList, setShowList] = useState(false);


  const form = useForm<DepartmentSchemaType>({
    resolver: zodResolver(DepartmentSchema),
    mode: "onChange",
    defaultValues: {
      departmentName: "",
      departmentImage: "",
      departmentDescription: "",
      status: false
    },
  });

  const onSubmit = (data: DepartmentSchemaType) => {
    if (onSubmitProp) {
      // Transform data to match parent's expected format
      const transformedData = {
        name: data.departmentName,
        code: data.departmentName.substring(0, 2).toUpperCase(),
        color: 'bg-blue-600',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-600',
        employeeCount: 0,
        status: data.status ? 'Inactive' : 'Active',
        image: data.departmentImage || '/images/default.jpg',
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

  const handleListDepartment = () => {
    setShowList(false);
  };

  return (
    <div className="px-[27px] pb-[35px]">

    {showList ? (
      <DepartmentList 
      />
    ) : (
    <div className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
      <div className="flex justify-between items-center border-b-2  py-4 mb-8">
        <h1 className="font-semibold text-xl text-black">Add Department</h1>
          <Button
      onClick={handleListDepartment} 
                      className="text-base text-[#003465] font-normal"
                    >
                      Department List
                    </Button>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-4 flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6 ">
          <div className="flex-1">
            <label className="block text-base text-black font-normal mb-2">Department name</label>
            <Input 
              placeholder="Enter here"
              {...form.register("departmentName")}
              className="w-full h-14 p-3 border border-[#737373] rounded"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-base text-black font-normal mb-2">Upload Department Image</label>
            <div className="flex">
              <div className="flex-1 border h-14 border-[#737373] rounded flex items-center px-4">
                <span className="mr-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.29241 11.1974C9.26108 11.1664 9.21878 11.149 9.1747 11.149C9.13062 11.149 9.08832 11.1664 9.057 11.1974L6.63624 13.6184C5.51545 14.7393 3.62384 14.858 2.38638 13.6184C1.14684 12.3787 1.26558 10.4891 2.38638 9.36817L4.80714 6.94721C4.87172 6.88263 4.87172 6.77637 4.80714 6.71179L3.978 5.88258C3.94667 5.85156 3.90437 5.83416 3.86029 5.83416C3.81621 5.83416 3.77391 5.85156 3.74259 5.88258L1.32183 8.30353C-0.440611 10.0661 -0.440611 12.9183 1.32183 14.6788C3.08427 16.4393 5.93627 16.4414 7.69663 14.6788L10.1174 12.2579C10.182 12.1933 10.182 12.087 10.1174 12.0225L9.29241 11.1974ZM14.6797 1.32194C12.9173 -0.440647 10.0653 -0.440647 8.30494 1.32194L5.8821 3.74289C5.85108 3.77422 5.83369 3.81652 5.83369 3.86061C5.83369 3.90469 5.85108 3.94699 5.8821 3.97832L6.70916 4.80544C6.77374 4.87003 6.87998 4.87003 6.94457 4.80544L9.36532 2.38449C10.4861 1.2636 12.3777 1.14485 13.6152 2.38449C14.8547 3.62414 14.736 5.51381 13.6152 6.6347L11.1944 9.05565C11.1634 9.08698 11.146 9.12928 11.146 9.17336C11.146 9.21745 11.1634 9.25975 11.1944 9.29108L12.0236 10.1203C12.0881 10.1849 12.1944 10.1849 12.259 10.1203L14.6797 7.69933C16.4401 5.93675 16.4401 3.08453 14.6797 1.32194ZM10.0445 5.09087C10.0131 5.05985 9.97084 5.04245 9.92676 5.04245C9.88268 5.04245 9.84038 5.05985 9.80906 5.09087L5.09046 9.80777C5.05944 9.8391 5.04204 9.8814 5.04204 9.92548C5.04204 9.96957 5.05944 10.0119 5.09046 10.0432L5.91543 10.8682C5.98001 10.9328 6.08626 10.9328 6.15084 10.8682L10.8674 6.15134C10.9319 6.08676 10.9319 5.9805 10.8674 5.91591L10.0445 5.09087Z" fill="#737373"/>
</svg>

                </span>
                <span className="text-gray-500">
                  {fileSelected || "Choose File"}
                </span>
              </div>
              <Button 
                type="button"
                className="bg-[#003465] hover:bg-[#102437] text-white px-6 py-2 h-14 rounded"
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
                    form.setValue("departmentImage", file.name);
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="">
          <label className="block text-base text-black font-normal mb-2">Department Description</label>
          <Textarea 
            placeholder="Your Message"
            {...form.register("departmentDescription")}
            className="w-full p-3 min-h-52 border border-[#737373] rounded"
          />
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
  )} 
  </div>
  );
}