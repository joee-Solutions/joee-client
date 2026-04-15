// src/components/DataTable.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Primitives = string | number | boolean;

export type Column<T> = {
  header: string | (() => React.ReactNode);
  key?: keyof T;
  render?: (row: T, index?: number) => React.ReactNode;
  searchable?: boolean;
  size?: number;
};

interface DataTableProps<T extends Record<string, Primitives>> {
  data?: T[];
  columns?: Column<T>[];
  bgHeader?: string;
  rowSelectionIds?: number[];
  searchableKeys?: (keyof T)[];
  search?: string;
  children?: React.ReactNode;
  tableDataObj?: any;
  showAction?: boolean;
  /** When set, clicking a row (except where propagation is stopped) runs this handler. */
  onRowClick?: (row: T, index: number) => void;
}

export default function DataTable<T extends Record<string, Primitives>>({
  data,
  columns,
  bgHeader,
  rowSelectionIds = [],
  searchableKeys = [],
  search,
  children,
  tableDataObj,
  showAction,
  onRowClick,
}: DataTableProps<T>) {
  // If children are provided, render them instead of auto-generated rows
  if (children) {
    return (
      <Table className="w-full min-w-[600px] md:min-w-[800px] lg:min-w-[900px]">
        {columns && columns.length > 0 && (
          <TableHeader
            className={`h-10 border-y-2 border-[#D9D9D9] ${
              bgHeader ? bgHeader : "bg-[#003465] text-white"
            }`}
          >
            <TableRow className="px-3">
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className="font-medium text-xs"
                  style={col.size ? { width: `${col.size}px` } : undefined}
                >
                  {typeof col.header === "string" ? col.header : col.header()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {children}
        </TableBody>
      </Table>
    );
  }

  // Original auto-generated table logic
  const filteredRows = useMemo(() => {
    if (!data || !search || searchableKeys.length === 0) return data || [];

    return data.filter((row) =>
      searchableKeys.some((k) =>
        String(row[k]).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchableKeys]);

  return (
    <Table className="w-full min-w-[600px] md:min-w-[800px] lg:min-w-[900px]">
      <TableHeader
        className={`h-10 border-y-2 border-[#D9D9D9] ${
          bgHeader ? bgHeader : "bg-[#003465] text-white"
        }`}
      >
        <TableRow className="px-3">
          {columns && columns.length > 0 ? (
            columns.map((col, i) => (
              <TableHead
                key={i}
                className="font-medium text-xs"
                style={col.size ? { width: `${col.size}px` } : undefined}
              >
                {typeof col.header === "string" ? col.header : col.header()}
              </TableHead>
            ))
          ) : (
            <TableHead className="font-medium text-xs">No columns</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRows.map((tr, idx) => (
          <TableRow
            key={idx}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(tr, idx) : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(tr, idx);
                    }
                  }
                : undefined
            }
            className={cn(
              "border-b border-[#D9D9D9] h-[90px]",
              rowSelectionIds.includes(idx) && "bg-[#EDF0F6]",
              onRowClick && "cursor-pointer hover:bg-[#F7FAFF]/90"
            )}
          >
            {columns?.map((col, colIndex) => (
              <TableCell
                key={colIndex}
                className="px-4"
                style={col.size ? { width: `${col.size}px` } : undefined}
              >
                {col.render ? col.render(tr, idx) : col.key ? tr[col.key] : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
