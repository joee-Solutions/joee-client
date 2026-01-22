import EmergencyInfo from "@/components/dashboard/patient/personalInfo/EmergencyInfo";
import GuardianInfo from "@/components/dashboard/patient/personalInfo/GuardianInfo";
import MultiStepPagination from "@/components/dashboard/patient/MultiStepPagination";
import PatientAdditionalInfo from "@/components/dashboard/patient/personalInfo/PatientAdditionalInfo";
import PatientDemograph from "@/components/dashboard/patient/personalInfo/PatientDemograph";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import useMultiStepForm from "@/hooks/useMultiStepForm";
import { PersonalInfoSchema, PersonalInfoSchemaType } from "@/models/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";

export default function PersonalInfo() {
  const mult = useMultiStepForm([
    <PatientDemograph key="patient-demograph" />,
    <PatientAdditionalInfo key="patient-additional-info" />,
    <EmergencyInfo key="emergency-info" />,
    <GuardianInfo key="guardian-info" />,
  ]);

  const form = useForm<PersonalInfoSchemaType>({
    resolver: zodResolver(PersonalInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      dob: "",
      ethnicity: "",
      gender: "",
      genderIdentity: "",
      interpreterRequired: "",
      maritalStatus: "",
      medicalRecordNumber: "",
      middleName: "",
      preferredLanguage: "",
      prefferedName: "",
      race: "",
      religion: "",
      sexualOrientation: "",
      suffix: "",
    },
  });

  const onSubmit = (payload: PersonalInfoSchemaType) => {
    console.log(payload);
  };

  return (
    <>
      <div className="flex justify-between gap-10">
        <h2 className="font-bold text-base text-black mb-[30px]">
          Personal Information
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
