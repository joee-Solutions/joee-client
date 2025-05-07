import { DownloadIcon } from "@/components/icons/icon";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldSelect from "@/components/shared/form/FieldSelect";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import FormComposer from "@/components/shared/form/FormComposer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CircleArrowLeft, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  oldPassword: z.string({ required_error: "This field is required" }),
  password: z.string({ required_error: "This field is required" }),
  confirmPassword: z.string({ required_error: "This field is required" }),
});

type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;

export default function ChangePassword() {
  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (payload: ChangePasswordSchemaType) => {
    console.log(payload);
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Change Password
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="oldPassword"
            control={form.control}
            labelText="Old Password"
            type="text"
            placeholder="Enter here"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="password"
            control={form.control}
            labelText="New Password"
            type="text"
            placeholder="Enter here"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="confirmPassword"
            control={form.control}
            labelText="Confirm Password"
            placeholder="Enter here"
          />

          <div className="flex items-center gap-7 mt-5">
            <Button className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full">
              Save Changes <DownloadIcon />
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
