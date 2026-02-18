import { useState, ChangeEvent, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { FormDataStepper } from "../PatientStepper";
import { z } from "zod";
import { MEDICAL_CONDITIONS } from "./medicalConstants";
import { Edit2, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { authFectcher } from "@/hooks/swr";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

// Define interfaces for our data structures
interface MedicalCondition {
  id: number;
  condition: string;
  onsetDate: string;
  endDate: string;
  comments: string;
}

interface Medication {
  id: number;
  medication: string;
  startDate: string;
  endDate: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribersName: string;
  comments: string;
}
// Using comprehensive conditions list from constants

const medicationOptions = [
  "Lisinopril",
  "Metformin",
  "Albuterol",
  "Atorvastatin",
  "Levothyroxine",
  "Amlodipine",
  "Metoprolol",
  "Omeprazole",
  "Simvastatin",
  "Losartan",
];

const frequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 12 hours",
  "Weekly",
  "As needed",
];

const routeOptions = [
  "Oral",
  "Intravenous",
  "Intramuscular",
  "Subcutaneous",
  "Topical",
  "Inhalation",
  "Nasal",
  "Rectal",
  "Ophthalmic",
];

export const medHistorySchema = z.array(
  z.object({
    id: z.number().optional(),
    date: z.string().optional(), // Add date field for list view
    condition: z.string().optional(),
    onsetDate: z.string().optional(),
    endDate: z.string().optional(),
    comments: z.string().optional(),
    medMedication: z.string().optional(),
    medStartDate: z.string().optional(),
    medEndDate: z.string().optional(),
    medDosage: z.string().optional(),
    medFrequency: z.string().optional(),
    medRoute: z.string().optional(),
    medPrescribersName: z.string().optional(),
    medComments: z.string().optional(),
  }),
)
export type MedicalHistoryFormData = z.infer<typeof medHistorySchema>;
export default function MedicalHistoryForm() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const pathname = usePathname();
  const orgSlug = pathname?.split('/organization/')[1]?.split('/')[0] || '';

  const { control, register, formState: { errors }, watch } = useFormContext<Pick<FormDataStepper, 'medHistory'>>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medHistory',
  });

  // Fetch employees for prescriber dropdown
  const orgId = orgSlug && !isNaN(parseInt(orgSlug)) ? parseInt(orgSlug) : null;
  
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useSWR(
    orgId ? API_ENDPOINTS.GET_TENANTS_EMPLOYEES(orgId) : null,
    authFectcher
  );

  const employees = employeesData?.data || [];
  const useEmployeeDropdown = !employeesError && employees.length > 0;

  const medHistories = watch("medHistory") || [];

  // Sort by date (most recent first)
  const sortedHistories = useMemo(() => {
    // ensure we never try to read properties of null/undefined entries
    const list = Array.isArray(medHistories) ? medHistories : [];

    return list
      .map((history: any, index: number) => ({ history: history ?? {}, index }))
      .sort((a, b) => {
        const dateA = a.history?.date ? new Date(a.history.date).getTime() : 0;
        const dateB = b.history?.date ? new Date(b.history.date).getTime() : 0;
        return dateB - dateA;
      });
  }, [medHistories]);

  const handleAddNew = () => {
                        append({
                          id: Date.now(),
      date: formatDateLocal(new Date()),
                          condition: "",
                          onsetDate: "",
                          endDate: "",
                          comments: "",
                          medMedication: "",
                          medStartDate: "",
                          medEndDate: "",
                          medDosage: "",
                          medFrequency: "",
                          medRoute: "",
                          medPrescribersName: "",
                          medComments: "",
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
        <h1 className="text-2xl font-bold">Medication History</h1>
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
                    <h3 className="text-lg font-semibold">Medication History</h3>
                </div>

                  {/* Medication History Section */}
            <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                  <label className="block text-base text-black font-normal mb-2">Medication</label>
                  <Input
                    type="text"
                          {...register(`medHistory.${index}.medMedication`)}
                          className="w-full h-14 p-3 border border-[#737373] rounded"
                  />
                </div>

                      <div>
                  <label className="block text-base text-black font-normal mb-2">Start Date</label>
                  <Controller
                    name={`medHistory.${index}.medStartDate`}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                        onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                        placeholder="Select start date"
                      />
                    )}
                  />
              </div>

                      <div>
                  <label className="block text-base text-black font-normal mb-2">End Date</label>
                  <Controller
                    name={`medHistory.${index}.medEndDate`}
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

                      <div>
                        <label className="block text-base text-black font-normal mb-2">Dosage</label>
                  <Input
                    type="text"
                          {...register(`medHistory.${index}.medDosage`)}
                          className="w-full h-14 p-3 border border-[#737373] rounded"
                  />
                </div>

                      <div>
                  <Controller
                    control={control}
                    name={`medHistory.${index}.medFrequency`}
                    render={({ field }) => (
                      <div>
                        <label className="block text-base text-black font-normal mb-2">Frequency</label>
                              <Select value={field.value || ""} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full h-14 p-3 border border-[#737373] rounded">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent className="z-10 bg-white">
                            {frequencyOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="hover:bg-gray-200">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </div>

                      <div>
                  <Controller
                    control={control}
                    name={`medHistory.${index}.medRoute`}
                    render={({ field }) => (
                      <div>
                        <label className="block text-base text-black font-normal mb-2">Route</label>
                              <Select value={field.value || ""} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full h-14 p-3 border border-[#737373] rounded">
                            <SelectValue placeholder="Select route" />
                          </SelectTrigger>
                          <SelectContent className="z-10 bg-white">
                            {routeOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="hover:bg-gray-200">
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </div>

                      <div className="md:col-span-2">
                  <label className="block text-base text-black font-normal mb-2">Prescriber&apos;s Name</label>
                  {useEmployeeDropdown ? (
                    <Controller
                      name={`medHistory.${index}.medPrescribersName`}
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-14 p-3 border border-[#737373] rounded">
                            <SelectValue placeholder={employeesLoading ? "Loading..." : "Select prescriber"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-[1000]">
                            {employees.map((employee: any) => (
                              <SelectItem 
                                key={employee.id} 
                                value={`${employee.firstname} ${employee.lastname}`}
                              >
                                {employee.firstname} {employee.lastname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                  <Input
                    type="text"
                      placeholder="Enter prescriber name"
                      className="w-full h-14 p-3 border border-[#737373] rounded"
                          {...register(`medHistory.${index}.medPrescribersName`)}
                  />
                  )}
                </div>

                      <div className="md:col-span-2">
                        <label className="block text-base text-black font-normal mb-2">Medication Comments</label>
                  <Textarea
                    {...register(`medHistory.${index}.medComments`)}
                    className="w-full h-32 p-3 border border-[#737373] rounded"
                    rows={4}
                  />
                      </div>
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
                        {history.medMedication || "Medication Entry"}
                      </h3>
                      {history.medStartDate && (
                        <span className="text-sm text-gray-500">
                          Start: {new Date(history.medStartDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {history.medDosage && (
                        <div>
                          <span className="font-medium">Dosage: </span>
                          {history.medDosage}
                        </div>
                      )}
                      {history.medFrequency && (
                        <div>
                          <span className="font-medium">Frequency: </span>
                          {history.medFrequency}
                        </div>
                      )}
                      {history.medRoute && (
                        <div>
                          <span className="font-medium">Route: </span>
                          {history.medRoute}
                        </div>
                      )}
                      {history.medPrescribersName && (
                        <div>
                          <span className="font-medium">Prescriber: </span>
                          {history.medPrescribersName}
                        </div>
                      )}
                      {history.medEndDate && (
                        <div>
                          <span className="font-medium">End Date: </span>
                          {new Date(history.medEndDate).toLocaleDateString()}
                        </div>
                      )}
                      {history.medComments && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Comments: </span>
                          {history.medComments}
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
          <p className="text-lg mb-2">No medication history recorded</p>
          <p className="text-sm">Click "Add Entry" to add a new medication entry</p>
          </div>
      )}
    </div>
  );
}
