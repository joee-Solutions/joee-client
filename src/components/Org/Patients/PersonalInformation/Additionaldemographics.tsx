import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

// Validation schema
const schema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  postal: z.string().min(1, "Postal/Zip code is required"),
  email: z.string().email("Invalid email address"),
  workEmail: z.string().email("Invalid work email address").optional(),
  homePhone: z.string().min(1, "Home phone is required"),
  mobilePhone: z.string().min(1, "Mobile phone is required"),
  address: z.string().min(1, "Address is required"),
  addressFrom: z.string().optional(),
  addressTo: z.string().optional(),
  currentAddress: z.string().optional(),
  contactMethod: z.string().min(1, "Preferred method of contact is required"),
  livingSituation: z.string().min(1, "Living situation is required"),
  referralSource: z.string().min(1, "Referral source is required"),
  occupationStatus: z.string().min(1, "Occupation status is required"),
  industry: z.string().min(1, "Industry is required"),
  householdSize: z.number().min(1, "Household size is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ContactDemographicForm() {
  // Arrays for dropdown options
  const countryOptions = ["United States", "Canada", "Mexico", "United Kingdom", "Australia", "Other"];
  const stateOptions = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
  const cityOptions = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Indianapolis", "Charlotte", "San Francisco", "Seattle", "Denver", "Washington DC"];
  const postalOptions = ["10001", "90001", "60601", "77001", "85001", "19101", "78201", "92101", "75201", "95101", "73301", "32099", "76101", "43085", "46201", "28201", "94101", "98101", "80201", "20001"];
  const contactMethodOptions = ["Email", "Phone", "Text Message", "Mail"];
  const livingSituationOptions = ["Own Home", "Rent", "Living with Family", "Assisted Living", "Nursing Home", "Homeless", "Other"];
  const referralSourceOptions = ["Doctor", "Friend/Family", "Insurance", "Internet Search", "Social Media", "Other"];
  const occupationStatusOptions = ["Employed", "Self-Employed", "Unemployed", "Retired", "Student", "Unable to Work", "Other"];
  const industryOptions = ["Healthcare", "Education", "Technology", "Finance", "Manufacturing", "Retail", "Government", "Construction", "Food Service", "Transportation", "Other"];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      householdSize: 1,
    }
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  // Convert register to work with shadcn/ui Select
  const registerSelect = (name: keyof FormData) => ({
    value: watch(name) as string,
    onValueChange: (value: string) => setValue(name, value),
  });

  return (
    <div className=" mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-base text-black font-normal mb-2">
            Country
          </label>
          <Select {...registerSelect("country")}>
            <SelectTrigger className=" w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {countryOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-base text-black font-normal mb-2">
            State
          </label>
          <Select {...registerSelect("state")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {stateOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-base text-black font-normal mb-2">
            City
          </label>
          <Select {...registerSelect("city")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {cityOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>

        {/* Postal/Zip code */}
        <div>
          <label htmlFor="postal" className="block text-base text-black font-normal mb-2">
            Postal/Zip code
          </label>
          <Select {...registerSelect("postal")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select postal code" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {postalOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.postal && <p className="text-red-500 text-sm">{errors.postal.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-base text-black font-normal mb-2">
            Email
          </label>
          <Input
            type="email"
            id="email"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Email (work) */}
        <div>
          <label htmlFor="workEmail" className="block text-base text-black font-normal mb-2">
            Email (work)
          </label>
          <Input
            type="email"
            id="workEmail"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("workEmail")}
          />
          {errors.workEmail && <p className="text-red-500 text-sm">{errors.workEmail.message}</p>}
        </div>

        {/* Phone (Home) */}
        <div>
          <label htmlFor="homePhone" className="block text-base text-black font-normal mb-2">
            Phone (Home)
          </label>
          <Input
            type="tel"
            id="homePhone"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("homePhone")}
          />
          {errors.homePhone && <p className="text-red-500 text-sm">{errors.homePhone.message}</p>}
        </div>

        {/* Phone (Mobile) */}
        <div>
          <label htmlFor="mobilePhone" className="block text-base text-black font-normal mb-2">
            Phone (Mobile)
          </label>
          <Input
            type="tel"
            id="mobilePhone"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("mobilePhone")}
          />
          {errors.mobilePhone && <p className="text-red-500 text-sm">{errors.mobilePhone.message}</p>}
        </div>

        {/* Address - Full width */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-base text-black font-normal mb-2">
            Address
          </label>
          <Input
            type="text"
            id="address"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("address")}
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>

        {/* You lived in the above address (From) */}
        <div>
          <label htmlFor="addressFrom" className="block text-base text-black font-normal mb-2">
            You lived in the above address (From)
          </label>
          <div className="relative">
            <Input
              type="date"
              id="addressFrom"
              placeholder="DD/MM/YYYY"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              {...register("addressFrom")}
            />
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          {errors.addressFrom && <p className="text-red-500 text-sm">{errors.addressFrom.message}</p>}
        </div>

        {/* To date */}
        <div>
          <label htmlFor="addressTo" className="block text-base text-black font-normal mb-2">
            To
          </label>
          <div className="relative">
            <Input
              type="date"
              id="addressTo"
              className="w-full h-14 p-3 border border-[#737373] rounded"
              placeholder="DD/MM/YYYY"
              {...register("addressTo")}
            />
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          {errors.addressTo && <p className="text-red-500 text-sm">{errors.addressTo.message}</p>}
        </div>

        {/* Current Address (if any) - Full width */}
        <div className="md:col-span-2">
          <label htmlFor="currentAddress" className="block text-base text-black font-normal mb-2">
            Current Address (if any)
          </label>
          <Input
            type="text"
            id="currentAddress"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("currentAddress")}
          />
          {errors.currentAddress && <p className="text-red-500 text-sm">{errors.currentAddress.message}</p>}
        </div>

        {/* Preferred Method of Contact */}
        <div>
          <label htmlFor="contactMethod" className="block text-base text-black font-normal mb-2">
            Preferred Method of Contact
          </label>
          <Select {...registerSelect("contactMethod")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {contactMethodOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contactMethod && <p className="text-red-500 text-sm">{errors.contactMethod.message}</p>}
        </div>

        {/* Current Living Situation */}
        <div>
          <label htmlFor="livingSituation" className="block text-base text-black font-normal mb-2">
            Current Living Situation
          </label>
          <Select {...registerSelect("livingSituation")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select living situation" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {livingSituationOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.livingSituation && <p className="text-red-500 text-sm">{errors.livingSituation.message}</p>}
        </div>

        {/* Referral Source */}
        <div>
          <label htmlFor="referralSource" className="block text-base text-black font-normal mb-2">
            Referral Source
          </label>
          <Select {...registerSelect("referralSource")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select referral source" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {referralSourceOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.referralSource && <p className="text-red-500 text-sm">{errors.referralSource.message}</p>}
        </div>

        {/* Occupation Status */}
        <div>
          <label htmlFor="occupationStatus" className="block text-base text-black font-normal mb-2">
            Occupation Status
          </label>
          <Select {...registerSelect("occupationStatus")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select occupation status" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {occupationStatusOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.occupationStatus && <p className="text-red-500 text-sm">{errors.occupationStatus.message}</p>}
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-base text-black font-normal mb-2">
            Industry
          </label>
          <Select {...registerSelect("industry")}>
            <SelectTrigger className="w-full p-3 border border-[#737373] h-14 rounded flex justify-between items-center">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              {industryOptions.map((option, index) => (
                <SelectItem key={index} value={option} className="hover:bg-gray-200">{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
        </div>

        {/* Household size */}
        <div>
          <label htmlFor="householdSize" className="block text-base text-black font-normal mb-2">
            Household size
          </label>
          <Input
            type="number"
            id="householdSize"
            placeholder="Enter here"
            className="w-full h-14 p-3 border border-[#737373] rounded"
            {...register("householdSize", { valueAsNumber: true })}
          />
          {errors.householdSize && <p className="text-red-500 text-sm">{errors.householdSize.message}</p>}
        </div>

        {/* Notes - Full width */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-base text-black font-normal mb-2">
            Notes
          </label>
          <Textarea
            id="notes"
            className="w-full h-32 p-3 border border-[#737373] rounded"
            rows={4}
            {...register("notes")}
          />
          {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
        </div>

        {/* Action Buttons */}
        {/* <div className="flex space-x-4 pt-4">
        <Button
            type="button"
            className=" border border-[#EC0909] text-[#EC0909] hover:bg-[#ec090922] py-8 px-16 text-md rounded"
          
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className=" bg-[#003465] hover:bg-[#0d2337] text-white py-8 px-16 text-md rounded"
          >
            Submit
          </Button>
        </div> */}
      </form>
    </div>
  );
}