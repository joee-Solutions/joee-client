import FieldBox from "@/components/shared/form/FieldBox";
import { PatientEmergencyInfoSchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function EmergencyInfo() {
  const form = useFormContext<z.infer<typeof PatientEmergencyInfoSchema>>();
  return (
    <>
      <h2 className="font-medium text-base text-[#595959] mt-5">
        Emergency Contact Information
      </h2>
      <div className="grid gap-[30px] mt-4 mb-[40px]">
        <FieldBox
          control={form.control}
          name="name"
          labelText="Emergency Contact Name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="John Jeremy Sanders "
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
          name="permissionToContact"
          labelText="Permission to Contact Emergency contact "
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Yes"
        />
      </div>
    </>
  );
}
