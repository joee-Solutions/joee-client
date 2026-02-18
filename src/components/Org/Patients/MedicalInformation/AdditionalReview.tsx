import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { z } from "zod";
import { FormDataStepper } from "../PatientStepper";

// Define the validation schema
export const additionalReviewSchema = z.object({
  psychiatric: z.object({
    depression: z.boolean().default(false).optional(),
    anxiety: z.boolean().default(false).optional(),
    sleepingDisturbances: z.boolean().default(false).optional(),
    details: z.string().optional(),
  }).optional(),
  endocrine: z.object({
    heatColdIntolerance: z.boolean().default(false).optional(),
    excessiveThirstHunger: z.boolean().default(false).optional(),
    details: z.string().optional(),
  }).optional(),
  haematologic: z.object({
    easyBruising: z.boolean().default(false).optional(),
    bleedingTendencies: z.boolean().default(false).optional(),
    details: z.string().optional(),
  }).optional(),
  allergic: z.object({
    frequentInfections: z.boolean().default(false).optional(),
    allergicReactions: z.boolean().default(false).optional(),
    details: z.string().optional(),
  }).optional(),
}).optional();

export type AdditionalReviewData = z.infer<typeof additionalReviewSchema>;

const SymptomCategory = ({
  title,
  categoryKey,
  symptoms,
}: {
  title: string;
  categoryKey: 'psychiatric' | 'endocrine' | 'haematologic' | 'allergic';
  symptoms: { id: string; label: string }[];
}) => {
  const { control, setValue } = useFormContext<Pick<FormDataStepper, 'additionalReview'>>();
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-2">{title}:</h2>
      <div className="flex flex-wrap gap-6 mb-2">
        {symptoms.map((symptom) => (
          <Controller
            key={symptom.id}
            name={`additionalReview.${categoryKey}.${symptom.id}` as any}
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={symptom.id}
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(!!checked);
                    setValue(`additionalReview.${categoryKey}.${symptom.id}` as any, !!checked);
                  }}
                  className="accent-green-600 w-6 h-6 rounded"
                />
                <label htmlFor={symptom.id} className="block text-base text-black font-normal mb-2">
                  {symptom.label}
                </label>
              </div>
            )}
          />
        ))}
      </div>
      <div>
        <label className="block text-base text-black font-normal mb-2">Details</label>
        <Controller
          name={`additionalReview.${categoryKey}.details` as any}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              className="w-full h-32 p-3 border border-[#737373] rounded"
            />
          )}
        />
      </div>
    </div>
  );
};

export default function MedicalSymptomsForm() {
  const { formState: { errors } } = useFormContext<Pick<FormDataStepper, 'additionalReview'>>();

  return (
    <form className="mx-auto p-6">
      <SymptomCategory
        title="Psychiatric"
        categoryKey="psychiatric"
        symptoms={[
          { id: "depression", label: "Depression" },
          { id: "anxiety", label: "Anxiety" },
          { id: "sleepingDisturbances", label: "Sleeping Disturbances" },
        ]}
      />

      <SymptomCategory
        title="Endocrine"
        categoryKey="endocrine"
        symptoms={[
          { id: "heatColdIntolerance", label: "Heat/Cold Intolerance" },
          { id: "excessiveThirstHunger", label: "Excessive Thirst/Hunger" },
        ]}
      />

      <SymptomCategory
        title="Haematologic/Lymphatic"
        categoryKey="haematologic"
        symptoms={[
          { id: "easyBruising", label: "Easy Bruising" },
          { id: "bleedingTendencies", label: "Bleeding Tendencies" },
        ]}
      />

      <SymptomCategory
        title="Allergic/Immunologic"
        categoryKey="allergic"
        symptoms={[
          { id: "frequentInfections", label: "Frequent Infections" },
          { id: "allergicReactions", label: "Allergic Reactions" },
        ]}
      />
    </form>
  );
}