import React, { useState, useMemo } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

// schema.ts
import { z } from "zod";
import { FormDataStepper } from "../PatientStepper";

export const dischargeEntrySchema = z.object({
  patientStatus: z.string().optional(),
  dischargedDate: z.string().optional(),
  reasonForDischarge: z.string().optional(),
});

export const patientStatusSchema = z.object({
  dischargeEntries: z.array(dischargeEntrySchema).optional(),
});

export type patientStatusData = z.infer<typeof patientStatusSchema>;

export default function PatientDischargeForm() {
  const { control, register, setValue, watch, formState: { errors } } = useFormContext<FormDataStepper>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "patientStatus.dischargeEntries",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const patientStatusOptions = [
    "Discharged",
    "Admitted",
    "Ongoing",
    "Transferred",
  ];

  const dischargeEntries = watch('patientStatus.dischargeEntries') || [];

  // Sort entries by date (most recent first)
  const sortedEntries = useMemo(() => {
    return dischargeEntries.map((entry, index) => ({ entry, index })).sort((a, b) => {
      const dateA = a.entry.dischargedDate ? new Date(a.entry.dischargedDate).getTime() : 0;
      const dateB = b.entry.dischargedDate ? new Date(b.entry.dischargedDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [dischargeEntries]);

  const handleAddNew = () => {
                    append({
      patientStatus: "",
                      dischargedDate: "",
                      reasonForDischarge: "",
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

  const renderEditForm = (index: number) => (
    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Edit Patient Status Entry</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Status */}
            <div>
              <label className="block text-base text-black font-normal mb-2">
                Patient Status
              </label>
              <Select
                value={dischargeEntries?.[index]?.patientStatus || undefined}
                onValueChange={(value) => {
                  console.log("Patient status selected:", value);
                  setValue(`patientStatus.dischargeEntries.${index}.patientStatus`, value);
                }}
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white">
                  {patientStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          {errors.patientStatus?.dischargeEntries?.[index]?.patientStatus && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.patientStatus.dischargeEntries[index].patientStatus.message}
                  </p>
          )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-base text-black font-normal mb-2">
                Date
              </label>
              <Controller
                name={`patientStatus.dischargeEntries.${index}.dischargedDate`}
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                    placeholder="Select discharge date"
                  />
                )}
              />
          {errors.patientStatus?.dischargeEntries?.[index]?.dischargedDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.patientStatus.dischargeEntries[index].dischargedDate.message}
                  </p>
          )}
            </div>
          </div>

          {/* Reason for Discharge */}
          <div className="mt-6">
            <label className="block text-base text-black font-normal mb-2">
              Reason for Discharge
            </label>
            <Textarea
              className="w-full h-32 p-3 border border-[#737373] rounded"
              placeholder="Enter reason for discharge"
              {...register(`patientStatus.dischargeEntries.${index}.reasonForDischarge`)}
            />
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
        <h1 className="text-2xl font-bold">Patient Status Information</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Status Entry
        </Button>
      </div>

      {/* List View - Sorted by Date */}
      {sortedEntries.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedEntries.map(({ entry, index }) => {
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
                        {entry.patientStatus || "Patient Status"}
                      </h3>
                      {entry.dischargedDate && (
                        <span className="text-sm text-gray-500">
                          {new Date(entry.dischargedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {entry.reasonForDischarge && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Reason: </span>
                        {entry.reasonForDischarge}
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

      {sortedEntries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No patient status entries recorded</p>
          <p className="text-sm">Click "Add Status Entry" to add a new entry</p>
        </div>
      )}
    </div>
  );
}
