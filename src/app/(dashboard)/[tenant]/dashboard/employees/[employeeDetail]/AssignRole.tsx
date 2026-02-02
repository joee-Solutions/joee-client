import FieldBox from "@/components/shared/form/FieldBox";
import FieldCheckbox from "@/components/shared/form/FieldCheckBox";
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

const AssignRoleSchema = z.object({
  departments: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  employees: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  patients: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  appointments: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  medicalNotes: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  medicalRecords: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  schedules: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  notifications: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
  backupRestore: z.object({
    read: z.boolean(),
    edit: z.boolean(),
    create: z.boolean(),
    delete: z.boolean(),
  }),
});

type AssignRoleSchemaType = z.infer<typeof AssignRoleSchema>;

const orgStatus = ["Active", "Inactive"];

export default function AssignRolePage() {
  const form = useForm<AssignRoleSchemaType>({
    resolver: zodResolver(AssignRoleSchema),
    mode: "onChange",
  });

  const onSubmit = (payload: AssignRoleSchemaType) => {
    console.log(payload);
  };

  return (
    <>
      <h2 className="font-bold text-base text-black mb-[30px]">
        Personal Information
      </h2>
      <FormComposer form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999] self-end">
              Departments
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="departments.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="departments.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="departments.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="departments.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999] self-end">
              Employees
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="employees.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="employees.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="employees.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="employees.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999] self-end">
              Patients
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="patients.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="patients.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="patients.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="patients.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999]  self-end">
              Appointments
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="appointments.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="appointments.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="appointments.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="appointments.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999]  self-end">
              Medical notes
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="medicalNotes.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="medicalNotes.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="medicalNotes.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="medicalNotes.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999]  self-end">
              Medical records
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="medicalRecords.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="medicalRecords.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="medicalRecords.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="medicalRecords.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999]  self-end">
              Schedules
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="schedules.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="schedules.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="schedules.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="schedules.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999]  self-end">
              Notifications
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="notifications.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="notifications.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="notifications.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="notifications.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          <div className="grid grid-cols-[201px_1fr] gap-5 border-b border-[#D9D9D9] pb-4">
            <p className="font-medium text-sm text-[#999999]  self-end">
              Backup Restore
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,_1fr))]">
              <FieldCheckbox
                name="backupRestore.read"
                control={form.control}
                labelText="Read"
              />
              <FieldCheckbox
                name="backupRestore.edit"
                control={form.control}
                labelText="Edit"
              />
              <FieldCheckbox
                name="backupRestore.create"
                control={form.control}
                labelText="Create"
              />
              <FieldCheckbox
                name="backupRestore.delete"
                control={form.control}
                labelText="Delete"
              />
            </div>
          </div>
          {/* <Button
            variant="outline"
            className="h-[60px] border border-[#EC0909] text-base font-normal text-[#D40808] rounded w-full"
          >
            Submit
          </Button> */}
        </div>
      </FormComposer>
    </>
  );
}
