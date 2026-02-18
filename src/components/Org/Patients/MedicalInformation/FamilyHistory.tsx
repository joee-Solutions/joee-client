import { Input } from "@/components/ui/input";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { FormDataStepper } from "../PatientStepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEDICAL_CONDITIONS } from "./medicalConstants";
import { Edit2, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

// Define the type for a family history entry
type FamilyHistoryEntry = {
  id: number;
  relative: string;
  conditions: string;
  ageOfDiagnosis: string;
  currentAge: string;
};

export const famHistorySchema = z.array(
  z.object({
    date: z.string().optional(), // Add date field for list view
    relative: z.string().optional(),
    conditions: z.string().optional(),
    ageOfDiagnosis: z.string().optional(),
    currentAge: z.string().optional(),
  })
).optional();
export type FamilyHistoryData = z.infer<typeof famHistorySchema>;

export default function FamilyHistoryForm() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { register, formState: { errors }, control, watch } = useFormContext<FormDataStepper>()
  const {
    fields, remove, append
  } = useFieldArray({
    control,
    name: "famhistory",
  })

  const famHistories = watch("famhistory") || [];

  // Sort by date (most recent first)
  const sortedHistories = useMemo(() => {
    return famHistories.map((history, index) => ({ history, index })).sort((a, b) => {
      const dateA = a.history.date ? new Date(a.history.date).getTime() : 0;
      const dateB = b.history.date ? new Date(b.history.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [famHistories]);

  const handleAddNew = () => {
    append({ 
      date: formatDateLocal(new Date()),
      relative: "", 
      conditions: "", 
      ageOfDiagnosis: "", 
      currentAge: "" 
    });
    setEditingIndex(fields.length);
    setShowAddForm(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    setEditingIndex(null);
    setShowAddForm(false);
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Family History</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      {/* List View */}
      {sortedHistories.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedHistories.map(({ history, index }) => {
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <div key={index} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Edit Family History Entry</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">Date *</label>
                      <Controller
                                             name={`famhistory.${index}.date`}
                                             control={control}
                                             render={({ field }) => (
                                               <DatePicker
                                                 date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                                                 onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                                                 placeholder="Select date"
                                               />
                                             )}
                                           />
                    </div>

                    {/* Relative */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">
                        Relative
                      </label>
                      <Input
                        type="text"
                        {...register(`famhistory.${index}.relative`)}
                        className="w-full h-14 p-3 border border-[#737373] rounded"
                        placeholder="Enter relative"
                      />
                      {errors.famhistory?.[index]?.relative && (
                        <p className="text-red-500 text-sm mt-1">{errors.famhistory[index].relative.message}</p>
                      )}
                    </div>

                    {/* Conditions - Dropdown with Search */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">
                        Conditions
                      </label>
                      <Controller
                        name={`famhistory.${index}.conditions`}
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            options={MEDICAL_CONDITIONS}
                            placeholder="Select condition"
                            searchPlaceholder="Search conditions..."
                            triggerClassName="w-full h-14 p-3 border border-[#737373] rounded"
                            contentClassName="z-10 bg-white"
                          />
                        )}
                      />
                      {errors.famhistory?.[index]?.conditions && (
                        <p className="text-red-500 text-sm mt-1">{errors.famhistory[index].conditions.message}</p>
                      )}
                    </div>

                    {/* Age of Diagnosis */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">
                        Age of Diagnosis
                      </label>
                      <Input
                        type="text"
                        {...register(`famhistory.${index}.ageOfDiagnosis`)}
                        className="w-full h-14 p-3 border border-[#737373] rounded"
                        placeholder="Enter age of diagnosis"
                      />
                      {errors.famhistory?.[index]?.ageOfDiagnosis && (
                        <p className="text-red-500 text-sm mt-1">{errors.famhistory[index].ageOfDiagnosis.message}</p>
                      )}
                    </div>

                    {/* Current Age */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">
                        Current Age
                      </label>
                      <Input
                        type="text"
                        {...register(`famhistory.${index}.currentAge`)}
                        className="w-full h-14 p-3 border border-[#737373] rounded"
                        placeholder="Enter current age"
                      />
                      {errors.famhistory?.[index]?.currentAge && (
                        <p className="text-red-500 text-sm mt-1">{errors.famhistory[index].currentAge.message}</p>
                      )}
                    </div>
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
            }

            // List View Display
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {history.relative || "Family History Entry"}
                      </h3>
                      {history.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {history.conditions && (
                        <div>
                          <span className="font-medium">Condition: </span>
                          {history.conditions}
                        </div>
                      )}
                      {history.ageOfDiagnosis && (
                        <div>
                          <span className="font-medium">Age of Diagnosis: </span>
                          {history.ageOfDiagnosis}
                        </div>
                      )}
                      {history.currentAge && (
                        <div>
                          <span className="font-medium">Current Age: </span>
                          {history.currentAge}
                        </div>
                      )}
                    </div>
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

      {sortedHistories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No family history recorded</p>
          <p className="text-sm">Click "Add Entry" to add a new family history entry</p>
        </div>
      )}
    </div>
  );
}