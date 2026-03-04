import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { MdOutlineRestorePage } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { RiExpandUpDownFill } from "react-icons/ri";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EllipsisVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/components/shared/table/pagination";

type Primitives = string | number | boolean;

interface BackupTableProps<T extends Record<string, Primitives>> {
  tableColumnNames: string[];
  tableRows: T[];
  tableTitle: string;
  loading?: boolean;
  onRestore?: (backupId: string | number) => void;
  onDelete?: (backupId: string | number) => void;
}

export default function BackupTable<T extends Record<string, Primitives>>({
  tableTitle,
  tableColumnNames,
  tableRows,
  loading = false,
  onRestore,
  onDelete,
}: BackupTableProps<T>) {
  const [columnSort, setColumnSort] = useState<
    `${string} ASC` | `${string} DESC`
  >();
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const handleColumnSort = (sortVal: `${string} ASC` | `${string} DESC`) => {
    setColumnSort(sortVal);
  };

  const keys =
    tableRows.length > 0
      ? (Object.keys(tableRows[0]).filter((k) => k !== "id") as (keyof T)[])
      : [];

  return (
    <section className="py-10">
      <header className="flex items-center gap-10 justify-between">
        <h2 className="font-medium text-xl text-black">{tableTitle}</h2>
        <div className="flex items-center gap-[10px]">
          <Select
            value={sortBy}
            onValueChange={(sortVal: string) => {
              setSortBy(sortVal);
            }}
          >
            <SelectTrigger className="h-[50px] rounded-[8px] bg-[#E6EBF0] border border-[#B2B2B2] focus:ring-transparent min-w-[140px]">
              <SelectValue placeholder={sortBy ? sortBy : "Sort by"} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {["Name", "Date", "Location", "Status"].map((currSortVal) => (
                <SelectItem
                  key={currSortVal}
                  value={`${currSortVal}`}
                  className="cursor-pointer hover:bg-[#003465] hover:text-white"
                >
                  {currSortVal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>
      <div className="mt-10">
        <Table>
          <TableHeader className="h-[60px] border-y border-[#D9D9D9] bg-[#003465]">
            <TableRow className="">
              {tableColumnNames.map((col, i) => (
                <TableHead key={col} className="font-medium text-base text-white">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        className={`flex items-center gap-2 text-base focus-visible:ring-0 ${
                          i === 0 && "pl-1"
                        }`}
                      >
                        {col}{" "}
                        {col.toLowerCase() !== "actions" && (
                          <RiExpandUpDownFill />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-24 bg-white">
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-[#003465] hover:text-white"
                        onClick={() => handleColumnSort(`${col} ASC`)}
                      >
                        <ArrowUp />
                        ASC
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-[#003465] hover:text-white"
                        onClick={() => handleColumnSort(`${col} DESC`)}
                      >
                        <ArrowDown />
                        DESC
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColumnNames.length} className="text-center py-10 text-gray-500">
                  Loading backups...
                </TableCell>
              </TableRow>
            ) : (
            tableRows.map((tr, idx) => (
              <TableRow
                key={idx}
                className="border-b border-[#D9D9D9] h-[90px]"
              >
                {keys.map((key) => {
                  return (
                    <TableCell key={key as string} className="px-4">
                      {tr[key]}
                    </TableCell>
                  );
                })}
                <TableCell
                  className={`${
                    !tableColumnNames.includes("Actions") && "hidden"
                  } w-10`}
                >
                  {"id" in tr && (tr as any).id != null ? (
                    <div className="flex items-center gap-2">
                      {onRestore && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onRestore((tr as any).id)}
                          className="h-[36px] text-[#003465] border-[#003465] hover:bg-[#003465] hover:text-white"
                        >
                          <MdOutlineRestorePage size={18} className="mr-1" />
                          Restore
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete((tr as any).id)}
                          className="h-[36px] text-[#EC0909] border-[#EC0909] hover:bg-[#EC0909] hover:text-white"
                        >
                          <FaRegTrashAlt size={16} className="mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button type="button">
                      <EllipsisVertical size={24} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
        <Pagination
          dataLength={tableRows.length}
          numOfPages={Math.max(1, Math.ceil(tableRows.length / 10))}
          pageSize={10}
          handlePageClick={handlePageClick}
        />
      </div>
    </section>
  );
}
