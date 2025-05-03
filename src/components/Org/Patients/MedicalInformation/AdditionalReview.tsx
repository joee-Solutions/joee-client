import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";

// Define types for symptoms and form state
type Symptom = {
  id: string;
  label: string;
  checked: boolean;
};

type SymptomCategoryState = {
  symptoms: Symptom[];
  details: string;
};

type FormState = {
  psychiatric: SymptomCategoryState;
  endocrine: SymptomCategoryState;
  haematologic: SymptomCategoryState;
  allergic: SymptomCategoryState;
};

const SymptomCategory = ({
  title,
  symptoms,
  details,
  onChange,
  onDetailsChange,
}: {
  title: string;
  symptoms: Symptom[];
  details: string;
  onChange: (id: string) => void;
  onDetailsChange: (value: string) => void;
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-2">{title}:</h2>
      <div className="flex flex-wrap gap-6 mb-2">
        {symptoms.map((symptom) => (
          <div key={symptom.id} className="flex items-center gap-2">
            <Checkbox
              id={symptom.id}
              checked={symptom.checked}
              onCheckedChange={() => onChange(symptom.id)}
              className="accent-green-600 w-6 h-6 rounded"
            />
            <label htmlFor={symptom.id} className="block text-base text-black font-normal mb-2">
              {symptom.label}
            </label>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-base text-black font-normal mb-2">Details</label>
        <Textarea
          value={details}
          onChange={(e) => onDetailsChange(e.target.value)}
          className="w-full h-32 p-3 border border-[#737373] rounded"
        />
      </div>
    </div>
  );
};

export default function MedicalSymptomsForm() {
  const [formState, setFormState] = useState<FormState>({
    psychiatric: {
      symptoms: [
        { id: "depression", label: "Depression", checked: false },
        { id: "anxiety", label: "Anxiety", checked: false },
        { id: "sleepingDisturbances", label: "Sleeping Disturbances", checked: false },
      ],
      details: "",
    },
    endocrine: {
      symptoms: [
        { id: "heatColdIntolerance", label: "Heat/Cold Intolerance", checked: false },
        { id: "excessiveThirstHunger", label: "Excessive Thirst/Hunger", checked: false },
      ],
      details: "",
    },
    haematologic: {
      symptoms: [
        { id: "easyBruising", label: "Easy Bruising", checked: false },
        { id: "bleedingTendencies", label: "Bleeding Tendencies", checked: false },
      ],
      details: "",
    },
    allergic: {
      symptoms: [
        { id: "frequentInfections", label: "Frequent Infections", checked: false },
        { id: "allergicReactions", label: "Allergic Reactions", checked: false },
      ],
      details: "",
    },
  });

  const handleSymptomChange = (category: keyof FormState, symptomId: string) => {
    setFormState((prev) => {
      const newSymptoms = prev[category].symptoms.map((symptom) =>
        symptom.id === symptomId ? { ...symptom, checked: !symptom.checked } : symptom
      );

      return {
        ...prev,
        [category]: {
          ...prev[category],
          symptoms: newSymptoms,
        },
      };
    });
  };

  const handleDetailsChange = (category: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        details: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formState);
    // Here you would typically send the data to your API
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto p-6 "
    >
      <SymptomCategory
        title="Psychiatric"
        symptoms={formState.psychiatric.symptoms}
        details={formState.psychiatric.details}
        onChange={(id) => handleSymptomChange("psychiatric", id)}
        onDetailsChange={(value) => handleDetailsChange("psychiatric", value)}
      />

      <SymptomCategory
        title="Endocrine"
        symptoms={formState.endocrine.symptoms}
        details={formState.endocrine.details}
        onChange={(id) => handleSymptomChange("endocrine", id)}
        onDetailsChange={(value) => handleDetailsChange("endocrine", value)}
      />

      <SymptomCategory
        title="Haematologic/Lymphatic"
        symptoms={formState.haematologic.symptoms}
        details={formState.haematologic.details}
        onChange={(id) => handleSymptomChange("haematologic", id)}
        onDetailsChange={(value) => handleDetailsChange("haematologic", value)}
      />

      <SymptomCategory
        title="Allergic/Immunologic"
        symptoms={formState.allergic.symptoms}
        details={formState.allergic.details}
        onChange={(id) => handleSymptomChange("allergic", id)}
        onDetailsChange={(value) => handleDetailsChange("allergic", value)}
      />

      <div className="mt-6">
      <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save
          </button>
      </div>
    </form>
  );
}