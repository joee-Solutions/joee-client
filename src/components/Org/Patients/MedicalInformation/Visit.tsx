import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { FormDataStepper } from "../PatientStepper";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { authFectcher } from "@/hooks/swr";
import { useState, useMemo } from "react";
import { Edit2, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";
import { MEDICAL_CONDITIONS } from "./medicalConstants";
import { SearchableSelect } from "@/components/ui/searchable-select";

// Define validation schema for a visit entry
export const visitEntrySchema = z.array(
  z.object({
    visitCategory: z.string().optional(),
    dateOfService: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    duration: z.string().optional(),
    chiefComplaint: z.string().optional(),
    hpiOnsetDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    hpiDuration: z.string().optional(),
    severity: z.string().optional(),
    quality: z.string().optional(),
    aggravatingFactors: z.string().optional(),
    diagnosis: z.string().optional(),
    diagnosisOnsetDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    treatmentPlan: z.string().optional(),
    providerName: z.string().optional(),
    providerSignature: z.string().optional(),
  })
).optional();

export type VisitEntrySchemaType = z.infer<typeof visitEntrySchema>;

const visitCategories = [
  "Initial Visit",
  "Follow-up",
  "Urgent Care",
  "Annual Physical",
  "Consultation",
];
const durations = [
  "15 minutes",
  "30 minutes",
  "45 minutes",
  "60 minutes",
  "90 minutes",
];
const severityOptions = ["Mild", "Moderate", "Severe", "Very Severe"];
const qualityOptions = ["Sharp", "Dull", "Burning", "Throbbing", "Aching"];
const aggravatingFactors = ["Movement", "Rest", "Cold", "Heat", "Stress", "Food"];

export default function MedicalVisitForm() {
  const pathname = usePathname();
  const orgSlug = pathname?.split('/organization/')[1]?.split('/')[0] || '';
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const {
    control,
    watch,
    setValue,
  } = useFormContext<Pick<FormDataStepper, 'visits'>>();

  const { fields, append, remove } = useFieldArray<Pick<FormDataStepper, 'visits'>>({
    control,
    name: "visits",
  });

  // Fetch employees for provider dropdown
  const orgId = orgSlug && !isNaN(parseInt(orgSlug)) ? parseInt(orgSlug) : null;
  
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useSWR(
    orgId ? API_ENDPOINTS.GET_TENANTS_EMPLOYEES(orgId) : null,
    authFectcher
  );

  const employees = employeesData?.data || [];
  const useEmployeeDropdown = !employeesError && employees.length > 0;
  
  const visits = watch("visits") || [];

  // Sort visits by date (most recent first)
  const sortedVisits = useMemo(() => {
    return visits.map((visit, index) => ({ visit, index })).sort((a, b) => {
      const dateA = a.visit.dateOfService ? new Date(a.visit.dateOfService).getTime() : 0;
      const dateB = b.visit.dateOfService ? new Date(b.visit.dateOfService).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [visits]);

  const handleAddNew = () => {
    append({
        visitCategory: "",
      dateOfService: undefined,
        duration: "",
        chiefComplaint: "",
      hpiOnsetDate: undefined,
        hpiDuration: "",
        severity: "",
        quality: "",
        aggravatingFactors: "",
        diagnosis: "",
      diagnosisOnsetDate: undefined,
        treatmentPlan: "",
        providerName: "",
        providerSignature: "",
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

  const handleSignaturePrompt = (index: number) => {
    const signature = prompt("Please type your signature (or draw it - signature pad coming soon):");
    if (signature) {
      setValue(`visits.${index}.providerSignature`, signature);
    }
  };

  const renderEditForm = (index: number) => (
    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Edit Visit Entry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visit Category */}
        <Controller
          name={`visits.${index}.visitCategory`}
          control={control}
          render={({ field }) => (
              <div>
                <label className="block text-base text-black font-normal mb-2">
                  Visit Category
                </label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded">
                  <SelectValue placeholder="Select visit category" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {visitCategories.map((category) => (
                      <SelectItem key={category} value={category} className="hover:bg-gray-200">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
        />

              {/* Date of Service */}
        <Controller
          name={`visits.${index}.dateOfService`}
          control={control}
          render={({ field }) => (
              <div>
                <label className="block text-base text-black font-normal mb-2">
                Date of Service *
                </label>
                <DatePicker
                date={field.value ? parseISOStringToLocalDate(String(field.value)) : undefined}
                onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                  placeholder="Select date of service"
                />
              </div>
          )}
        />

              {/* Duration */}
        <Controller
          name={`visits.${index}.duration`}
          control={control}
          render={({ field }) => (
              <div>
                <label className="block text-base text-black font-normal mb-2">
                  Duration
                </label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded">
                  <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration} className="hover:bg-gray-200">
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
        />
            </div>

      {/* Chief Complaint */}
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4">Presenting Complaint & History of Present Illness</h3>
        <Controller
          name={`visits.${index}.chiefComplaint`}
          control={control}
          render={({ field }) => (
              <div className="mb-6">
                <label className="block text-base text-black font-normal mb-2">
                  Chief Complaint
                </label>
                <Textarea
                {...field}
                value={field.value || ""}
                  className="w-full h-32 p-3 border border-[#737373] rounded"
                placeholder="Enter chief complaint"
                />
              </div>
          )}
        />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HPI Onset Date */}
          <Controller
            name={`visits.${index}.hpiOnsetDate`}
            control={control}
            render={({ field }) => (
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                  HPI Onset Date
                  </label>
                  <DatePicker
                  date={field.value ? parseISOStringToLocalDate(String(field.value)) : undefined}
                  onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                    placeholder="Select onset date"
                  />
                </div>
            )}
          />

                {/* HPI Duration */}
          <Controller
            name={`visits.${index}.hpiDuration`}
            control={control}
            render={({ field }) => (
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                  HPI Duration
                  </label>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded">
                    <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration} className="hover:bg-gray-200">
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            )}
          />

                {/* Severity */}
          <Controller
            name={`visits.${index}.severity`}
            control={control}
            render={({ field }) => (
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Severity
                  </label>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded">
                    <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {severityOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-200">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            )}
          />

                {/* Quality */}
          <Controller
            name={`visits.${index}.quality`}
            control={control}
            render={({ field }) => (
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Quality
                  </label>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded">
                    <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {qualityOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-200">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            )}
          />
              </div>

        {/* Aggravating Factors */}
        <Controller
          name={`visits.${index}.aggravatingFactors`}
          control={control}
          render={({ field }) => (
              <div className="mt-6">
                <label className="block text-base text-black font-normal mb-2">
                Aggravating/Relieving Factors
                </label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded">
                  <SelectValue placeholder="Select factors" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {aggravatingFactors.map((factor) => (
                      <SelectItem key={factor} value={factor} className="hover:bg-gray-200">
                        {factor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
        />
            </div>

            {/* Diagnosis */}
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4">Diagnosis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Condition - Using comprehensive list with search */}
          <Controller
            name={`visits.${index}.diagnosis`}
            control={control}
            render={({ field }) => (
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                    Condition
                  </label>
                <SearchableSelect
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={MEDICAL_CONDITIONS}
                  placeholder="Select condition"
                  searchPlaceholder="Search conditions..."
                  triggerClassName="w-full p-3 border border-[#737373] h-14 rounded"
                  contentClassName="z-10 bg-white"
                />
                </div>
            )}
          />

                {/* Diagnosis Onset Date */}
          <Controller
            name={`visits.${index}.diagnosisOnsetDate`}
            control={control}
            render={({ field }) => (
                <div>
                  <label className="block text-base text-black font-normal mb-2">
                  Diagnosis Onset Date
                  </label>
                  <DatePicker
                  date={field.value ? parseISOStringToLocalDate(String(field.value)) : undefined}
                  onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                  placeholder="Select onset date"
                  />
                </div>
            )}
          />
              </div>
            </div>

            {/* Treatment Plan */}
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4">Treatment Plan</h3>
        <Controller
          name={`visits.${index}.treatmentPlan`}
          control={control}
          render={({ field }) => (
                <Textarea
              {...field}
              value={field.value || ""}
                  className="w-full h-32 p-3 border border-[#737373] rounded"
              placeholder="Enter treatment plan"
            />
          )}
        />
            </div>

            {/* Provider Information */}
            <div className="mt-6">
  <Controller
  name={`visits.${index}.providerName`}
  control={control}
  render={({ field }) => (
    <div className="mb-6">
      <label className="block text-base text-black font-normal mb-2">
        Provider Name
      </label>
      {useEmployeeDropdown ? (
        <Select value={field.value || ""} onValueChange={field.onChange}>
          <SelectTrigger className="w-full h-14 p-3 border border-[#737373] rounded">
            <SelectValue placeholder={employeesLoading ? "Loading..." : "Select provider"} />
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
      ) : (
        <input
          type="text"
          className="w-full h-14 p-3 border border-[#737373] rounded"
          value={field.value || ""}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          ref={field.ref}
          placeholder="Enter provider name"
        />
      )}
    </div>
  )}
/>

        <Controller
          name={`visits.${index}.providerSignature`}
          control={control}
          render={({ field }) => (
              <div className="mb-6">
                <label className="block text-base text-black font-normal mb-2">
                Provider Signature with Date and Time Stamp
                </label>
              <div className="flex gap-2">
                <Textarea
                  {...field}
                  value={field.value || ""}
                  className="w-full h-32 p-3 border border-[#737373] rounded flex-1"
                  placeholder="Signature will appear here"
                  readOnly
                />
                <Button
                  type="button"
                  onClick={() => handleSignaturePrompt(index)}
                  className="bg-[#003465] hover:bg-[#002850] text-white px-6 h-auto"
                >
                  {field.value ? "Update Signature" : "Add Signature"}
                </Button>
              </div>
            </div>
          )}
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
        <h1 className="text-2xl font-bold">Visit Information</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Visit
        </Button>
      </div>

      {/* List View - Sorted by Date */}
      {sortedVisits.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedVisits.map(({ visit, index }) => {
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
                        {visit.visitCategory || "Visit"}
                      </h3>
                      {visit.dateOfService && (
                        <span className="text-sm text-gray-500">
                          {new Date(visit.dateOfService).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {visit.duration && (
                        <div>
                          <span className="font-medium">Duration: </span>
                          {visit.duration}
                        </div>
                      )}
                      {visit.diagnosis && (
                        <div>
                          <span className="font-medium">Diagnosis: </span>
                          {visit.diagnosis}
                        </div>
                      )}
                      {visit.providerName && (
                        <div>
                          <span className="font-medium">Provider: </span>
                          {visit.providerName}
                        </div>
                      )}
                      {visit.chiefComplaint && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Chief Complaint: </span>
                          {visit.chiefComplaint}
                        </div>
                      )}
                      {visit.treatmentPlan && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Treatment Plan: </span>
                          {visit.treatmentPlan}
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

      {sortedVisits.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No visits recorded</p>
          <p className="text-sm">Click "Add Visit" to add a new visit entry</p>
        </div>
      )}
    </div>
  );
}
