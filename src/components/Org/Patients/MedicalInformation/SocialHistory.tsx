import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { Controller, useFormContext } from "react-hook-form";
import { FormDataStepper } from "../PatientStepper";
import { Checkbox } from "@/components/ui/Checkbox";

// Data for sexual history options
const partnerOptions = ["0", "1", "2-5", "6-10", "11-20", "20+"];
const protectionOptions = ["Always", "Sometimes", "Never", "Not applicable"];

export const lifestyleSchema = z.object({
  tobaccoUse: z.string().optional(),
  tobaccoQuantity: z.string().optional(),
  tobaccoDuration: z.string().optional(),
  alcoholUse: z.string().optional(),
  alcoholInfo: z.string().optional(),
  drugUse: z.string().optional(),
  drugInfo: z.string().optional(),
  dietExercise: z.string().optional(),
  dietExerciseInfo: z.string().optional(),
  partners: z.string().optional(),
  protection: z.string().optional(),
  comment: z.string().optional(),
})
export type LifestyleData = z.infer<typeof lifestyleSchema>;

export default function LifestyleForm() {
  const { register, watch, formState: { errors }, control } = useFormContext<Pick<FormDataStepper, 'lifeStyle'>>()
  const tobaccoUse = watch("lifeStyle.tobaccoUse");
  const drugUse = watch("lifeStyle.drugUse");
  const dietExercise = watch("lifeStyle.dietExercise");
  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Lifestyle Information</h1>
      <div>
        {/* Tobacco Use Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Tobacco Use</h3>
          <div className="flex space-x-4">
            {["Never", "Former", "Current"].map((option) => (
              <Controller
                key={option}
                name="lifeStyle.tobaccoUse"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>

                    <label className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                      <Checkbox
                        checked={value === option.toLowerCase()}
                        onCheckedChange={() => onChange(option.toLowerCase())}
                        className="w-6 h-6 rounded"
                      />
                      <span>{option}</span>
                    </label>
                    {
                      errors.lifeStyle?.tobaccoUse && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lifeStyle.tobaccoUse.message}
                        </p>
                      )
                    }
                  </div>
                )}
              />
            ))}
          </div>

          {(tobaccoUse === "former" || tobaccoUse === "current") && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="">
                <Input
                  type="text"
                  placeholder="Quantity (Packs per day)"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register("lifeStyle.tobaccoQuantity", { required: true })
                  }
                />
                {
                  errors.lifeStyle?.tobaccoQuantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lifeStyle.tobaccoQuantity.message}
                    </p>
                  )
                }

              </div>
              <div className="">
                <Input
                  type="text"
                  placeholder="Duration (Years)"
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  {...register("lifeStyle.tobaccoDuration", { required: true })}
                />
                {
                  errors.lifeStyle?.tobaccoDuration && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lifeStyle.tobaccoDuration.message}
                    </p>
                  )

                }

              </div>
            </div>
          )}
        </div>

        {/* Alcohol Use Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Alcohol Use</h3>
          <div className="flex space-x-4">
            {["Never", "Social", "Regular", "Heavy"].map((option) => (
              <Controller
                key={option}
                name="lifeStyle.alcoholUse"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>
                    <label className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                      <Checkbox
                        checked={value === option.toLowerCase()}
                        onCheckedChange={() => onChange(option.toLowerCase())}
                        className="w-6 h-6 rounded"
                      />
                      <span>{option}</span>
                    </label>
                    {
                      errors.lifeStyle?.alcoholUse && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lifeStyle.alcoholUse.message}
                        </p>
                      )
                    }
                  </div>
                )}
              />
            ))}
          </div>
          <div className="">
            <Textarea
              placeholder="Additional Information"
              className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
              {...register("lifeStyle.alcoholInfo", { required: false })}
            />
            {
              errors.lifeStyle?.alcoholInfo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lifeStyle.alcoholInfo.message}
                </p>
              )
            }
          </div>
        </div>

        {/* Illicit Drug Use Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Illicit Drug Use</h3>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <Controller
                key={option}
                name="lifeStyle.drugUse"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>
                    <label className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                      <Checkbox
                        checked={value === option.toLowerCase()}
                        onCheckedChange={() => onChange(option.toLowerCase())}
                        className="w-6 h-6 rounded"
                      />
                      <span>{option}</span>
                    </label>
                    {
                      errors.lifeStyle?.drugUse && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lifeStyle.drugUse.message}
                        </p>
                      )
                    }
                  </div>
                )}
              />
            ))}
          </div>

          {drugUse === "yes" && (
            <div>
              <Textarea
                placeholder="If Yes, please specify"
                className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
                {...register("lifeStyle.drugInfo", { required: false })}
              />
              {
                errors.lifeStyle?.drugInfo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lifeStyle.drugInfo.message}
                  </p>
                )
              }
            </div>
          )}

        </div>

        {/* Diet and Exercise Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Diet and Exercise</h3>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <Controller
                key={option}
                name="lifeStyle.dietExercise"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>
                    <label className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                      <Checkbox
                        checked={value === option.toLowerCase()}
                        onCheckedChange={() => onChange(option.toLowerCase())}
                        className="w-6 h-6 rounded"
                      />
                      <span>{option}</span>
                    </label>
                    {
                      errors.lifeStyle?.dietExercise && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lifeStyle.dietExercise.message}
                        </p>
                      )
                    }
                  </div>
                )}
              />
            ))}
          </div>

          {dietExercise === "yes" && (
            <div>

              <Textarea
                className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
                placeholder="If Yes, please specify"
                {...register("lifeStyle.dietExerciseInfo", { required: false })}

              />
              {
                errors.lifeStyle?.dietExerciseInfo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lifeStyle.dietExerciseInfo.message}
                  </p>
                )
              }
            </div>
          )}
        </div>

        {/* Sexual History Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Sexual History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="lifeStyle.partners"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="w-full">
                  <Select
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                      <SelectValue placeholder="Number of Partners" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {partnerOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-200">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {
                    errors.lifeStyle?.partners && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lifeStyle.partners.message}
                      </p>
                    )
                  }
                </div>
              )}
            />

            <Controller

              name="lifeStyle.protection"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div>
                  <Select
                    value={value}
                    onValueChange={onChange}
                  >
                    <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                      <SelectValue placeholder="Protection Used" />
                    </SelectTrigger>
                    <SelectContent className="z-10 bg-white">
                      {protectionOptions.map((option) => (
                        <SelectItem key={option} value={option} className="hover:bg-gray-200">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {
                    errors.lifeStyle?.protection && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lifeStyle.protection.message}
                      </p>
                    )
                  }
                </div>
              )}
            />


          </div>

          <Textarea
            placeholder="Comment"
            className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
            {...register("lifeStyle.comment", { required: false })}
          />
          {
            errors.lifeStyle?.comment && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lifeStyle.comment.message}
              </p>
            )
          }
        </div>

        {/* <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save
          </button>
        </div> */}
      </div >
    </div >
  );
}