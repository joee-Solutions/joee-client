import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { FormDataStepper } from "../PatientStepper";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";
import { useState, useMemo } from "react";

const immunizationTypes = [
  "Influenza (Flu)",
  "COVID-19",
  "Tdap (Tetanus, Diphtheria, Pertussis)",
  "MMR (Measles, Mumps, Rubella)",
  "HPV",
  "Hepatitis B",
  "Pneumococcal",
  "Varicella (Chickenpox)",
  "Meningococcal",
];

export const immunizationHistorySchema = z.array(
  z.object({
    immunizationType: z.string().optional(),
    date: z.string().optional(),
    additionalInfo: z.string().optional(),
  })
).optional();

export type ImmunizationHistoryData = z.infer<typeof immunizationHistorySchema>;

export default function ImmunizationForm() {
  const { register, formState: { errors }, control, setValue, watch } = useFormContext<Pick<FormDataStepper, 'immunizationHistory'>>();
  const {
    fields, remove, append
  } = useFieldArray({
    control,
    name: "immunizationHistory",
  });
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const immunizations = watch('immunizationHistory') || [];

  // Sort entries by date (most recent first)
  const sortedImmunizations = useMemo(() => {
    return immunizations.map((immunization, index) => ({ immunization, index })).sort((a, b) => {
      const dateA = a.immunization.date ? new Date(a.immunization.date).getTime() : 0;
      const dateB = b.immunization.date ? new Date(b.immunization.date).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [immunizations]);

  const handleAddNew = () => {
    append({ immunizationType: "", date: "", additionalInfo: "" });
    setEditingIndex(fields.length);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const renderEditForm = (index: number) => {
  return (
      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Edit Immunization Entry</h3>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Immunization Type */}
              <div>
                <label
              htmlFor={`immunizationType-${index}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Immunization Type
                </label>
                <Controller
                  name={`immunizationHistory.${index}.immunizationType`}
                  control={control}
                  render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-14 p-3 border border-[#737373] rounded">
                        <SelectValue placeholder="Select immunization type" />
                      </SelectTrigger>
                  <SelectContent className="bg-white z-[1000]">
                        {immunizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
            {errors.immunizationHistory?.[index]?.immunizationType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.immunizationHistory[index].immunizationType.message}
                    </p>
            )}
              </div>

              {/* Date */}
              <div>
                <label
              htmlFor={`date-${index}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Date
                </label>
                <Controller
                  name={`immunizationHistory.${index}.date`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                  date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                  onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                      placeholder="Select immunization date"
                    />
                  )}
                />
            {errors.immunizationHistory?.[index]?.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.immunizationHistory[index].date.message}
                    </p>
            )}
          </div>
              </div>

        {/* Additional Info */}
        <div className="mb-6">
                <label
            htmlFor={`additionalInfo-${index}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Additional Information
                </label>
                <Textarea
            id={`additionalInfo-${index}`}
            placeholder="Enter additional information"
            className="w-full h-32 p-3 border border-[#737373] rounded"
                  {...register(`immunizationHistory.${index}.additionalInfo`)}
                />
                {errors.immunizationHistory?.[index]?.additionalInfo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.immunizationHistory[index].additionalInfo.message}
                  </p>
                )}
        </div>

        {/* Cancel Button - Auto-save is enabled */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 h-[50px] font-normal text-base"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
              </div>
            </div>
    );
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Immunization History</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Immunization
        </Button>
          </div>

      {/* List View - Sorted by Date */}
      {sortedImmunizations.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedImmunizations.map(({ immunization, index }) => {
            const isEditing = editingIndex === index;

            if (isEditing) {
              return <div key={index}>{renderEditForm(index)}</div>;
            }

            // List View Display
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {immunization.immunizationType || "Immunization"}
                      </h3>
                      {immunization.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(immunization.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {immunization.additionalInfo && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Additional Info: </span>
                        {immunization.additionalInfo}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 h-auto"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 h-auto"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sortedImmunizations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No immunization entries recorded</p>
          <p className="text-sm">Click "Add Immunization" to add a new entry</p>
        </div>
      )}
    </div>
  );
}
