"use client";

import FieldBox from "@/components/shared/form/FieldBox";
import FieldDateTimePicker from "@/components/shared/form/FieldDateTime";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import FieldTimePicker from "@/components/shared/form/FieldTimePicker";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AppointmentSchema = z.object({
  patientName: z.string(),
  patientId: z.string(),
  email: z.string().email(),
  department: z.string(),
  AppointmentDate: z.date(),
  AppointmentTime: z.string(),
  status: z.string(),
  description: z.string(),
});

type AppointmentSchemaType = z.infer<typeof AppointmentSchema>;

export default function AppointmentDetail() {
  const router = useRouter();
  const [isView, setIsView] = useState(true);

  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    mode: "onChange",
  });

  const onSubmit = () => {};

  useEffect(() => {
    // the values should be replaced upon getting the appointment detail from the server

    form.reset({
      patientName: "",
      patientId: "",
      department: "",
      email: "",
      AppointmentDate: undefined,
      AppointmentTime: "",
      status: "",
      description: "",
    });
  }, []);

  return (
    <section className="py-10 px-20">
      <h2 className="font-semibold text-xl text-[#003465]">
        {isView ? "View Appointment" : "Edit Appointment"}
      </h2>

      <div className="mt-[42px]">
        <FormComposer form={form} onSubmit={onSubmit}>
          <div className="grid grid-cols-[0.5fr_1fr] gap-10">
            <label className="font-medium text-lg text-black">
              Patient name:
            </label>
            <FieldBox
              type="text"
              placeholder="Enter here"
              control={form.control}
              name="patientName"
              height="h-[60px]"
              disabled={isView}
            />

            <label className="font-medium text-lg text-black">
              Patient Id:
            </label>
            <FieldBox
              type="text"
              placeholder="Enter here"
              control={form.control}
              name="patientId"
              height="h-[60px]"
              disabled={isView}
            />
            <label className="font-medium text-lg text-black">Email:</label>
            <FieldBox
              type="email"
              placeholder="Enter here"
              control={form.control}
              name="email"
              height="h-[60px]"
              disabled={isView}
            />
            <label className="font-medium text-lg text-black">
              Department:
            </label>
            <FieldBox
              type="text"
              placeholder="Enter here"
              control={form.control}
              name="department"
              height="h-[60px]"
              disabled={isView}
            />
            <label className="font-medium text-lg text-black">
              Appointment Date:
            </label>
            <FieldDateTimePicker
              control={form.control}
              name="AppointmentDate"
            />

            <label className="font-medium text-lg text-black">
              Appointment Time:
            </label>
            <FieldTimePicker control={form.control} name="AppointmentTime" />

            <label className="font-medium text-lg text-black">Status:</label>
            <FieldBox
              type="text"
              placeholder="Enter here"
              control={form.control}
              name="status"
              height="h-[60px]"
              disabled={isView}
            />

            <label className="font-medium text-lg text-black">
              Appointment Description:
            </label>
            <FieldTextBox
              placeholder="Enter here"
              control={form.control}
              name="description"
              disabled={isView}
            />
          </div>
          <div className="mt-10 flex items-center flex-wrap gap-[10px]">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="h-[60px] w-[200px] border border-[#EC0909] text-[#EC0909] text-base font-medium flex-1"
            >
              Cancel
            </Button>
            {isView ? (
              <Button
                type="button"
                onClick={() => setIsView(false)}
                variant="outline"
                className="h-[60px] w-[200px] text-base font-medium bg-[#003465] hover:bg-[#003465]/90 text-white flex-1"
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-[60px] w-[200px] text-base font-medium bg-[#003465] hover:bg-[#003465]/90 text-white flex-1"
              >
                Submit
              </Button>
            )}
          </div>
        </FormComposer>
      </div>
    </section>
  );
}
