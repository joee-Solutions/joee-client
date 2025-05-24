import FieldBox from "@/components/shared/form/FieldBox";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import { MedicalStatusAlergySchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function MedicalStatusAlergy() {
  const form = useFormContext<z.infer<typeof MedicalStatusAlergySchema>>();
  return (
    <>
      <h2 className="font-medium text-base text-[#595959] mt-5">
        Patient Status
      </h2>
      <div className="grid gap-[30px] mt-4">
        <FieldBox
          control={form.control}
          name="patientStatus"
          labelText="Status"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Discharged"
        />
        <FieldBox
          control={form.control}
          name="dischargeDate"
          labelText="Discharge date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="12-03-2022"
        />
        <FieldTextBox
          control={form.control}
          name="dischargeReason"
          labelText="Reason for Discharge"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Test were completed and approved by her doctor to be discharged at once. "
        />
      </div>
      <h2 className="font-medium text-base text-[#595959] mt-[50px] mb-[15px]">
        Allergy
      </h2>
      <div className="grid gap-[30px] mt-4 mb-[30px]">
        <FieldBox
          control={form.control}
          name="allergy.name"
          labelText="Allergy"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Groundnut"
        />
        <FieldBox
          control={form.control}
          name="allergy.startDate"
          labelText="Start date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="11-02-2001"
        />
        <FieldBox
          control={form.control}
          name="allergy.endDate"
          labelText="End date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Till date"
        />
        <FieldBox
          control={form.control}
          name="allergy.reaction"
          labelText="Reactions"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="rashes"
        />
        <FieldTextBox
          control={form.control}
          name="allergy.comment"
          labelText="Comments"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Very dangerous"
        />
      </div>
    </>
  );
}
