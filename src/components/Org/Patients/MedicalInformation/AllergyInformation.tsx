"use client";

import React, { useState } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Edit2, Trash2, Plus, X, Check } from "lucide-react";
import { formatDateLocal, parseISOStringToLocalDate } from "@/lib/utils";

// schema.ts
import { z } from "zod";
import { FormDataStepper } from "../PatientStepper";

export const allergySchema = z
  .array(
    z.object({
      allergy: z.string().optional(),
      otherAllergy: z.string().optional(), // For custom allergy when "Other" is selected
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      severity: z.string().optional(),
      reactions: z.string().optional(),
      comments: z.string().optional(),
    })
  )
  .optional();

export type AllergyFormData = z.infer<typeof allergySchema>;

export default function AllergyInformationForm() {
  const allergyOptions = [
    "Penicillin",
    "Peanuts",
    "Dairy",
    "Shellfish",
    "Eggs",
    "Tree nuts",
    "Wheat",
    "Soy",
    "Fish",
    "Latex",
    "Dust",
    "Pollen",
    "Mold",
    "Pet Dander",
    "Insect Stings",
    "Other",
  ];

  const severityLevels = ["Mild", "Moderate", "Severe", "Life-threatening"];

  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<Pick<FormDataStepper, 'allergies'>>();

  const { fields, append, remove, update } = useFieldArray<Pick<FormDataStepper, 'allergies'>>({
    control,
    name: "allergies",
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const allergies = watch("allergies") || [];

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setShowAddForm(false);
  };

  const handleSave = (index: number) => {
    setEditingIndex(null);
  };

  const handleAddNew = () => {
                    append({
                      allergy: "",
      otherAllergy: "",
                      startDate: "",
                      endDate: "",
                      severity: "",
                      reactions: "",
                      comments: "",
    });
    setEditingIndex(fields.length);
    setShowAddForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Allergy Information</h1>
        <Button
          type="button"
          onClick={handleAddNew}
          className="font-normal text-base text-white bg-[#003465] h-[60px] px-6 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Allergy
                </Button>
            </div>

      {/* List View */}
      {fields.length > 0 && (
        <div className="space-y-4 mb-6">
          {fields.map((field, index) => {
            const allergy = allergies[index];
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <div key={field.id} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Edit Allergy</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergy */}
            <div>
              <label className="block mb-2">Allergy</label>
              <Controller
                control={control}
                name={`allergies.${index}.allergy`}
                render={({ field }) => (
                  <>
                  <Select 
                    value={field.value || undefined} 
                    onValueChange={(value) => {
                      console.log("Allergy selected:", value);
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-full h-14 p-3 border border-gray-400 rounded z-[1000]">
                      <SelectValue placeholder="Select an allergy" />
                    </SelectTrigger>
                    <SelectContent className="z-[1000] bg-white">
                      {allergyOptions.map((opt) => (
                        <SelectItem key={opt} value={opt} className="hover:bg-gray-200 py-2">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    {field.value === "Other" && (
                      <div className="mt-4">
                        <label className="block mb-2">Specify Other Allergy</label>
                        <Input
                          className="w-full h-14 p-3 border border-gray-400 rounded"
                          placeholder="Enter allergy name"
                          {...register(`allergies.${index}.otherAllergy`)}
                        />
                        {errors.allergies?.[index]?.otherAllergy && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.allergies[index].otherAllergy?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              />
              {
                errors.allergies?.[index]?.allergy && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allergies[index].allergy.message}
                  </p>
                )
              }
            </div>

            {/* Start Date */}
            <div>
              <label className="block mb-2">Start Date</label>
              <Controller
                name={`allergies.${index}.startDate`}
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                    placeholder="Select start date"
                  />
                )}
              />
              {
                errors.allergies?.[index]?.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allergies[index].startDate.message}
                  </p>
                )
              }
            </div>

            {/* End Date */}
            <div>
              <label className="block mb-2">End Date</label>
              <Controller
                name={`allergies.${index}.endDate`}
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? parseISOStringToLocalDate(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? formatDateLocal(date) : '')}
                    placeholder="Select end date"
                  />
                )}
              />
              {
                errors.allergies?.[index]?.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allergies[index].endDate.message}
                  </p>
                )
              }
            </div>

            {/* Severity */}
            <div>
              <label className="block mb-2">Severity</label>
              <Controller
                control={control}
                name={`allergies.${index}.severity`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-14 p-3 border border-gray-400 rounded">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[1000]">
                      {severityLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {
                errors.allergies?.[index]?.severity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allergies[index].severity.message}
                  </p>
                )
              }
            </div>

            {/* Reactions */}
            <div>
              <label className="block mb-2">Reactions</label>
              <Textarea
                className="w-full h-32 p-3 border border-gray-400 rounded"
                placeholder="Enter reactions here"
                {...register(`allergies.${index}.reactions`)}
              />
              {
                errors.allergies?.[index]?.reactions && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allergies[index].reactions.message}
                  </p>
                )
              }
            </div>

            {/* Comments */}
            <div>
              <label className="block mb-2">Comments</label>
              <Textarea
                className="w-full h-32 p-3 border border-gray-400 rounded"
                placeholder="Enter comments here"
                {...register(`allergies.${index}.comments`)}
              />
              {
                errors.allergies?.[index]?.comments && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allergies[index].comments.message}
                  </p>
                )
              }
            </div>
          </div>

          {/* Cancel Button at Bottom - Auto-save is enabled */}
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
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {allergy?.allergy === "Other" && allergy?.otherAllergy 
                          ? allergy.otherAllergy 
                          : allergy?.allergy || "Unspecified Allergy"}
                      </h3>
                      {allergy?.severity && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          allergy.severity === "Life-threatening" ? "bg-red-100 text-red-800" :
                          allergy.severity === "Severe" ? "bg-orange-100 text-orange-800" :
                          allergy.severity === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {allergy.severity}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {allergy?.startDate && (
                        <div>
                          <span className="font-medium">Start Date: </span>
                          {new Date(allergy.startDate).toLocaleDateString()}
                        </div>
                      )}
                      {allergy?.endDate && (
                        <div>
                          <span className="font-medium">End Date: </span>
                          {new Date(allergy.endDate).toLocaleDateString()}
                        </div>
                      )}
                      {allergy?.reactions && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Reactions: </span>
                          {allergy.reactions}
                        </div>
                      )}
                      {allergy?.comments && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Comments: </span>
                          {allergy.comments}
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

      {fields.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No allergies recorded</p>
          <p className="text-sm">Click "Add Allergy" to add a new allergy</p>
        </div>
      )}
    </div>
  );
}
