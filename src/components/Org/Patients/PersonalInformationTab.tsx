import React from "react";
import { AccordionSection } from "@/components/ui/AccordionSection";
import PatientDemographicsForm from "@/components/Org/Patients/PersonalInformation/PatientDemographicsForm";
import AdditionalDemographics from "@/components/Org/Patients/PersonalInformation/Additionaldemographics";
import ChildrenInformation from "@/components/Org/Patients/PersonalInformation/ChildrenInformation";
import EmergencyContact from "@/components/Org/Patients/PersonalInformation/EmergencyContact";
import { Button } from "@/components/ui/button";

export default function PersonalInformationTab(): React.ReactElement {

  return (
    <div>
      <AccordionSection title="Patient Demographics">
        <PatientDemographicsForm />
      </AccordionSection>

      <AccordionSection title="Add Patient Demographics">
        <AdditionalDemographics />
      </AccordionSection>

      <AccordionSection title="Children Patient Information (for children under 18)">
        <ChildrenInformation />
      </AccordionSection>

      <AccordionSection title="Emergency Contact Information">
        <EmergencyContact />
      </AccordionSection>
    </div>
  );
}
