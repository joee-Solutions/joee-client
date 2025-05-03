"use client";

import * as React from "react";
import {
  Tooltip as RadixTooltip,
  TooltipContent as RadixTooltipContent,
  TooltipProvider as RadixTooltipProvider,
  TooltipTrigger as RadixTooltipTrigger,
} from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = RadixTooltipProvider;

const Tooltip = RadixTooltip;

const TooltipTrigger = RadixTooltipTrigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof RadixTooltipContent>,
  React.ComponentPropsWithoutRef<typeof RadixTooltipContent>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <RadixTooltipContent
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = RadixTooltipContent.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
