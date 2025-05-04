import { formatDate } from "date-fns";
import { LoanTenure } from "./types";

export const timeFormatter = (date: Date | string) => {
  const loanCreatedDate = new Date(date);
  const formattedDate = loanCreatedDate.toLocaleString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
    // hour12: true,
  });

  return formattedDate;
};


export const formatDateFn = (date: string | Date = new Date()) => {
  return formatDate(new Date(date), "MMMM dd, yyyy");
};

export const formatDateTime = (date: string | Date = new Date()) => {
  return formatDate(new Date(date), "MMMM dd, yyyy 'at' h:mm a");
};