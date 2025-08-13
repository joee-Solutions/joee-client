import { Control, FieldValues, Path } from "react-hook-form";
import { Input } from "@/components/ui/inputShad";
import { X } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FieldItemListProps<T extends FieldValues> {
  placeholder: string;
  labelText?: string;
  name: Path<T>;
  showRequiredSymbol?: boolean;
  control: Control<T>;
}

function FieldItemList<T extends FieldValues>({
  placeholder,
  labelText,
  name,
  showRequiredSymbol,
  control,
}: FieldItemListProps<T>) {
  const hanldeOnKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevValues: string[] = [],
    onChange: (newValue: string[]) => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!e.currentTarget.value) {
        return;
      }

      onChange([...prevValues, e.currentTarget.value]);
      e.currentTarget.value = "";
    }
  };

  const handleDeleteValue = (
    item: string,
    items: string[],
    onChange: (newValue: string[]) => void
  ) => {
    onChange(items.filter((val) => val !== item));
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          {labelText && (
            <FormLabel className="text-sm font-medium flex items-center gap-1">
              {labelText}{" "}
              {showRequiredSymbol && <span className="text-red-600">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <ul className="flex items-center flex-wrap gap-3 rounded-[8px] p-[10px] border border-[#737373]">
              {field.value?.map((val: any) => (
                <li
                  key={crypto.randomUUID()}
                  className="flex items-center gap-[9.38px] text-[#424141] text-[10px] font-medium leading-[11.64px] p-[10px] py-[6px] bg-[#F1F2F4] rounded-[3.75px]"
                >
                  {val}
                  <X
                    className="size-5 font-bold cursor-pointer text-[#4B4B4F]"
                    onClick={() =>
                      handleDeleteValue(val, field.value, field.onChange)
                    }
                  />
                </li>
              ))}
              <li className="grow">
                <Input
                  className="rounded-[6px] py-2 pl-3 h-full w-full pr-3 focus-visible:ring-0 border-transparent focus:border-transparent"
                  placeholder={placeholder}
                  type="text"
                  name={name}
                  onKeyDown={(e) =>
                    hanldeOnKeyPress(e, field.value, field.onChange)
                  }
                />
              </li>
            </ul>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default FieldItemList;
