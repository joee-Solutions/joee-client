import React from "react";
import FieldSelect from "@/components/shared/form/FieldSelect";
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
import {
  Check,
  CheckCircle2,
  CircleArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FieldBox from "../shared/form/FieldBox";

const EditOrganizationSchema = z.object({
  firstName: z.string().min(1, "This field is required"),
  address: z.string().min(1, "This field is required"),
  lastName: z.string().min(1, "This field is required"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "This field is required"),

  role: z.string().min(1, "This field is required"),
  phoneNumber: z.string().min(1, "This field is required"),
  company: z.string().min(1, "This field is required"),
});

type EditOrganizationSchemaType = z.infer<typeof EditOrganizationSchema>;

const orgStatus = ["Admin", "Super Admin", "User"];

export default function ProfileForm() {
  const form = useForm<EditOrganizationSchemaType>({
    resolver: zodResolver(EditOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "JP",
      lastName: "Morgan",
      address: "123, allen street, lagos",
      email: "jpMorgan@gmail.com",
      phoneNumber: "0818888888",
      role: "",
      company: "Joee Solution",
    },
  });
  const [isEdit, setIsEdit] = React.useState(true);
  const [isDisabled, setIsDisabled] = React.useState(true);

  const onSubmit = (payload: EditOrganizationSchemaType) => {
    console.log(payload);
  };

  const handleEdit = () => {
    setIsDisabled((prev) => !prev);
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Admin Profile
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="firstName"
            control={form.control}
            labelText="First Name"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="lastName"
            control={form.control}
            labelText="Last Name"
            placeholder="Enter here"
            disabled={isDisabled}
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="address"
            control={form.control}
            labelText="Address"
            type="text"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="email"
            control={form.control}
            labelText="Email"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            type="text"
            name="phoneNumber"
            control={form.control}
            labelText="Phone number"
            placeholder="Enter here"
            disabled={isDisabled}
          />

          <FieldSelect
            bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="role"
            control={form.control}
            options={orgStatus}
            labelText="Role"
            placeholder="Select"
          />
          <FieldBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="company"
            control={form.control}
            labelText="Company"
            type="text"
            placeholder="Enter here"
          />

          <div className="flex items-center gap-7">
            {/* <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full">
                  Edit <Edit size={20} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white flex flex-col items-center text-center">
                <AlertDialogHeader className="flex flex-col items-center">
                  <CheckCircle2 className="size-[100px] fill-[#3FA907] text-white" />
                  <AlertDialogTitle className="font-medium text-[#3FA907] text-4xl">
                    Success
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-normal text-base text-[#737373]">
                    You have successfully saved changes
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction className="h-[60px] w-[291px] bg-[#3FA907] text-white font-medium text-base">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog> */}

            {isDisabled ? (
              <Button
                onClick={handleEdit}
                type="button"
                className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full"
              >
                Edit <Edit size={20} />
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full"
              >
                <span className="flex items-center gap-2">
                  Save
                  <Check size={20} />
                </span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="h-[60px] border border-[#EC0909] text-base font-normal text-[#D40808] rounded w-full"
            >
              Delete <Trash2 size={24} />
            </Button>
          </div>
        </div>
      </FormComposer>
    </>
  );
}
