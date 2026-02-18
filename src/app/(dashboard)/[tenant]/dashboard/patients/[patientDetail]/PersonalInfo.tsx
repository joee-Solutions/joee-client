import EmergencyContact from "@/components/Org/Patients/PersonalInformation/EmergencyContact";
import ChildrenInformation from "@/components/Org/Patients/PersonalInformation/ChildrenInformation";
// import PatientStepper from "@/components/Org/Patients/PatientStepper";
import Additionaldemographics from "@/components/Org/Patients/PersonalInformation/Additionaldemographics";
import PatientDemographicsForm from "@/components/Org/Patients/PersonalInformation/PatientDemographicsForm";
import FormComposer from "@/components/shared/form/FormComposer";
import { Button } from "@/components/ui/button";
import useMultiStepForm from "@/hooks/useMultiStepForm";
import { PersonalInfoSchema, PersonalInfoSchemaType } from "@/models/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";

export default function PersonalInfo() {
  const mult = useMultiStepForm([
    <PatientDemographicsForm key="patient-demographics" />,
    <Additionaldemographics key="additional-demographics" />,
    <EmergencyContact key="emergency-contact" />,
    <ChildrenInformation key="children-information" />,
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
      {/* Pagination component removed - MultiStepPagination not found */}
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          onClick={mult.handlePrevious}
          disabled={mult.isFirstStep}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={mult.handleNext}
          disabled={mult.isLastStep}
        >
          Next
        </Button>
      </div>
    </>
  );
}
