import MedicalStatusAlergy from "@/components/dashboard/patient/medicalInfo/MedicalStatusAlergy";
import MedicationHistory from "@/components/dashboard/patient/medicalInfo/MedicationHistory";
import ReviewAndPrescription from "@/components/dashboard/patient/medicalInfo/ReviewAndPrescription";
import SocialHistory from "@/components/dashboard/patient/medicalInfo/SocialHistory";
import SurgeryImmunizationHistory from "@/components/dashboard/patient/medicalInfo/SurgeryImmunizationHistory";
import Visit from "@/components/dashboard/patient/medicalInfo/Visit";
import MultiStepPagination from "@/components/dashboard/patient/MultiStepPagination";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import useMultiStepForm from "@/hooks/useMultiStepForm";
import { MedicalInfoSchema, MedicalInfoSchemaType } from "@/models/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";

export default function MedicalInfo() {
  const mult = useMultiStepForm([
    <MedicalStatusAlergy key="medical-status-allergy" />,
    <MedicationHistory key="medication-history" />,
    <SurgeryImmunizationHistory key="surgery-immunization-history" />,
    <SocialHistory key="social-history" />,
    <ReviewAndPrescription key="review-and-prescription" />,
    // <Visit />,
  ]);

  const form = useForm<MedicalInfoSchemaType>({
    resolver: zodResolver(MedicalInfoSchema),
    mode: "onChange",
    defaultValues: {
      patientStatus: "",
      dischargeDate: "",
      dischargeReason: "",
      allergy: {
        name: "",
        startDate: "",
        endDate: "",
        reaction: "",
        comment: "",
      },
      medical: {
        medicalCondition: "",
        startDate: "",
        endDate: "",
        comment: "",
      },
      medication: {
        medicationHistory: "",
        startDate: "",
        endDate: "",
        dosage: "",
        frequency: "",
        route: "",
        prescriberName: "",
        comment: "",
      },
      surgeryHistory: { type: "", date: "", additionalInformation: "" },
      immunizationHistory: { type: "", date: "", additionalInformation: "" },
      familyHistory: {
        relative: "",
        condition: "",
        diagnosisAge: "",
        currentAge: "",
      },
      socialHistory: {
        tobaccoUsage: "",
        alcoholUsage: "",
        dietAndExercise: "",
        illicitDrugs: "",
      },
      sexualHistory: { numOfPartners: "", protectionUsage: "" },
      vitals: {
        temperature: "",
        heartRate: "",
        diastolicBloodPressure: "",
        systolicBloodPressure: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        glucose: "",
        height: "",
        weight: "",
        painScore: "",
        bmi: "",
      },
    },
  });

  const onSubmit = (payload: MedicalInfoSchemaType) => {
    console.log(payload);
  };

  return (
    <>
      <div className="flex justify-between gap-10">
        <h2 className="font-bold text-base text-black mb-[30px]">
          Medical Information
        </h2>
        <Button className="h-[50px] w-[130px] bg-[#003465] text-sm font-normal text-white rounded">
          Export <Upload size={16} />
        </Button>
      </div>
      <FormComposer form={form} onSubmit={onSubmit}>
        {mult.steps[mult.currentPos]}

        <div className="flex items-center gap-7">
          <Button className="h-[60px] bg-[#003465] text-base font-medium text-white rounded w-full">
            Edit <Edit size={20} />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-[60px] w-full border border-[#EC0909] text-[#EC0909] text-base font-medium"
          >
            Delete
            <Trash2 size={20} />
          </Button>
        </div>
      </FormComposer>
      <MultiStepPagination
        currPos={mult.currentPos}
        totalLen={mult.totalStep}
        handleGoto={mult.handleGoto}
        handleNext={mult.handleNext}
        handlePrev={mult.handlePrevious}
        isFirst={mult.isFirstStep}
        isLast={mult.isLastStep}
        numOfBtnsShown={2}
      />
    </>
  );
}
