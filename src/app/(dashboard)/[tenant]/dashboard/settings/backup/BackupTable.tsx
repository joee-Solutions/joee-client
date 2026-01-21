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
import { Checkbox } from "@/components/ui/Checkbox";

type Primitives = string | number | boolean;

interface BackupTableProps<T extends Record<string, Primitives>> {
  tableColumnNames: string[];
  tableRows: T[];
  tableTitle: string;
}

export default function BackupTable<T extends Record<string, Primitives>>({
  tableTitle,
  tableColumnNames,
  tableRows,
}: BackupTableProps<T>) {
  const [columnSort, setColumnSort] = useState<
    `${string} ASC` | `${string} DESC`
  >();
  const [sortBy, setSortBy] = useState("");
  const [rowSelectionIds, setRowSelectionIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const handleColumnSort = (sortVal: `${string} ASC` | `${string} DESC`) => {
    setColumnSort(sortVal);
  };

  const handleRowSelection = (val: number) => {
    if (rowSelectionIds.includes(val)) {
      setRowSelectionIds((prev) => {
        const index = prev.indexOf(val);

        const res = [...prev];
        res.splice(index, 1);
        return res;
      });
      return;
    }
    setRowSelectionIds((prev) => {
      return [...prev, val];
    });
  };

  const handleRowSelectionAll = () => {
    const ids = tableRows.map((_, idx) => idx);

    if (rowSelectionIds.length > 0) {
      setRowSelectionIds([]);
      return;
    }

    setRowSelectionIds(ids);
  };

  const keys =
    tableRows.length > 0 ? (Object.keys(tableRows[0]) as (keyof T)[]) : [];

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

          <Button
            type="button"
            className="h-[50px] text-[#737373] bg-[#E6EBF0] font-normal text-base rounded-[8px] border border-[#B2B2B2] focus:ring-transparent min-w-[140px]"
          >
            <MdOutlineRestorePage size={20} />
            Restore all
          </Button>
          <Button
            type="button"
            className="h-[50px] text-[#737373] bg-[#E6EBF0] font-normal text-base rounded-[8px] border border-[#B2B2B2] focus:ring-transparent min-w-[140px]"
          >
            <FaRegTrashAlt size={20} />
            Delete all
          </Button>
        </div>
      </header>
      <div className="mt-10">
        <Table>
          <TableHeader className="h-[60px] border-y border-[#D9D9D9] bg-[#003465]">
            <TableRow className="">
              {tableColumnNames.map((col, i) => {
                return (
                  <>
                    {i === 0 && (
                      <TableHead
                        key="Checkbox"
                        className="px-4 w-2 font-medium text-base text-white"
                      >
                        <Checkbox
                          size={20}
                          onChange={() => handleRowSelectionAll()}
                          checked={
                            rowSelectionIds.length < tableRows.length
                              ? false
                              : rowSelectionIds.length === tableRows.length
                              ? true
                              : false
                          }
                        />
                      </TableHead>
                    )}
                    <TableHead
                      key={col}
                      className="font-medium text-base text-white"
                    >
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
                  </>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((tr, idx) => (
              <TableRow
                key={idx}
                className={`border-b border-[#D9D9D9] h-[90px] ${
                  rowSelectionIds.includes(idx) ? "bg-[#EDF0F6]" : ""
                }`}
              >
                <TableCell className="w-2 px-4">
                  <Checkbox
                    size={20}
                    checked={rowSelectionIds.includes(idx)}
                    onChange={() => handleRowSelection(idx)}
                  />
                </TableCell>
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
                  <Button type="button">
                    <EllipsisVertical size={24} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination 
          dataLength={5} 
          numOfPages={7} 
          pageSize={5} 
          handlePageClick={handlePageClick}
        />
      </div>
    </section>
  );
}
