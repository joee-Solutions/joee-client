import { CalendarIcon } from "lucide-react";
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
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";

interface FieldDatePickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  labelText?: string;
}

function FieldDateTimePicker<TFieldValues extends FieldValues>({
  control,
  name,
  labelText,
}: FieldDatePickerProps<TFieldValues>) {
  const [date, setDate] = useState<Date>();

  const { field } = useController({ control, name });

  useEffect(() => {
    if (date) {
      field.onChange(date);
    }
  }, [date]);

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className="flex flex-col w-full gap-3">
          {labelText && (
            <FormLabel className="font-medium text-sm text-gray-600">
              {labelText}
            </FormLabel>
          )}
          <div className="flex items-center gap-3 max-w-96 mb-5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`
                    pl-3 text-left font-normal flex justify-start gap-2 w-full
                    ${!date && "text-muted-foreground"}
                  `}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white z-20"
                align="start"
              >
                <FormControl>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
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
export default FieldDateTimePicker;
