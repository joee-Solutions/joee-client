import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { FormDataStepper } from "../PatientStepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { authFectcher } from "@/hooks/swr";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

// Define the validation schema
export const prescriptionSchema = z.array(z.object({
  medicationName: z.string().optional(),
  checkedDrugFormulary: z.boolean().default(false).optional(),
  controlledSubstance: z.boolean().default(false).optional(),
  startDate: z.string().optional(),
  prescriberName: z.string().optional(),
  dosage: z.string().optional(),
  directions: z.string().optional(),
  notes: z.string().optional(),
}));

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export default function MedicationForm() {
  const pathname = usePathname();
  const orgSlug = pathname?.split('/organization/')[1]?.split('/')[0] || '';
  
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<Pick<FormDataStepper, 'prescriptions'>>();

  const { fields, append, remove } = useFieldArray<Pick<FormDataStepper, 'prescriptions'>>({
    control,
    name: "prescriptions",
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Fetch employees for prescriber dropdown
  const orgId = orgSlug && !isNaN(parseInt(orgSlug)) ? parseInt(orgSlug) : null;
  
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useSWR(
    orgId ? API_ENDPOINTS.GET_TENANTS_EMPLOYEES(orgId) : null,
    authFectcher
  );

  const employees = employeesData?.data || [];
  const useEmployeeDropdown = !employeesError && employees.length > 0;

  const prescriptions = watch('prescriptions') || [];

  // Sort entries by date (most recent first)
  const sortedPrescriptions = useMemo(() => {
    return prescriptions.map((prescription, index) => ({ prescription, index })).sort((a, b) => {
      const dateA = a.prescription.startDate ? new Date(a.prescription.startDate).getTime() : 0;
      const dateB = b.prescription.startDate ? new Date(b.prescription.startDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [prescriptions]);

  const handleAddNew = () => {
                        append({
      medicationName: "",
                          checkedDrugFormulary: false,
                          controlledSubstance: false,
      startDate: "",
                          prescriberName: "",
                          dosage: "",
                          directions: "",
                          notes: "",
    });
    setEditingIndex(fields.length);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const renderEditForm = (index: number) => {
    const prescription = prescriptions[index];
    return (
      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Edit Prescription Entry</h3>
                  </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Medication Name */}
          <div>
            <label className="block text-base text-black font-normal mb-2">
              Medication Name
            </label>
            <Input
              type="text"
              placeholder="Enter medication name"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register(`prescriptions.${index}.medicationName`)}
            />
            {errors.prescriptions?.[index]?.medicationName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.prescriptions[index].medicationName.message}
              </p>
            )}
                </div>

          {/* Start Date */}
                  <div>
            <label className="block text-base text-black font-normal mb-2">
                      Start Date
                    </label>
                    <Controller
                      name={`prescriptions.${index}.startDate`}
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                  date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                  onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                          placeholder="Select start date"
                        />
                      )}
                    />
            {errors.prescriptions?.[index]?.startDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.prescriptions[index].startDate.message}
              </p>
            )}
          </div>
                  </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Prescriber Name */}
                  <div>
            <label className="block text-base text-black font-normal mb-2">
                      Prescriber Name
                    </label>
                    {useEmployeeDropdown ? (
                      <Controller
                        name={`prescriptions.${index}.prescriberName`}
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
                        {...register(`prescriptions.${index}.prescriberName`)}
                      />
                    )}
                </div>

          {/* Dosage */}
                  <div>
            <label className="block text-base text-black font-normal mb-2">
                      Dosage
                    </label>
                    <Input
                      type="text"
              placeholder="Enter dosage"
                      className="w-full h-14 p-3 border border-[#737373] rounded"
                      {...register(`prescriptions.${index}.dosage`)}
                    />
          </div>
                  </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Directions */}
                  <div>
            <label className="block text-base text-black font-normal mb-2">
                      Directions
                    </label>
                    <Input
                      type="text"
              placeholder="Enter directions"
                      className="w-full h-14 p-3 border border-[#737373] rounded"
                      {...register(`prescriptions.${index}.directions`)}
                    />
                  </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Controller
                name={`prescriptions.${index}.checkedDrugFormulary`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={`drugFormulary-${index}`}
                    className="accent-green-600 w-6 h-6 rounded"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label htmlFor={`drugFormulary-${index}`} className="block text-base text-black font-normal">
                Drug Formulary
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name={`prescriptions.${index}.controlledSubstance`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={`controlledSubstance-${index}`}
                    className="accent-green-600 w-6 h-6 rounded"
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label htmlFor={`controlledSubstance-${index}`} className="block text-base text-black font-normal">
                Controlled Substance
              </label>
            </div>
                  </div>
                </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-base text-black font-normal mb-2">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Enter notes here"
                    className="w-full h-32 p-3 border border-[#737373] rounded"
                    {...register(`prescriptions.${index}.notes`)}
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
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Prescription
        </Button>
      </div>

      {/* List View - Sorted by Date */}
      {sortedPrescriptions.length > 0 && (
        <div className="space-y-4 mb-6">
          {sortedPrescriptions.map(({ prescription, index }) => {
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
                        {prescription.medicationName || "Prescription"}
                      </h3>
                      {prescription.startDate && (
                        <span className="text-sm text-gray-500">
                          {new Date(prescription.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {prescription.prescriberName && (
                        <div>
                          <span className="font-medium">Prescriber: </span>
                          {prescription.prescriberName}
                        </div>
                      )}
                      {prescription.dosage && (
                        <div>
                          <span className="font-medium">Dosage: </span>
                          {prescription.dosage}
                        </div>
                      )}
                      {prescription.directions && (
                        <div>
                          <span className="font-medium">Directions: </span>
                          {prescription.directions}
                        </div>
                      )}
                      <div className="flex gap-4">
                        {prescription.checkedDrugFormulary && (
                          <span className="text-green-600 font-medium">Drug Formulary</span>
                        )}
                        {prescription.controlledSubstance && (
                          <span className="text-orange-600 font-medium">Controlled Substance</span>
                  )}
                </div>
                    </div>
                    {prescription.notes && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Notes: </span>
                        {prescription.notes}
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

      {sortedPrescriptions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No prescriptions recorded</p>
          <p className="text-sm">Click "Add Prescription" to add a new entry</p>
          </div>
      )}
    </div>
  );
}
