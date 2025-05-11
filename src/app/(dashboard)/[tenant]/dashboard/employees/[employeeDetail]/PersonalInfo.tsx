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

const PersonalInfoSchema = z.object({
  firstName: z.string({ required_error: "This field is required" }),
  lastName: z.string({ required_error: "This field is required" }),
  email: z
    .string({ required_error: "This field is required" })
    .email("Invalid email address"),
  phoneNumber: z.string({ required_error: "This field is required" }),
  address: z.string({ required_error: "This field is required" }),
  state: z.string({ required_error: "This field is required" }),
  dob: z.string({ required_error: "This field is required" }),
  specialty: z.string({ required_error: "This field is required" }),
  designation: z.string({ required_error: "This field is required" }),
  department: z.string({ required_error: "This field is required" }),
  gender: z.string({ required_error: "This field is required" }),
  hireDate: z.string({ required_error: "This field is required" }),
  bio: z.string({ required_error: "This field is required" }),
});

type PersonalInfoSchemaType = z.infer<typeof PersonalInfoSchema>;

const orgStatus = ["Active", "Inactive", "Deactivate"];

export default function PersonalInfo() {
  const form = useForm<PersonalInfoSchemaType>({
    resolver: zodResolver(PersonalInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      designation: "",
      department: "",
      state: "",
      phoneNumber: "",
      gender: "",
      dob: "",
      bio: "",
      hireDate: "",
      specialty: "",
    },
  });

  const onSubmit = (payload: PersonalInfoSchemaType) => {
    console.log(payload);
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Personal Information
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-[30px]">
          <FieldTextBox
            bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
            name="bio"
            control={form.control}
            labelText="Short Description"
            placeholder="Enter here"
          />
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              name="firstName"
              control={form.control}
              labelText="First Name"
              type="text"
              placeholder="Enter here"
            />
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              name="lastName"
              control={form.control}
              labelText="Last Name"
              type="text"
              placeholder="Enter here"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="address"
              control={form.control}
              labelText="Address"
              placeholder="Enter here"
            />

            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="state"
              control={form.control}
              labelText="Region/State"
              placeholder="Enter here"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="date"
              name="dob"
              control={form.control}
              labelText="Date of Birth"
              placeholder="Enter here"
            />

            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="department"
              control={form.control}
              labelText="Department"
              placeholder="Enter here"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="designation"
              control={form.control}
              labelText="Designation "
              placeholder="Enter here"
            />

            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="specialty"
              control={form.control}
              labelText="Specialty "
              placeholder="Enter here"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <FieldSelect
              bgSelectClass="bg-[#D9EDFF] border-[#D9EDFF]"
              name="gender"
              control={form.control}
              options={[]}
              labelText="Gender"
              placeholder="Select"
            />
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="email"
              control={form.control}
              labelText="Email"
              placeholder="Enter here"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="text"
              name="phoneNumber"
              control={form.control}
              labelText="Phone number"
              placeholder="Enter here"
            />
            <FieldBox
              bgInputClass="bg-[#D9EDFF] border-[#D9EDFF]"
              type="date"
              name="hireDate"
              control={form.control}
              labelText="Hire date"
              placeholder="Enter here"
            />
          </div>

          <div className="flex items-center gap-7">
            <AlertDialog>
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
            </AlertDialog>

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
