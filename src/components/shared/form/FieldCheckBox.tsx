import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/Checkbox";

interface FieldCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelText: string;
}

function FieldCheckbox<T extends FieldValues>({
  control,
  name,
  labelText,
}: FieldCheckboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className={`flex flex-col gap-3`}>
            <FormLabel
              htmlFor={labelText}
              className="font-normal cursor-pointer text-sm text-black"
            >
              {labelText}
            </FormLabel>

            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id={labelText}
                className=" size-6"
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default FieldCheckbox;
