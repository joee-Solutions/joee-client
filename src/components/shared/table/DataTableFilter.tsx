import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListFilter } from "lucide-react";
import { useState } from "react";

export default function DataTableFilter() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-[34px] mt-6">
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ”Organizations”"
          className="py-[10px] pr-[10px] pl-5 bg-[#EDF0F6] w-full font-normal text-xs text-[#999999] h-full outline-none"
        />
      </div>

      {/* Sort */}
      <div>
        <Select
          value={sortBy}
          onValueChange={(sortVal: string) => {
            setSortBy(sortVal);
          }}
        >
          <SelectTrigger className="h-full rounded-[8px] border border-[#B2B2B2] focus:ring-transparent">
            <SelectValue placeholder={sortBy ? sortBy : "Sort by"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {["Name", "Date", "Location", "Status"].map((currSortVal) => (
              <SelectItem
                key={currSortVal}
                value={`${currSortVal}`}
                className="cursor-pointer"
              >
                {currSortVal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div>
        <Select
          value={status}
          onValueChange={(statusVal: string) => {
            setStatus(statusVal);
          }}
        >
          <SelectTrigger className="h-full rounded-[8px] border border-[#B2B2B2] focus:ring-transparent">
            <SelectValue placeholder={status ? status : "Status"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {["Active", "Inactive"].map((currSortVal) => (
              <SelectItem
                key={currSortVal}
                value={`${currSortVal}`}
                className="cursor-pointer"
              >
                {currSortVal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Button Filter */}

      <Button className="font-medium text-base text-white bg-[#003465]">
        Filter <ListFilter />
      </Button>
    </div>
  );
}

interface ListViewProps {
  pageSize: number;
  setPageSize: (val: number) => void;
}

export function ListView({ pageSize, setPageSize }: ListViewProps) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-base font-normal">Show</p>
      <Select
        value={`${pageSize}`}
        onValueChange={(value: string) => {
          setPageSize(Number(value));
        }}
      >
        <SelectTrigger className="h-9 w-[66px] rounded-[8px] border border-[#B2B2B2] focus:ring-transparent">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side="top" className="bg-white">
          {[10, 15, 20, 25, 50].map((currPageSize) => (
            <SelectItem
              key={currPageSize}
              value={`${currPageSize}`}
              className="cursor-pointer hover:bg-[#003465] hover:text-white"
            >
              {currPageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
