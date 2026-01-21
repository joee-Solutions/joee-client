"use client";

import { Button } from "@/components/ui/button";
import { CircleArrowLeft, CircleCheck } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import userProfileImage from "./../../../../../../../../public/assets/doctorMale.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MedicalRecordSchema, MedicalRecordSchemaType } from "@/models/form";
import FormComposer from "@/components/shared/form/FormComposer";
import FieldBox from "@/components/shared/form/FieldBox";
import FieldDateTimePicker from "@/components/shared/form/FieldDateTime";
import FieldSelect from "@/components/shared/form/FieldSelect";

export default function NewMedicalRecord() {
  const form = useForm<MedicalRecordSchemaType>({
    resolver: zodResolver(MedicalRecordSchema),
    mode: "onChange",
    defaultValues: {
      attachment: undefined,
      date: undefined,
      doctor: "",
      complaint: "",
      diagnosis: "",
      vitalSign: "",
      treatment: [""],
      prescription: [
        { dosage: "", drugName: "", instruction: "", quantity: "" },
      ],
    },
  });

  const path = usePathname().split("/");
  const router = useRouter();
  const userName = path[path.length - 2].replace("-", " ");

  const onSubmit = (payload: MedicalRecordSchemaType) => {
    console.log(payload);
  };

  return (
    <section className="py-10 px-5">
      <div className="flex flex-col gap-[30px]">
        <div>
          <Button
            onClick={() => router.back()}
            className="font-semibold text-2xl text-black gap-1 p-0"
          >
            <CircleArrowLeft className="fill-[#003465] text-white size-[39px]" />
            New Medical Record
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[398px_1fr] gap-5">
          <aside className="pb-[30px] px-[54px] pt-[34px] shadow-[0px_0px_4px_1px_#0000004D] h-max rounded-md">
            <div className="flex flex-col gap-[15px] items-center">
              <Image
                src={userProfileImage}
                alt="user profile picture"
                width={180}
                height={180}
                className="rounded-full object-cover"
              />
              <div className="text-center">
                <p className="font-semibold text-2xl text-black">{userName}</p>
                <p className="text-xs font-normal text-[#999999] mt-1">
                  Dentist
                </p>
                <p className="text-xs font-medium text-[#595959] mt-1">
                  +234-123-4567-890
                </p>
              </div>
              <span className="bg-[#E6EBF0] h-[30px] w-[76px] rounded-[20px] font-medium text-xs text-[#4E66A8] flex items-center justify-center">
                36 years
              </span>
            </div>
          </aside>
          <div className="px-[25px] pt-[32px] pb-[56px] shadow-[0px_0px_4px_1px_#0000004D] rounded-md overflow-hidden">
            <FormComposer form={form} onSubmit={onSubmit}>
              <div className="grid gap-[30px] mb-10">
                <FieldDateTimePicker
                  control={form.control}
                  labelText="Date"
                  name="date"
                />
                <FieldSelect
                  control={form.control}
                  name="doctor"
                  labelText="Doctor"
                  options={["Doc 2"]}
                />
              </div>
              <Button className="font-medium text-base text-white bg-[#003465]">
                Save <CircleCheck size={16} />
              </Button>
            </FormComposer>
          </div>
        </div>
      </div>
    </section>
  );
}
