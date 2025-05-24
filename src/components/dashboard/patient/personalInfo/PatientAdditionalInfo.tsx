import FieldBox from "@/components/shared/form/FieldBox";
import FieldTextBox from "@/components/shared/form/FieldTextBox";
import { PatientAdditionalInfoSchema } from "@/models/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export default function PatientAdditionalInfo() {
  const form = useFormContext<z.infer<typeof PatientAdditionalInfoSchema>>();
  return (
    <>
      <h2 className="font-medium text-base text-[#595959] mt-5">
        Additional Patient Demographics
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,_1fr))] gap-[30px] mt-4">
        <FieldBox
          control={form.control}
          name="country"
          labelText="Country"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="United state of America"
        />
        <FieldBox
          control={form.control}
          name="city"
          labelText="City"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="New York"
        />
        <FieldBox
          control={form.control}
          name="email"
          labelText="Email"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="johnjesther90@gmail.com"
        />
        <FieldBox
          control={form.control}
          name="workEmail"
          labelText="Email (Work)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="johnjesther90@gmail.com"
        />
        <FieldBox
          control={form.control}
          name="phone.home"
          labelText="Phone (Home)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="+234-123-4567-890"
        />
        <FieldBox
          control={form.control}
          name="phone.mobile"
          labelText="Phone (Mobile)"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="19-05-1990"
        />
      </div>
      <div className="my-5">
        <FieldBox
          control={form.control}
          name="address"
          labelText="Address"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Block 15, Carrington street, New York "
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,_1fr))] gap-[30px] mb-[30px]">
        <FieldBox
          control={form.control}
          name="methodOfContact"
          labelText="Preferred Method of Contact"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Email"
        />
        <FieldBox
          control={form.control}
          name="currentLivingSituation"
          labelText="Current Living Situation"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Tenant"
        />
        <FieldBox
          control={form.control}
          name="referral"
          labelText="Referral Source"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="None"
        />
        <FieldBox
          control={form.control}
          name="occupationStatus"
          labelText="Occupation Status"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Employed"
        />
        <FieldBox
          control={form.control}
          name="industry"
          labelText="Industry"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="Daniel"
        />
        <FieldBox
          control={form.control}
          name="householdSize"
          labelText="Household Size"
          type="text"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="50-100 Employees"
        />
      </div>
      <div className="mb-[60px]">
        <FieldTextBox
          control={form.control}
          name="notes"
          labelText="Notes"
          bgInputClass="bg-[#D9EDFF]"
          placeholder="John Janet Esther hopes to make  our hospital her family hospital....."
        />
      </div>
    </>
  );
}
