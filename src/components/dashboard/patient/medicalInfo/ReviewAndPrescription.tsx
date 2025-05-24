import FieldBox from "@/components/shared/form/FieldBox";
import { ReviewAndPrescriptionSchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function ReviewAndPrescription() {
  const form = useFormContext<z.infer<typeof ReviewAndPrescriptionSchema>>();
  return (
    <>
      <h2 className="font-medium text-xl text-black mt-5">Review of System</h2>
      <div className="grid gap-5 mt-4">
        <FieldBox
          control={form.control}
          name="review.genitourinary"
          labelText="Genitourinary"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Urinary Frequency"
        />
        <FieldBox
          control={form.control}
          name="review.musculoskeletal"
          labelText="Musculoskeletal"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="None"
        />
        <FieldBox
          control={form.control}
          name="review.neurological"
          labelText="Neurological"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="None"
        />
        <FieldBox
          control={form.control}
          name="review.psychiatric"
          labelText="Psychiatric"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
      </div>
      <h2 className="font-medium text-xl text-black mt-[50px] mb-[15px]">
        Additional Review of System
      </h2>
      <div className="grid gap-5">
        <FieldBox
          control={form.control}
          name="additionalReview.endocrine"
          labelText="Endocrine"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Heat/Cold Intolerance"
        />
        <FieldBox
          control={form.control}
          name="additionalReview.immunologicAllergy"
          labelText="Allergic Immunologice"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Frequent reactions"
        />
        <FieldBox
          control={form.control}
          name="additionalReview.haematologic"
          labelText="Haematologic/Lymphatic"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="none"
        />
      </div>
      <h2 className="font-medium text-xl text-black mt-[50px] mb-[15px]">
        Prescriptions
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,_1fr))] gap-5 mb-5">
        <FieldBox
          control={form.control}
          name="prescription.startDate"
          labelText="Start date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="prescription.endDate"
          labelText="End date"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
      </div>
      <div className="grid gap-5 mb-[50px]">
        <FieldBox
          control={form.control}
          name="prescription.dosage"
          labelText="Dosage"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="prescription.directions"
          labelText="Directions"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="prescription.note"
          labelText="Height (cm/in)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="164 cm"
        />
      </div>
    </>
  );
}
