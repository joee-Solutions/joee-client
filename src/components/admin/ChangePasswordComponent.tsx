import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import FormComposer from "../shared/form/FormComposer";
import FieldBox from "../shared/form/FieldBox";
import { Button } from "../ui/button";
import { PlusSquareIcon } from "lucide-react";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";

const changePasswordSchema = zod.object({
  oldPassword: zod.string().min(1, "This field is required"),
  newPassword: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string().min(1, "This field is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordSchemaType = zod.infer<typeof changePasswordSchema>;

interface ChangePasswordComponentProps {
  onPasswordChange?: () => void;
}

export default function ChangePasswordComponent({ onPasswordChange }: ChangePasswordComponentProps) {
  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (payload: ChangePasswordSchemaType) => {
    try {
      const response = await processRequestAuth("post", API_ENDPOINTS.CHANGE_PASSWORD, {
        old_password: payload.oldPassword,
        new_password: payload.newPassword,
        confirm_password: payload.confirmPassword,
      });

      if (response) {
        toast.success("Password changed successfully", { toastId: "password-change-success" });
        form.reset();
        if (onPasswordChange) {
          onPasswordChange();
        }
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Failed to change password";
      toast.error(errorMessage, { toastId: "password-change-error" });
    }
  };

  const handleEdit = () => {};

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Admin Profile
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="oldPassword"
            control={form.control}
            labelText="Old Password"
            type="password"
            placeholder="Enter password here"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="password"
            name="newPassword"
            control={form.control}
            labelText="New password"
            placeholder="Enter Password here"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="confirmPassword"
            control={form.control}
            labelText="Confirm Password"
            type="password"
            placeholder="Enter Password here"
          />

          <div className="flex items-center gap-7">
        

              <Button
                onClick={handleEdit}
                type="button"
                className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full"
              >
                Save chnages <PlusSquareIcon size={20} />
              </Button>
           

           
          </div>
        </div>
      </FormComposer>
    </>
  );
}
