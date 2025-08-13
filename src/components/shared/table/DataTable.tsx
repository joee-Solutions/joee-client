// src/components/DataTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";

type Primitives = string | number | boolean;

export type Column<T> = {
  header: string | (() => React.ReactNode);
  key?: keyof T;
  render?: (row: T) => React.ReactNode;
  searchable?: boolean;
  size?: number;
};

interface DataTableProps<T extends Record<string, Primitives>> {
  data: T[];
  columns: Column<T>[];
  bgHeader?: string;
  rowSelectionIds?: number[];
  searchableKeys?: (keyof T)[];
  search?: string;
}

export default function DataTable<T extends Record<string, Primitives>>({
  data,
  columns,
  bgHeader,
  rowSelectionIds = [],
  searchableKeys = [],
  search,
}: DataTableProps<T>) {
  const filteredRows = useMemo(() => {
    if (!search || searchableKeys.length === 0) return data;

    return data.filter((row) => {
      searchableKeys.some((k) =>
        String(row[k]).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search]);

  return (
    <Table className="min-w-[900px] w-full overflow-x-auto">
      <TableHeader
        className={`h-10 border-y border-[#D9D9D9] ${
          bgHeader ? bgHeader : "bg-[#003465] text-white"
        }`}
      >
        <TableRow className="px-3">
          {columns?.map((col, i) => {
            return (
              <TableHead
                key={i}
                className="font-medium text-xs"
                // style={{ width: `${col.size && `${col.size}px`}` }}
              >
                {typeof col.header === "string" ? col.header : col.header()}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRows.map((tr, idx) => (
          <TableRow
            key={idx}
            className={`border-b border-[#D9D9D9] h-[90px] ${
              rowSelectionIds.includes(idx) ? "bg-[#EDF0F6]" : ""
            }`}
          >
            {columns?.map((col, colIndex) => {
              return (
                <TableCell
                  key={colIndex}
                  className="px-4"
                  style={col.size ? { width: `${col.size}px` } : {}}
                >
                  {col.render ? col.render(tr) : col.key ? tr[col.key] : null}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
