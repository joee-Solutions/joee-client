import React, { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for an allergy object
type Allergy = {
  id: number;
  allergy: string;
  startDate: string;
  endDate: string;
  severity: string;
  reactions: string;
  comments: string;
};

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
    "Other",
  ];

  const severityLevels = ["Mild", "Moderate", "Severe", "Life-threatening"];

  const [allergies, setAllergies] = useState<Allergy[]>([
    {
      id: 1,
      allergy: "",
      startDate: "",
      endDate: "",
      severity: "",
      reactions: "",
      comments: "",
    },
  ]);

  const addAllergy = (): void => {
    const newId =
      allergies.length > 0
        ? Math.max(...allergies.map((item) => item.id)) + 1
        : 1;

    setAllergies([
      ...allergies,
      {
        id: newId,
        allergy: "",
        startDate: "",
        endDate: "",
        severity: "",
        reactions: "",
        comments: "",
      },
    ]);
  };

  const removeAllergy = (id: number): void => {
    if (allergies.length > 1) {
      setAllergies(allergies.filter((item) => item.id !== id));
    }
  };

  const updateAllergy = (id: number, field: keyof Allergy, value: string): void => {
    setAllergies(
      allergies.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log("Allergy Information Form submitted:", allergies);
  };

  return (
    <div className="mx-auto p-6 ">
      <h1 className="text-2xl font-bold mb-6">Allergy Information</h1>

      <form onSubmit={handleSubmit}>
        {allergies.map((allergy, index) => (
          <div key={allergy.id} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Allergy {index + 1}</h2>
              <div className="flex gap-2">
                {allergies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
                {index === allergies.length - 1 && (
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Another
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allergy */}
              <div>
                <label htmlFor={`allergy-${allergy.id}`} className="block text-base text-black font-normal mb-2">
                  Allergy
                </label>
                <Select
                  value={allergy.allergy}
                  onValueChange={(value) =>
                    updateAllergy(allergy.id, "allergy", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Select an allergy" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {allergyOptions.map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-gray-200">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor={`startDate-${allergy.id}`} className="block text-base text-black font-normal mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name={`startDate-${allergy.id}`}
                  value={allergy.startDate}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateAllergy(allergy.id, "startDate", e.target.value)
                  }
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor={`endDate-${allergy.id}`} className="block text-base text-black font-normal mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name={`endDate-${allergy.id}`}
                  value={allergy.endDate}
                  className="w-full h-14 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateAllergy(allergy.id, "endDate", e.target.value)
                  }
                />
              </div>

              {/* Severity */}
              <div>
                <label htmlFor={`severity-${allergy.id}`} className="block text-base text-black font-normal mb-2">
                  Severity
                </label>
                <Select
                  value={allergy.severity}
                  onValueChange={(value) =>
                    updateAllergy(allergy.id, "severity", value)
                  }
                >
                  <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="z-10 bg-white">
                    {severityLevels.map((level) => (
                      <SelectItem key={level} value={level} className="hover:bg-gray-200">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reactions */}
              <div className="">
                <label htmlFor={`reactions-${allergy.id}`} className="block text-base text-black font-normal mb-2">
                  Reactions
                </label>
                <Textarea
                  value={allergy.reactions}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateAllergy(allergy.id, "reactions", e.target.value)
                  }
                  rows={4}
                  placeholder="Enter reactions here"
                />
              </div>

              {/* Comments */}
              <div className="">
                <label htmlFor={`comments-${allergy.id}`} className="block text-base text-black font-normal mb-2">
                  Comments
                </label>
                <Textarea
                  value={allergy.comments}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                  onChange={(e) =>
                    updateAllergy(allergy.id, "comments", e.target.value)
                  }
                  rows={4}
                  placeholder="Enter comments here"
                />
              </div>
            </div>
          </div>
        ))}

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