import { Clock4 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import TimePicker from "@/components/ui/timePicker";

interface FieldDatePickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  labelText?: string;
}

function FieldTimePicker<TFieldValues extends FieldValues>({
  control,
  name,
  labelText,
}: FieldDatePickerProps<TFieldValues>) {
  const [time, setTime] = useState<string>("05:20 PM");

  const { field } = useController({ control, name });

  useEffect(() => {
    if (time) {
      field.onChange(time);
    }
  }, [time]);

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className="flex flex-col w-full gap-[2px]">
          {labelText && (
            <FormLabel className="font-medium text-base text-black">
              {labelText}
            </FormLabel>
          )}
          <div className="flex items-center mb-5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`
                    pl-5 text-left text-base font-normal border border-[#CCCCCC] text-[#737373] flex justify-start gap-2 w-full h-[60px]
                    ${!time && "text-muted-foreground"}
                  `}
                >
                  <Clock4 className="h-4 w-4" />
                  {time ? time : <span>Pick a time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white z-20"
                align="start"
              >
                <FormControl>
                  <TimePicker
                    selected={time}
                    onSelect={setTime}
                    className="bg-white"
                  />
                </FormControl>
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export default FieldTimePicker;
