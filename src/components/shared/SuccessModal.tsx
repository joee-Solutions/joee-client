"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";

export interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export default function SuccessModal({
  open,
  onOpenChange,
  title = "Success",
  message,
  buttonText = "Done",
}: SuccessModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white flex flex-col items-center text-center max-w-md">
        <AlertDialogHeader className="flex flex-col items-center space-y-2">
          <CheckCircle2 className="size-16 text-[#3FA907] shrink-0" aria-hidden />
          <AlertDialogTitle className="font-semibold text-[#3FA907] text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-normal text-base text-[#737373]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full sm:justify-center">
          <AlertDialogAction
            className="h-12 px-8 bg-[#3FA907] hover:bg-[#359006] text-white font-medium"
            onClick={() => onOpenChange(false)}
          >
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
