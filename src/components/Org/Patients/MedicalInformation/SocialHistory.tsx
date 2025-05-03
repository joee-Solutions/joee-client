import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Data for sexual history options
const partnerOptions = ["0", "1", "2-5", "6-10", "11-20", "20+"];
const protectionOptions = ["Always", "Sometimes", "Never", "Not applicable"];

export default function LifestyleForm() {
  const [formState, setFormState] = useState({
    tobaccoUse: "",
    tobaccoQuantity: "",
    tobaccoDuration: "",
    alcoholUse: "",
    alcoholInfo: "",
    drugUse: "",
    drugInfo: "",
    dietExercise: "",
    dietExerciseInfo: "",
    partners: "",
    protection: "",
    comment: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className=" mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Lifestyle Information</h1>

      <form>
        {/* Tobacco Use Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Tobacco Use</h3>
          <div className="flex space-x-4">
            {["Never", "Former", "Current"].map((option) => (
              <label key={option} className="flex items-center space-x-2  text-base text-black font-normal mb-2">
                <Input
                  type="checkbox"
                  className="accent-green-600 w-6 h-6 rounded"
                  checked={formState.tobaccoUse === option.toLowerCase()}
                  onChange={() => handleChange("tobaccoUse", option.toLowerCase())}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {(formState.tobaccoUse === "former" || formState.tobaccoUse === "current") && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Quantity (Packs per day)"
            className="w-full h-14 p-3 border border-[#737373] rounded"
                value={formState.tobaccoQuantity}
                onChange={(e) => handleChange("tobaccoQuantity", e.target.value)}
              />
              <Input
                type="text"
                placeholder="Duration (Years)"
            className="w-full h-14 p-3 border border-[#737373] rounded"
                value={formState.tobaccoDuration}
                onChange={(e) => handleChange("tobaccoDuration", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Alcohol Use Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Alcohol Use</h3>
          <div className="flex space-x-4">
            {["Never", "Social", "Regular", "Heavy"].map((option) => (
              <label key={option} className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                <Input
                  type="checkbox"
                  className="accent-green-600 w-6 h-6 rounded"
                  checked={formState.alcoholUse === option.toLowerCase()}
                  onChange={() => handleChange("alcoholUse", option.toLowerCase())}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <Textarea
            placeholder="Additional Information"
            className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
            value={formState.alcoholInfo}
            onChange={(e) => handleChange("alcoholInfo", e.target.value)}
          />
        </div>

        {/* Illicit Drug Use Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Illicit Drug Use</h3>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                <Input
                  type="checkbox"
                  className="accent-green-600 w-6 h-6 rounded"
                  checked={formState.drugUse === option.toLowerCase()}
                  onChange={() => handleChange("drugUse", option.toLowerCase())}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {formState.drugUse === "yes" && (
            <Textarea
              placeholder="If Yes, please specify"
            className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
              value={formState.drugInfo}
              onChange={(e) => handleChange("drugInfo", e.target.value)}
            />
          )}
        </div>

        {/* Diet and Exercise Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Diet and Exercise</h3>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2 text-base text-black font-normal mb-2">
                <Input
                  type="checkbox"
                  className="accent-green-600 w-6 h-6 rounded"
                  checked={formState.dietExercise === option.toLowerCase()}
                  onChange={() => handleChange("dietExercise", option.toLowerCase())}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {formState.dietExercise === "yes" && (
            <Textarea
            className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
              placeholder="If Yes, please specify"
              value={formState.dietExerciseInfo}
              onChange={(e) => handleChange("dietExerciseInfo", e.target.value)}
            />
          )}
        </div>

        {/* Sexual History Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Sexual History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={formState.partners}
              onValueChange={(value) => handleChange("partners", value)}
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

            <Select
              value={formState.protection}
              onValueChange={(value) => handleChange("protection", value)}
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
          </div>

          <Textarea
            placeholder="Comment"
            className="w-full h-32 p-3 border border-[#737373] rounded mt-4"
            value={formState.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
          />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}