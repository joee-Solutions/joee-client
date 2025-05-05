import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/Textarea";

interface FieldTextBoxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  labelText: string;
  fieldDescription?: string;
  bgInputClass?: string;
}

function FieldTextBox<T extends FieldValues>({
  control,
  name,
  placeholder,
  labelText,
  fieldDescription,
  bgInputClass,
}: FieldTextBoxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full flex flex-col gap-1">
          <FormLabel className="font-medium text-base text-black">
            {labelText}
          </FormLabel>
          <FormControl>
            <Textarea
              className={`focus-visible:ring-0 text-sm font-normal text-[#737373] border border-[#737373] h-[60px] focus:ring-transparent rounded px-[21px] ${
                bgInputClass ? bgInputClass : "bg-white"
              }`}
              {...field}
              placeholder={placeholder}
            />
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
export default FieldTextBox;
