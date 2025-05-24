import FieldBox from "@/components/shared/form/FieldBox";
import { PatientGuardianSchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function GuardianInfo() {
  const form = useFormContext<z.infer<typeof PatientGuardianSchema>>();
  return (
    <>
      <h2 className="font-medium text-base text-[#595959] mt-5">
        Guardian Information
      </h2>
      <div className="grid gap-[30px] mt-4 mb-[40px]">
        <FieldBox
          control={form.control}
          name="name"
          labelText="Guardian Full name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="John Jeremy Sanders "
        />
        <FieldBox
          control={form.control}
          name="gender"
          labelText="Sex"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Male"
        />
        <FieldBox
          control={form.control}
          name="relationship"
          labelText="Relationship"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Husband"
        />
        <FieldBox
          control={form.control}
          name="phoneNumber"
          labelText="Emergency Contact Phone number"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="+234-0987-654-321"
        />
        <FieldBox
          control={form.control}
          name="email"
          labelText="Emergency Contact Email"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="jeremysanders12@gmail.com"
        />
      </div>
    </>
  );
}
