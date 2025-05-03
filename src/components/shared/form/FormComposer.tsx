import { FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface FormComposerProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (payload: T) => void;
  children: React.ReactNode;
}

function FormComposer<T extends FieldValues>({
  form,
  onSubmit,
  children,
}: FormComposerProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </Form>
  );
}
export default FormComposer;
