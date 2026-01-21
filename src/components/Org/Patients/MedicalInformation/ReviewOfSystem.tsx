import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";

// Define the type for form data
type FormData = {
  [key: string]: boolean | string;
};

export default function MedicalSymptomForm() {
  const [formData, setFormData] = useState<FormData>({
    // Genitourinary
    urinaryFrequency: false,
    dysuria: false,
    incontinence: false,
    genitourinaryDetails: "",

    // Musculoskeletal
    jointPain: false,
    muscleWeakness: false,
    stiffness: false,
    musculoskeletalDetails: "",

    // Neurological
    headaches: false,
    dizziness: false,
    numbnessWeakness: false,
    seizures: false,
    neurologicalDetails: "",

    // Psychiatric
    depression: false,
    anxiety: false,
    sleepingDisturbances: false,
    psychiatricDetails: "",

    // Endocrine
    heatColdIntolerance: false,
    excessiveThirstHunger: false,
    endocrineDetails: "",

    // Haematologic/Lymphatic
    easyBruising: false,
    bleedingTendencies: false,
    haematologicDetails: "",

    // Allergic/Immunologic
    frequentInfections: false,
    allergicReactions: false,
    allergicDetails: "",
  });

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleTextChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const SymptomSection = ({
    title,
    checkboxes,
    detailsName,
  }: {
    title: string;
    checkboxes: { name: string; label: string }[];
    detailsName: string;
  }) => (
    <div className="mx-auto p-6">
      <h3 className="font-medium text-gray-800 mb-4">{title}:</h3>
      <div className="flex flex-wrap gap-8 mb-4">
        {checkboxes.map(({ name, label }) => (
          <label key={name} className="flex items-center space-x-2 ">
            <Checkbox
            className="accent-green-600 w-6 h-6 rounded"
              checked={!!formData[name]}
              onCheckedChange={(checked) =>
                handleCheckboxChange(name, !!checked)
              }
            />
            <span className="text-gray-700">{label}</span>
          </label>
        ))}
      </div>
      <div>
        <p className="text-gray-700 mb-2">Details</p>
        <Textarea
          name={detailsName}
          className="w-full h-32 p-3 border border-[#737373] rounded"
          value={formData[detailsName] as string}
          onChange={(e) => handleTextChange(detailsName, e.target.value)}
        />
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // Handle form submission logic here
  };

  return (
    <div className=" mb-8">
      <form onSubmit={handleSubmit}>
        <SymptomSection
          title="Genitourinary"
          checkboxes={[
            { name: "urinaryFrequency", label: "Urinary frequency" },
            { name: "dysuria", label: "Dysuria" },
            { name: "incontinence", label: "Incontinence" },
          ]}
          detailsName="genitourinaryDetails"
        />

        <SymptomSection
          title="Musculoskeletal"
          checkboxes={[
            { name: "jointPain", label: "Joint pain" },
            { name: "muscleWeakness", label: "Muscle Weakness" },
            { name: "stiffness", label: "Stiffness" },
          ]}
          detailsName="musculoskeletalDetails"
        />

        <SymptomSection
          title="Neurological"
          checkboxes={[
            { name: "headaches", label: "Headaches" },
            { name: "dizziness", label: "Dizziness" },
            { name: "numbnessWeakness", label: "Numbness/Weakness" },
            { name: "seizures", label: "Seizures" },
          ]}
          detailsName="neurologicalDetails"
        />

        <SymptomSection
          title="Psychiatric"
          checkboxes={[
            { name: "depression", label: "Depression" },
            { name: "anxiety", label: "Anxiety" },
            { name: "sleepingDisturbances", label: "Sleeping Disturbances" },
          ]}
          detailsName="psychiatricDetails"
        />

        <SymptomSection
          title="Endocrine"
          checkboxes={[
            { name: "heatColdIntolerance", label: "Heat/Cold Intolerance" },
            { name: "excessiveThirstHunger", label: "Excessive Thirst/Hunger" },
          ]}
          detailsName="endocrineDetails"
        />

        <SymptomSection
          title="Haematologic/Lymphatic"
          checkboxes={[
            { name: "easyBruising", label: "Easy Bruising" },
            { name: "bleedingTendencies", label: "Bleeding Tendencies" },
          ]}
          detailsName="haematologicDetails"
        />

        <SymptomSection
          title="Allergic/Immunologic"
          checkboxes={[
            { name: "frequentInfections", label: "Frequent Infections" },
            { name: "allergicReactions", label: "Allergic Reactions" },
          ]}
          detailsName="allergicDetails"
        />

        <div className="mt-8">
        <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}