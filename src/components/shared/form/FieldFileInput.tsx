import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Link } from "lucide-react";

interface FieldFileInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelText?: string;
  hidden?: boolean;
  showInline?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  setImagePreviewer?: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

function FieldFileInput<T extends FieldValues>({
  control,
  name,
  labelText,
  hidden,
  showInline = false,
  fileInputRef,
  setImagePreviewer,
  disabled,
}: FieldFileInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="w-full">
            {labelText && (
              <FormLabel className="font-semibold text-base text-black">
                {labelText}
              </FormLabel>
            )}
            <FormControl>
              <div className="w-full">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.item(0);
                    field.onChange(file || field.value);

                    if (setImagePreviewer && file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreviewer(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={`${hidden && "hidden"}`}
                  ref={fileInputRef}
                  disabled={disabled}
                />
                {showInline && (
                  <div className={`relative ${!hidden && "hidden"}`}>
                    <input
                      type="text"
                      placeholder="Choose file"
                      className="border border-[#737373] bg-white rounded-[4px] h-[60px] px-10 w-full"
                      disabled
                      defaultValue={field.value && field.value.name}
                    />
                    <Link className="size-4 text-[#737373] absolute top-1/2 -translate-y-1/2 left-4" />
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
export default FieldFileInput;
