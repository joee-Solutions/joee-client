"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { UseFormRegister } from "react-hook-form";
interface T {
  [key: string]: string;
}
type InputProps = {
  icon?: React.ReactNode;
  error?: string;
} & React.ComponentProps<"input">;

const Input = forwardRef<
  HTMLInputElement,
  InputProps & ReturnType<UseFormRegister<T>>
>(
  (
    { className, type, icon, name, error='', onChange, onBlur, value, ...props },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <div className="relative -w-full">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full relative z-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className,
              error && error?.length > 0 && "border-red-500"
            )}
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
          {icon && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 text-black size-5 cursor-pointer">
              {icon}
            </div>
          )}
        </div>
        {error && <div className="text-xs text-red-700 mt-1">{error}</div>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
