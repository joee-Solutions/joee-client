import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Ellipsis } from "lucide-react";
import React, { useMemo } from "react";

const getColumnHeaders = function (data: Record<string, any>) {
  const headers = Object.keys(data).map((key) => {
    if (key === "id") {
      return "#";
    } else if (key.includes("_")) {
      const c = key.split("_");
      const firstC = c[0][0].toUpperCase() + c[0].slice(1);
      const secondC = c[1][0].toUpperCase() + c[1].slice(1);
      c[0] = firstC;
      c[1] = secondC;

      return c.join(" ");
    }
    return key[0].toUpperCase() + key.slice(1);
  });

  return headers;
};

interface DataTableProps {
  tableDataObj: Record<string, any>;
  children: React.ReactNode;
}

export default function DataTable({ tableDataObj, children }: DataTableProps) {
  const columnHeaders = useMemo(
    () => getColumnHeaders(tableDataObj),
    [tableDataObj]
  );

  return (
    <Table>
      <TableHeader className="bg-[#EDF0F6] h-[38px]">
        <TableRow>
          {columnHeaders.map((column) => {
            return (
              <TableHead
                key={column}
                className="font-semibold text-xs text-black"
              >
                {column}
              </TableHead>
            );
          })}
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}
