import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { FormDataStepper } from "../PatientStepper";
import { z } from "zod";
import { MEDICAL_CONDITIONS } from "./medicalConstants";
import { Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

export const diagnosisHistorySchema = z.array(
  z.object({
    id: z.number().optional(),
    date: z.string().optional(),
    condition: z.string().optional(),
    onsetDate: z.string().optional(),
    endDate: z.string().optional(),
    comments: z.string().optional(),
  }),
).optional();

export type DiagnosisHistoryData = z.infer<typeof diagnosisHistorySchema>;

export default function DiagnosisHistoryForm() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { control, register, formState: { errors }, watch } = useFormContext<FormDataStepper>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'diagnosisHistory',
  });

  const diagnosisHistories = watch("diagnosisHistory") || [];

  // Sort by date (most recent first)
  const sortedHistories = useMemo(() => {
    const list = Array.isArray(diagnosisHistories) ? diagnosisHistories : [];
    return list
      .map((history: any, index: number) => ({ history: history ?? {}, index }))
      .sort((a, b) => {
        const dateA = a.history?.date ? new Date(a.history.date).getTime() : 0;
        const dateB = b.history?.date ? new Date(b.history.date).getTime() : 0;
        return dateB - dateA;
      });
  }, [diagnosisHistories]);

  const handleAddNew = () => {
    append({
      id: Date.now(),
      date: formatDateLocal(new Date()),
      condition: "",
      onsetDate: "",
      endDate: "",
      comments: "",
    });
    setEditingIndex(fields.length);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSave = () => {
    setEditingIndex(null);
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diagnosis History</h1>
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
                    <h3 className="text-lg font-semibold">Edit Diagnosis Entry</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">Date *</label>
                      <Controller
                        name={`diagnosisHistory.${index}.date`}
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

                    {/* Medical Condition - Dropdown with Search */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">Medical Condition</label>
                      <Controller
                        name={`diagnosisHistory.${index}.condition`}
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
                      {errors.diagnosisHistory?.[index]?.condition && (
                        <p className="text-red-500 text-sm mt-1">{errors.diagnosisHistory[index].condition.message}</p>
                      )}
                    </div>

                    {/* Onset Date */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">Onset Date</label>
                      <Controller
                        name={`diagnosisHistory.${index}.onsetDate`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                            onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                            placeholder="Select onset date"
                          />
                        )}
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-base text-black font-normal mb-2">End Date</label>
                      <Controller
                        name={`diagnosisHistory.${index}.endDate`}
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                            onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                            placeholder="Select end date"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="mt-6">
                    <label className="block text-base text-black font-normal mb-2">Comments</label>
                    <Textarea
                      {...register(`diagnosisHistory.${index}.comments`)}
                      className="w-full h-32 p-3 border border-[#737373] rounded"
                      rows={4}
                    />
                  </div>

                  {/* Cancel Button - Auto-save is enabled */}
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 h-[50px] font-normal text-base"
                    >
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
                        {history.condition || "Diagnosis Entry"}
                      </h3>
                      {history.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {history.onsetDate && (
                        <div>
                          <span className="font-medium">Onset: </span>
                          {new Date(history.onsetDate).toLocaleDateString()}
                        </div>
                      )}
                      {history.endDate && (
                        <div>
                          <span className="font-medium">End: </span>
                          {new Date(history.endDate).toLocaleDateString()}
                        </div>
                      )}
                      {history.comments && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Comments: </span>
                          {history.comments}
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
          <p className="text-lg mb-2">No diagnosis history recorded</p>
          <p className="text-sm">Click "Add Entry" to add a new diagnosis entry</p>
        </div>
      )}
    </div>
  );
}

