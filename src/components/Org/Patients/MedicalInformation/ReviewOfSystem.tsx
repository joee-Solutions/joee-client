import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { z } from "zod";
import { FormDataStepper } from "../PatientStepper";

// Define the validation schema
export const reviewOfSystemSchema = z.object({
    // Genitourinary
  urinaryFrequency: z.boolean().default(false).optional(),
  dysuria: z.boolean().default(false).optional(),
  incontinence: z.boolean().default(false).optional(),
  genitourinaryDetails: z.string().optional(),

    // Musculoskeletal
  jointPain: z.boolean().default(false).optional(),
  muscleWeakness: z.boolean().default(false).optional(),
  stiffness: z.boolean().default(false).optional(),
  musculoskeletalDetails: z.string().optional(),

    // Neurological
  headaches: z.boolean().default(false).optional(),
  dizziness: z.boolean().default(false).optional(),
  numbnessWeakness: z.boolean().default(false).optional(),
  seizures: z.boolean().default(false).optional(),
  neurologicalDetails: z.string().optional(),

    // Psychiatric
  depression: z.boolean().default(false).optional(),
  anxiety: z.boolean().default(false).optional(),
  sleepingDisturbances: z.boolean().default(false).optional(),
  psychiatricDetails: z.string().optional(),

    // Endocrine
  heatColdIntolerance: z.boolean().default(false).optional(),
  excessiveThirstHunger: z.boolean().default(false).optional(),
  endocrineDetails: z.string().optional(),

    // Haematologic/Lymphatic
  easyBruising: z.boolean().default(false).optional(),
  bleedingTendencies: z.boolean().default(false).optional(),
  haematologicDetails: z.string().optional(),

    // Allergic/Immunologic
  frequentInfections: z.boolean().default(false).optional(),
  allergicReactions: z.boolean().default(false).optional(),
  allergicDetails: z.string().optional(),
}).optional();

export type ReviewOfSystemData = z.infer<typeof reviewOfSystemSchema>;

export default function MedicalSymptomForm() {
  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<Pick<FormDataStepper, 'reviewOfSystem'>>();

  // Watch all form values
  const formData = watch("reviewOfSystem") || {};

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
          <Controller
            key={name}
            name={`reviewOfSystem.${name}` as any}
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-2">
            <Checkbox
            className="accent-green-600 w-6 h-6 rounded"
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(!!checked);
                    setValue(`reviewOfSystem.${name}` as any, !!checked);
                  }}
            />
            <span className="text-gray-700">{label}</span>
          </label>
            )}
          />
        ))}
      </div>
      <div>
        <p className="text-gray-700 mb-2">Details</p>
        <Controller
          name={`reviewOfSystem.${detailsName}` as any}
          control={control}
          render={({ field }) => (
        <Textarea
              {...field}
          className="w-full border border-[#737373] rounded p-2 h-32 focus:outline-none focus:ring-2 focus:ring-[#003465] focus:border-[#003465]"
            />
          )}
        />
      </div>
    </div>
  );

  return (
    <div className=" mb-8">
      <form>
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

        {/* Save button removed - form saves automatically */}
      </form>
    </div>
  );
}