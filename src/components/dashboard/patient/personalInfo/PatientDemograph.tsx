import FieldBox from "@/components/shared/form/FieldBox";
import { PatientDemographySchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function PatientDemograph() {
  const form = useFormContext<z.infer<typeof PatientDemographySchema>>();
  return (
    <>
      <h2 className="font-medium text-base text-[#595959] mt-5">
        Patient Demographics
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,_1fr))] gap-5 mb-10 mt-4  ">
        <FieldBox
          control={form.control}
          name="suffix"
          labelText="Suffix"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Mrs"
        />
        <FieldBox
          control={form.control}
          name="firstName"
          labelText="First name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Janet"
        />
        <FieldBox
          control={form.control}
          name="middleName"
          labelText="Middle name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Esther"
        />
        <FieldBox
          control={form.control}
          name="lastName"
          labelText="Last name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="John"
        />
        <FieldBox
          control={form.control}
          name="prefferedName"
          labelText="Preferred name"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Esther"
        />
        <FieldBox
          control={form.control}
          name="medicalRecordNumber"
          labelText="Medical Record Number"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="J12345"
        />
        <FieldBox
          control={form.control}
          name="gender"
          labelText="Sex"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Female"
        />
        <FieldBox
          control={form.control}
          name="dob"
          labelText="Date of Birth"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="19-05-1990"
        />
        <FieldBox
          control={form.control}
          name="maritalStatus"
          labelText="Marital Status"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Daniel"
        />
        <FieldBox
          control={form.control}
          name="race"
          labelText="Race"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="White"
        />
        <FieldBox
          control={form.control}
          name="ethnicity"
          labelText="Ethnicity"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Red Indian"
        />
        <FieldBox
          control={form.control}
          name="preferredLanguage"
          labelText="Preferred Language"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="English"
        />
        <FieldBox
          control={form.control}
          name="interpreterRequired"
          labelText="Interpreter required"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="No"
        />
        <FieldBox
          control={form.control}
          name="religion"
          labelText="Religion"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Christianity"
        />
        <FieldBox
          control={form.control}
          name="genderIdentity"
          labelText="Gender Identity"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Daniel"
        />
        <FieldBox
          control={form.control}
          name="sexualOrientation"
          labelText="Sexual Orientation"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Heterosexual"
        />
      </div>
    </>
  );
}
