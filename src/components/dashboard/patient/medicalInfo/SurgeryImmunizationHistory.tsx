import FieldBox from "@/components/shared/form/FieldBox";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import { SurgeryImmunizationHistorySchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function SurgeryImmunizationHistory() {
  const form =
    useFormContext<z.infer<typeof SurgeryImmunizationHistorySchema>>();
  return (
    <>
      <h2 className="font-medium text-xl text-black mt-5">
        Surgery/Procedures
      </h2>
      <div className="grid gap-5 mt-4">
        <FieldBox
          control={form.control}
          name="surgeryHistory.type"
          labelText="Surgery history"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="surgeryHistory.date"
          labelText="Date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="12-03-2022"
        />
        <FieldTextBox
          control={form.control}
          name="surgeryHistory.additionalInformation"
          labelText="Additional Information"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Need urgent attention"
        />
      </div>
      <h2 className="font-medium text-xl text-black mt-[50px] mb-[15px]">
        Immunization History
      </h2>
      <div className="grid gap-5">
        <FieldBox
          control={form.control}
          name="immunizationHistory.type"
          labelText="Immunizationtype"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="immunizationHistory.date"
          labelText="Date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="11-02-2001"
        />

        <FieldTextBox
          control={form.control}
          name="immunizationHistory.additionalInformation"
          labelText="Additional Information"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="The patient is in good condition"
        />
      </div>
      <h2 className="font-medium text-xl text-black mt-[50px]">
        Family History
      </h2>
      <div className="grid gap-5 mt-4 mb-[30px]">
        <FieldBox
          control={form.control}
          name="familyHistory.relative"
          labelText="Relative"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="familyHistory.condition"
          labelText="Conditions"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="familyHistory.diagnosisAge"
          labelText="Age of Diagnosis"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="familyHistory.currentAge"
          labelText="Current Age"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
      </div>
    </>
  );
}
