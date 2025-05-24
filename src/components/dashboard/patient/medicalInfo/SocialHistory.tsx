import FieldBox from "@/components/shared/form/FieldBox";
import { SocialHistorySchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function SocialHistory() {
  const form = useFormContext<z.infer<typeof SocialHistorySchema>>();
  return (
    <>
      <h2 className="font-medium text-xl text-black mt-5">Social History</h2>
      <div className="grid gap-5 mt-4">
        <FieldBox
          control={form.control}
          name="socialHistory.tobaccoUsage"
          labelText="Tobacco Use"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="socialHistory.alcoholUsage"
          labelText="Alcohol Use"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="socialHistory.illicitDrugs"
          labelText="Illicit Drugs"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="socialHistory.dietAndExercise"
          labelText="Diet & Exercise"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
        />
        <FieldBox
          control={form.control}
          name="sexualHistory.numOfPartners"
          labelText="Sexual History: Number of Partners"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="10"
        />
        <FieldBox
          control={form.control}
          name="sexualHistory.protectionUsage"
          labelText="Sexual History: Protection used"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="yes"
        />
      </div>
      <h2 className="font-medium text-xl text-black mt-[50px] mb-[15px]">
        Vitals
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,_1fr))] gap-5">
        <FieldBox
          control={form.control}
          name="vitals.temperature"
          labelText="Temperature (°F/°C)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="36°C"
        />
        <FieldBox
          control={form.control}
          name="vitals.heartRate"
          labelText="Heart rate (Pulse); Beats per minute"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="16"
        />
        <FieldBox
          control={form.control}
          name="vitals.systolicBloodPressure"
          labelText="Blood pressure Systolic (mmHg)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="120mmHg"
        />
        <FieldBox
          control={form.control}
          name="vitals.diastolicBloodPressure"
          labelText="Blood pressure Diastolic (mmHg)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="80mmHg"
        />
        <FieldBox
          control={form.control}
          name="vitals.respiratoryRate"
          labelText="Respiratory  rate; Beats per minute"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="24"
        />
        <FieldBox
          control={form.control}
          name="vitals.oxygenSaturation"
          labelText="Oxygen Saturation(%)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="60%"
        />
        <FieldBox
          control={form.control}
          name="vitals.glucose"
          labelText="Glucose"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="60%"
        />
        <FieldBox
          control={form.control}
          name="vitals.height"
          labelText="Height (cm/in)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="164 cm"
        />
        <FieldBox
          control={form.control}
          name="vitals.weight"
          labelText="Weight(lbs/kg)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="140 lbs"
        />
        <FieldBox
          control={form.control}
          name="vitals.painScore"
          labelText="Pain score (0-10)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="6"
        />
      </div>
      <div className="mb-10 mt-5">
        <FieldBox
          control={form.control}
          name="vitals.bmi"
          labelText="Body Mass Index(BMI) calculated/recorded"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="16"
        />
      </div>
    </>
  );
}
