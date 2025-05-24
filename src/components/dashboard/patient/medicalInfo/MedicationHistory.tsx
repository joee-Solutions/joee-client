import FieldBox from "@/components/shared/form/FieldBox";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import { MedicationHistorySchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function MedicationHistory() {
  const form = useFormContext<z.infer<typeof MedicationHistorySchema>>();
  return (
    <>
      <h2 className="font-medium text-base text-[#595959] mt-5">
        Medical History
      </h2>
      <div className="grid gap-[30px] mt-4">
        <FieldBox
          control={form.control}
          name="medical.medicalCondition"
          labelText="Medical Condition"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Throbbing headache"
        />
        <FieldBox
          control={form.control}
          name="medical.startDate"
          labelText="Start date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="12-03-2022"
        />
        <FieldBox
          control={form.control}
          name="medical.endDate"
          labelText="End date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="12-03-2022"
        />
        <FieldTextBox
          control={form.control}
          name="medical.comment"
          labelText="Comments"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Need urgent attention"
        />
      </div>
      <h2 className="font-medium text-base text-[#595959] mt-[50px] mb-[15px]">
        Medication History
      </h2>
      <div className="grid gap-[30px] mt-4 mb-[30px]">
        <FieldBox
          control={form.control}
          name="medication.medicationHistory"
          labelText="Medication history"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="None"
        />
        <FieldBox
          control={form.control}
          name="medication.startDate"
          labelText="Start date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="11-02-2001"
        />
        <FieldBox
          control={form.control}
          name="medication.endDate"
          labelText="End date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Till date"
        />
        <FieldBox
          control={form.control}
          name="medication.dosage"
          labelText="Dosage"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="medication.frequency"
          labelText="Frequency"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="medication.route"
          labelText="Route"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="medication.prescriberName"
          labelText="Prescriber’s name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldTextBox
          control={form.control}
          name="medication.comment"
          labelText="Comments"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Needs to take precaution"
        />
      </div>
    </>
  );
}
