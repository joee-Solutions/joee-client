import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
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
}

export default function FieldNumber<T extends FieldValues>({
  control,
  name,
  placeholder,
  labelText,
}: FieldBoxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{labelText}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              {...field}
              //   className="appearance-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
