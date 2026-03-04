"use client";

import DataTable, { Column } from "@/components/shared/table/DataTable";
import { ListView } from "@/components/shared/table/DataTableFilter";
import Pagination from "@/components/shared/table/pagination";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export type AdminRow = {
  id: number | string;
  ID: string;
  name: string;
  role: string;
  address: string;
  phoneNumber: string;
  email: string;
};

export default function AdminList() {
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await processRequestOfflineAuth("get", API_ENDPOINTS.GET_ADMINS);
      const raw = Array.isArray(response?.data)
        ? response.data
        : Array.isArray((response as any)?.data?.data)
          ? (response as any).data.data
          : Array.isArray(response)
            ? response
            : [];
      const rows: AdminRow[] = raw.map((a: any, index: number) => {
        const id = a.id ?? a._id ?? index + 1;
        const name =
          a.name ??
          ([a.first_name || a.firstname, a.last_name || a.lastname].filter(Boolean).join(" ") || a.email || "—");
        return {
          id,
          ID: String(a.ID ?? a.id ?? a._id ?? id),
          name,
          role: a.role ?? a.roles?.[0] ?? "—",
          address: a.address ?? "—",
          phoneNumber: a.phone_number ?? a.phoneNumber ?? a.phone ?? "—",
          email: a.email ?? "—",
        };
      });
      setAdmins(rows);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to load admins", { toastId: "admin-list-error" });
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  const filteredAdmins = admins.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.role && a.role.toLowerCase().includes(q)) ||
      (a.phoneNumber && a.phoneNumber.includes(search))
    );
  });

  const paginatedAdmins = filteredAdmins.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const columns: Column<AdminRow>[] = [
    { header: "ID", key: "ID" as keyof AdminRow, size: 100 },
    { header: "Name", key: "name" as keyof AdminRow, size: 200 },
    { header: "Role", key: "role" as keyof AdminRow, size: 150 },
    { header: "Email", key: "email" as keyof AdminRow, size: 200 },
  ];

  return (
    <section className="px-[30px] mb-10">
      <div className="flex items-center gap-4 mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="font-medium text-xl text-black">Admin List</h2>
      </div>
      <section className="p-[29px_14px_30px_24px] shadow-[0px_0px_4px_1px_#0000004D]">
        <header className="flex items-center justify-between gap-5 py-6 border-b border-[#D9D9D9]">
          <ListView pageSize={pageSize} setPageSize={setPageSize} />
          <SearchInput onSearch={setSearch} />
        </header>
        {isLoading ? (
          <div className="flex justify-center py-12 text-gray-500">Loading admins...</div>
        ) : (
          <>
            <DataTable
              columns={columns as any}
              data={paginatedAdmins as any}
              bgHeader="bg-[#003465] text-white"
            />
            <Pagination
              dataLength={filteredAdmins.length}
              numOfPages={Math.max(1, Math.ceil(filteredAdmins.length / pageSize))}
              pageSize={pageSize}
              handlePageClick={handlePageClick}
            />
          </>
        )}
      </section>
    </section>
  );
}
