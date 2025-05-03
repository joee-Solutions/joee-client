import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/inputShad";

interface FieldBoxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  labelText: string;
  type: React.HTMLInputTypeAttribute;
  iconText?: string;
  fieldDescription?: string;
  bgInputClass?: string;
  disabled?: boolean;
}

function FieldBox<T extends FieldValues>({
  control,
  name,
  placeholder,
  labelText,
  type,
  iconText,
  fieldDescription,
  bgInputClass,
  disabled,
}: FieldBoxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="font-medium text-base text-black">
            {labelText}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                {...field}
                className={`${
                  iconText ? "pl-10" : ""
                } text-sm font-normal text-[#737373] border border-[#737373] h-[60px] focus:ring-transparent rounded px-[21px] ${
                  bgInputClass ? bgInputClass : "bg-white"
                }`}
                disabled={disabled}
              />
              {iconText && (
                <span className="font-semibold text-base text-[#1E1E1E] absolute left-4 top-1/2 -translate-y-1/2">
                  {iconText}
                </span>
              )}
            </div>
          </FormControl>
          {fieldDescription && (
            <FormDescription>{fieldDescription}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default FieldBox;
