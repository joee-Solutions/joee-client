import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Calendar } from "lucide-react";

// Define the type for form data
type FormData = {
  checkedDrugFormulary: boolean;
  controlledSubstance: boolean;
  startDate: string;
  prescriberName: string;
  dosage: string;
  directions: string;
  notes: string;
  addToMedicationList: boolean | null;
};

export default function MedicationForm() {
  const [formData, setFormData] = useState<FormData>({
    checkedDrugFormulary: false,
    controlledSubstance: false,
    startDate: "",
    prescriberName: "",
    dosage: "",
    directions: "",
    notes: "",
    addToMedicationList: null,
  });

  const handleInputChange = (name: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your API
  };
  const [selectedValue, setSelectedValue] = useState<string | null>("");

  return (
    <div className="mx-auto p-6 ">
      <div className="flex gap-12 mb-8">
        <div className="flex items-center gap-2">
          <Checkbox
            id="checkedDrugFormulary"
            className="accent-green-600 w-6 h-6 rounded"
            checked={formData.checkedDrugFormulary}
            onCheckedChange={(checked) =>
              handleInputChange("checkedDrugFormulary", !!checked)
            }
          />
          <label htmlFor="checkedDrugFormulary" className="block text-base text-black font-normal mb-2">
            Checked Drug Formulary
          </label>
        </div>

        <div className="flex gap-2">
          <Checkbox
            id="controlledSubstance"
            className="accent-green-600 w-6 h-6 rounded"
            checked={formData.controlledSubstance}
            onCheckedChange={(checked) =>
              handleInputChange("controlledSubstance", !!checked)
            }
          />
          <label htmlFor="controlledSubstance" className="block text-base text-black font-normal mb-2">
            Controlled Substance
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label htmlFor="startDate" className="block text-base text-black font-normal mb-2">
            Start Date
          </label>
          <div className="relative">
            <Input
              id="startDate"
              type="date"
              placeholder="DD/MM/YYYY"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="prescriberName" className="block text-base text-black font-normal mb-2">
            Prescriber Name
          </label>
          <Input
            id="prescriberName"
            type="text"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            value={formData.prescriberName}
            onChange={(e) => handleInputChange("prescriberName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label htmlFor="dosage" className="block text-base text-black font-normal mb-2">
            Dosage
          </label>
          <Input
            id="dosage"
            type="text"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            value={formData.dosage}
            onChange={(e) => handleInputChange("dosage", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="directions" className="block text-base text-black font-normal mb-2">
            Directions
          </label>
          <Input
            id="directions"
            type="text"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            value={formData.directions}
            onChange={(e) => handleInputChange("directions", e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="notes" className="block text-base text-black font-normal mb-2">
          Notes
        </label>
        <Textarea
          id="notes"
          placeholder="Enter notes here"
        className="w-full h-32 p-3 border border-[#737373] rounded"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
        />
      </div>

      <div className="mb-8">
        <span className="block text-base text-black font-normal mb-2">Add to Medication List</span>
        <RadioGroup value={selectedValue} onValueChange={setSelectedValue} className="space-x-4 flex">
        <RadioGroupItem value="yes" id="yes" >
          Yes
        </RadioGroupItem>
        <RadioGroupItem value="no" id="no" >
          No
        </RadioGroupItem>
      </RadioGroup>
      </div>

      <div className="mt-8">
      <button
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}

