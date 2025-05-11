import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  labelText?: string;
  options: string[];
  fieldDescription?: string;
  bgSelectClass?: string;
  disabled?: boolean;
}

function FieldSelect<T extends FieldValues>({
  control,
  name,
  placeholder,
  labelText,
  options,
  fieldDescription,
  bgSelectClass,
  disabled,
}: FieldSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {labelText && (
            <FormLabel className="font-medium text-base text-black">
              {labelText}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={`h-[60px] border border-[#737373] focus:ring-transparent text-[#737373] text-xs font-normal ${
                  bgSelectClass ? bgSelectClass : "bg-white"
                }`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              {options.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="hover:bg-[#003465] hover:text-white cursor-pointer"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldDescription && (
            <FormDescription>{fieldDescription}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default FieldSelect;
