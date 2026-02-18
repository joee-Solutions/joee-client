import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

// Define the type for a surgery entry
type SurgeryEntry = {
  id: number;
  surgeryType: string;
  date: string;
  additionalInfo: string;
};

const surgeryTypes = [
  "Appendectomy",
  "Tonsillectomy",
  "Gallbladder removal",
  "Hip replacement",
  "Knee replacement",
  "Cesarean section",
  "Heart surgery",
  "Cataract surgery",
  "Hernia repair",
  "Thyroid surgery",
  "Other",
];

// schema.ts
import { z } from "zod";
import { FormDataStepper } from "../PatientStepper";
export const surgeryHistorySchema = z.array(
  z.object({
    surgeryType: z.string().optional(),
    date: z.string().optional(),
    additionalInfo: z.string().optional(),
  })
).optional();

export type SurgeryHistoryData = z.infer<typeof surgeryHistorySchema>;

export default function SurgeryHistoryForm() {
  const { control, register, formState: { errors }, watch } = useFormContext<FormDataStepper>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "surgeryHistory",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const surgeryHistory = watch("surgeryHistory") || [];

  // Sort surgeries by date (most recent first)
  const sortedSurgeries = useMemo(() => {
    return surgeryHistory.map((surgery, index) => ({ surgery, index })).sort((a, b) => {
      const dateA = a.surgery.date ? new Date(a.surgery.date).getTime() : 0;
      const dateB = b.surgery.date ? new Date(b.surgery.date).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [surgeryHistory]);

  const handleAddNew = () => {
    append({ surgeryType: "", date: "", additionalInfo: "" });
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

  const renderEditForm = (index: number) => (
    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Edit Surgery Entry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surgery Type */}
              <Controller
                name={`surgeryHistory.${index}.surgeryType`}
                control={control}
                render={({ field }) => (
                  <div>
                    <label
                htmlFor={`surgeryType`}
                      className="block text-base text-black font-normal mb-2"
                    >
                      Surgery Type
                    </label>
                    <Select
                value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                        <SelectValue placeholder="Select surgery type" />
                      </SelectTrigger>
                      <SelectContent className="z-10 bg-white">
                        {surgeryTypes.map((type) => (
                          <SelectItem key={type} value={type} className="hover:bg-gray-200">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              {/* Date */}
              <div>
                <label
                  htmlFor={'date'}
                  className="block text-base text-black font-normal mb-2"
                >
                  Date
                </label>
                <Controller
                  name={`surgeryHistory.${index}.date`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                      onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                      placeholder="Select surgery date"
                    />
                  )}
                />
                {errors.surgeryHistory?.[index]?.date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.surgeryHistory[index].date.message}
                  </p>
                )}
        </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6">
                <label
          htmlFor={`additionalInfo-${index}`}
                  className="block text-base text-black font-normal mb-2"
                >
                  Additional Information
                </label>
                <Textarea
                  {...register(`surgeryHistory.${index}.additionalInfo`)}
                  className="w-full h-32 p-3 border border-[#737373] rounded"
                  rows={4}
                  placeholder="Enter additional information"
                />
                {errors.surgeryHistory?.[index]?.additionalInfo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.surgeryHistory[index].additionalInfo.message}
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

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Surgery History</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Surgery
        </Button>
            </div>

      {/* List View - Sorted by Date */}
      {sortedSurgeries.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedSurgeries.map(({ surgery, index }) => {
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
                        {surgery.surgeryType || "Surgery"}
                      </h3>
                      {surgery.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(surgery.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {surgery.additionalInfo && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Additional Info: </span>
                        {surgery.additionalInfo}
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

      {sortedSurgeries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No surgery entries recorded</p>
          <p className="text-sm">Click "Add Surgery" to add a new entry</p>
          </div>
      )}
    </div>
  );
}
