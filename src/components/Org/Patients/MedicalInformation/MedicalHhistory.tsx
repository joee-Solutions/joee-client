import { useState, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function MedicalHistoryForm() {
  const medicalConditionOptions = [
    "Asthma",
    "Diabetes",
    "Hypertension",
    "Arthritis",
    "Allergies",
    "Heart Disease",
    "Cancer",
    "Depression",
    "Anxiety",
    "COPD",
  ];

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

  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>([
    { id: 1, condition: "", onsetDate: "", endDate: "", comments: "" },
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      medication: "",
      startDate: "",
      endDate: "",
      dosage: "",
      frequency: "",
      route: "",
      prescribersName: "",
      comments: "",
    },
  ]);

  const addMedicalCondition = () => {
    const newId =
      medicalConditions.length > 0
        ? Math.max(...medicalConditions.map((item) => item.id)) + 1
        : 1;

    setMedicalConditions([
      ...medicalConditions,
      { id: newId, condition: "", onsetDate: "", endDate: "", comments: "" },
    ]);
  };

  const removeMedicalCondition = (id: number) => {
    if (medicalConditions.length > 1) {
      setMedicalConditions(medicalConditions.filter((item) => item.id !== id));
    }
  };

  const updateMedicalCondition = (id: number, field: keyof MedicalCondition, value: string) => {
    setMedicalConditions(
      medicalConditions.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addMedication = () => {
    const newId =
      medications.length > 0
        ? Math.max(...medications.map((item) => item.id)) + 1
        : 1;

    setMedications([
      ...medications,
      {
        id: newId,
        medication: "",
        startDate: "",
        endDate: "",
        dosage: "",
        frequency: "",
        route: "",
        prescribersName: "",
        comments: "",
      },
    ]);
  };

  const removeMedication = (id: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((item) => item.id !== id));
    }
  };

  const updateMedication = (id: number, field: keyof Medication, value: string) => {
    setMedications(
      medications.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleInputChange = (
    id: number,
    field: keyof MedicalCondition | keyof Medication,
    setter: React.Dispatch<React.SetStateAction<MedicalCondition[]>> | React.Dispatch<React.SetStateAction<Medication[]>>,
    items: MedicalCondition[] | Medication[]
  ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(
      items.map((item) =>
        item.id === id ? { ...item, [field]: e.target.value } : item
      ) as any
    );
  };

  return (
    <div className=" mx-auto p-6">
      {/* Medical History Section */}
      <h1 className="text-2xl font-bold mb-6">Medical History</h1>

      {medicalConditions.map((condition, index) => (
        <div key={condition.id} className="mb-8 border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Medical Condition {index + 1}</h2>
            <div className="flex gap-2">
              {medicalConditions.length > 1 && (
                <button
                  onClick={() => removeMedicalCondition(condition.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Remove
                </button>
              )}
              {index === medicalConditions.length - 1 && (
                <button
                  onClick={addMedicalCondition}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Add Another
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Medical Condition</label>
              <Select
                value={condition.condition}
                onValueChange={(value) =>
                  updateMedicalCondition(condition.id, "condition", value)
                }
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="z-10 bg-white">
                  {medicalConditionOptions.map((option) => (
                    <SelectItem key={index} value={option} className="hover:bg-gray-200">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Onset Date</label>
              <input
                type="date"
                name={`onsetDate-${condition.id}`}
                value={condition.onsetDate}
                className="w-full h-14 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateMedicalCondition(condition.id, "onsetDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">End Date</label>
              <input
                type="date"
                name={`endDate-${condition.id}`}
                value={condition.endDate}
                className="w-full h-14 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateMedicalCondition(condition.id, "endDate", e.target.value)
                }
              />
            </div>
            </div>

            <div className="w-full">
              <label className="block text-base text-black font-normal mb-2">Comments</label>
              <Textarea
                value={condition.comments}
            className="w-full h-32 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateMedicalCondition(condition.id, "comments", e.target.value)
                }
                rows={4}
              />
            </div>
        </div>
      ))}

      {/* Medication History Section */}
      <h1 className="text-2xl font-bold mb-6">Medication History</h1>

      {medications.map((medication, index) => (
        <div key={medication.id} className="mb-8 border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Medication {index + 1}</h2>
            <div className="flex gap-2">
              {medications.length > 1 && (
                <button
                  onClick={() => removeMedication(medication.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Remove
                </button>
              )}
              {index === medications.length - 1 && (
                <button
                  onClick={addMedication}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Add Another
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Medication</label>
              <Select
                value={medication.medication}
                onValueChange={(value) =>
                  updateMedication(medication.id, "medication", value)
                }
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent className="z-10 bg-white">
                  {medicationOptions.map((option) => (
                    <SelectItem key={index} value={option} className="hover:bg-gray-200">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Start Date</label>
              <input
                type="date"
                name={`startDate-${medication.id}`}
                value={medication.startDate}
                className="w-full h-14 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateMedication(medication.id, "startDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">End Date</label>
              <input
                type="date"
                name={`endDate-${medication.id}`}
                value={medication.endDate}
                className="w-full h-14 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateMedication(medication.id, "endDate", e.target.value)
                }
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Dosage</label>
              <input
                type="text"
                name={`dosage-${medication.id}`}
                value={medication.dosage}
                className="w-full h-14 p-3 border border-[#737373] rounded"
                onChange={(e) =>
                  updateMedication(medication.id, "dosage", e.target.value)
                }
                placeholder="Enter dosage"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Frequency</label>
              <Select
                value={medication.frequency}
                onValueChange={(value) =>
                  updateMedication(medication.id, "frequency", value)
                }
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="z-10 bg-white">
                  {frequencyOptions.map((option) => (
                    <SelectItem key={index} value={option} className="hover:bg-gray-200">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-base text-black font-normal mb-2">Route</label>
              <Select
                value={medication.route}
                onValueChange={(value) =>
                  updateMedication(medication.id, "route", value)
                }
              >
                <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent className="z-10 bg-white">
                  {routeOptions.map((option) => (
                    <SelectItem key={index} value={option} className="hover:bg-gray-200">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-base text-black font-normal mb-2">Prescriber's Name</label>
            <input
              type="text"
              name={`prescribersName-${medication.id}`}
              value={medication.prescribersName}
              className="w-full h-14 p-3 border border-[#737373] rounded"
              onChange={(e) =>
                updateMedication(medication.id, "prescribersName", e.target.value)
              }
              placeholder="Enter prescriber's name"
            />
          </div>

          <div>
            <label className="block text-base text-black font-normal mb-2">Comments</label>
            <Textarea
              value={medication.comments}
            className="w-full h-32 p-3 border border-[#737373] rounded"
              onChange={(e) =>
                updateMedication(medication.id, "comments", e.target.value)
              }
              rows={4}
            />
          </div>
        </div>
      ))}

      {/* Submit button */}
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