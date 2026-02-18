import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { FormDataStepper } from "../PatientStepper";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

export const vitalSignsSchema = z.array(
  z.object({
    date: z.string().optional(),
    temperature: z.string().optional(),
    systolic: z.string().optional(),
    diastolic: z.string().optional(),
    heartRate: z.string().optional(),
    respiratoryRate: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    glucose: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    painScore: z.string().optional(),
  })
).optional();

export type VitalSignsData = z.infer<typeof vitalSignsSchema>;

export default function VitalSignsForm() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { control, register, formState: { errors }, watch, setValue } = useFormContext<FormDataStepper>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vitalSigns",
  });

  const vitalSigns = watch("vitalSigns") || [];
  
  // Sort by date (most recent first) - keep original index for form operations
  const sortedVitalSigns = useMemo(() => {
    const list = Array.isArray(vitalSigns) ? vitalSigns : [];
    return list
      .map((vital: any, originalIndex: number) => ({ vital: vital ?? {}, originalIndex }))
      .sort((a, b) => {
        const dateA = a.vital?.date ? new Date(a.vital.date).getTime() : 0;
        const dateB = b.vital?.date ? new Date(b.vital.date).getTime() : 0;
        return dateB - dateA;
      });
  }, [vitalSigns]);

  const handleAddNew = () => {
    append({
      date: formatDateLocal(new Date()),
      temperature: "",
      systolic: "",
      diastolic: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      glucose: "",
      height: "",
      weight: "",
      bmi: "",
      painScore: "",
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

          // Auto-calculate BMI when height or weight changes
  const calculateBMI = (index: number, field: 'height' | 'weight', value: string) => {
    const currentVital = vitalSigns[index];
    if (!currentVital) return;

    const height = field === 'height' ? parseFloat(value) : parseFloat(currentVital.height || '0');
    const weight = field === 'weight' ? parseFloat(value) : parseFloat(currentVital.weight || '0');

            if (height > 0 && weight > 0) {
              // BMI = weight (kg) / (height (m))^2
              // Assuming height is in cm, convert to meters
              const heightInMeters = height / 100;
              const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
      setValue(`vitalSigns.${index}.bmi`, bmi);
            } else {
      setValue(`vitalSigns.${index}.bmi`, "");
    }
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vital Signs</h1>
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
      {sortedVitalSigns.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedVitalSigns.map(({ vital, originalIndex }) => {
            const isEditing = editingIndex === originalIndex;

            if (isEditing) {
              return (
                <div key={originalIndex} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Edit Vital Signs Entry</h3>
            </div>

            {/* Date Field - Full Width */}
            <div className="mb-4">
              <label className="block text-base text-black font-normal mb-2">Date *</label>
              <Controller
                name={`vitalSigns.${originalIndex}.date`}
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

            {/* Two fields per row - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-base text-black font-normal mb-2">Temperature (°F/°C)</label>
                <Input
                  type="text"
                  placeholder="Temperature"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.temperature`)}
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2">Systolic (mmHg)</label>
                <Input
                  type="text"
                  placeholder="Systolic"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.systolic`)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2">Diastolic (mmHg)</label>
                <Input
                  type="text"
                  placeholder="Diastolic"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.diastolic`)}
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2">Heart Rate (bpm)</label>
                <Input
                  type="text"
                  placeholder="Heart Rate"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.heartRate`)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2">Respiratory Rate (breaths/min)</label>
                <Input
                  type="text"
                  placeholder="Respiratory Rate"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.respiratoryRate`)}
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2">Oxygen Saturation (%)</label>
                <Input
                  type="text"
                  placeholder="Oxygen Saturation"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.oxygenSaturation`)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2">Glucose</label>
                <Input
                  type="text"
                  placeholder="Glucose"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register(`vitalSigns.${originalIndex}.glucose`)}
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2">Height (cm/in)</label>
                <Controller
                  name={`vitalSigns.${originalIndex}.height`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Height"
                      className="w-full h-14 p-3 border border-[#737373] rounded"
                      {...register(`vitalSigns.${originalIndex}.height`, {
                        onChange: (e) => {
                          calculateBMI(originalIndex, "height", e.target.value);
                        },
                      })}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2">Weight (kg/lbs)</label>
                <Controller
                  name={`vitalSigns.${originalIndex}.weight`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Weight"
                      className="w-full h-14 p-3 border border-[#737373] rounded"
                      {...register(`vitalSigns.${originalIndex}.weight`, {
                        onChange: (e) => {
                          calculateBMI(originalIndex, "weight", e.target.value);
                        },
                      })}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-base text-black font-normal mb-2">BMI</label>
                <Input
                  type="text"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  placeholder="BMI (auto-calculated)"
                  {...register(`vitalSigns.${originalIndex}.bmi`)}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-base text-black font-normal mb-2">Pain Score (0-10)</label>
                <Input
                  type="text"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  placeholder="Pain Score"
                  {...register(`vitalSigns.${originalIndex}.painScore`)}
                />
              </div>
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
              <div key={originalIndex} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Vital Signs Entry</h3>
                      {vital.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(vital.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      {vital.temperature && (
                        <div>
                          <span className="font-medium">Temperature: </span>
                          {vital.temperature}
                        </div>
                      )}
                      {vital.systolic && vital.diastolic && (
                        <div>
                          <span className="font-medium">Blood Pressure: </span>
                          {vital.systolic}/{vital.diastolic} mmHg
                        </div>
                      )}
                      {vital.heartRate && (
                        <div>
                          <span className="font-medium">Heart Rate: </span>
                          {vital.heartRate} bpm
                        </div>
                      )}
                      {vital.respiratoryRate && (
                        <div>
                          <span className="font-medium">Respiratory Rate: </span>
                          {vital.respiratoryRate} breaths/min
                        </div>
                      )}
                      {vital.oxygenSaturation && (
                        <div>
                          <span className="font-medium">Oxygen Saturation: </span>
                          {vital.oxygenSaturation}%
                        </div>
                      )}
                      {vital.glucose && (
                        <div>
                          <span className="font-medium">Glucose: </span>
                          {vital.glucose}
                        </div>
                      )}
                      {vital.height && (
                        <div>
                          <span className="font-medium">Height: </span>
                          {vital.height}
                        </div>
                      )}
                      {vital.weight && (
                        <div>
                          <span className="font-medium">Weight: </span>
                          {vital.weight}
                        </div>
                      )}
                      {vital.bmi && (
                        <div>
                          <span className="font-medium">BMI: </span>
                          {vital.bmi}
                        </div>
                      )}
                      {vital.painScore && (
                        <div>
                          <span className="font-medium">Pain Score: </span>
                          {vital.painScore}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      type="button"
                      onClick={() => handleEdit(originalIndex)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 h-auto"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => remove(originalIndex)}
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

      {sortedVitalSigns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No vital signs recorded</p>
          <p className="text-sm">Click "Add Entry" to add a new vital signs entry</p>
        </div>
      )}
    </div>
  );
}
