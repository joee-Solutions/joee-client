"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, CalendarClock, Users, Building2 } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import useSWR from "swr";
import { sideNavigation } from "@/utils/navigation";
import { getRolesFromUser, isTenantAdmin } from "@/utils/permissions";
import { OrgIcon } from "@/components/icons/icon";
import { processRequestOfflineAuth } from "@/framework/offline-https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";

type SearchResultItem = {
  title: string;
  href: string;
  section: string;
  keywords: string[];
  category: "menu" | "department" | "schedule" | "appointment" | "employee" | "patient";
};

type ResultTab = "all" | "departments" | "schedules" | "appointments" | "employees" | "patients";

const TAB_LABELS: Record<ResultTab, string> = {
  all: "All",
  departments: "Departments",
  schedules: "Schedules",
  appointments: "Appointments",
  employees: "Employees",
  patients: "Patients",
};

const EMPTY_LABELS: Record<Exclude<ResultTab, "all">, string> = {
  departments: "No departments found",
  schedules: "No schedules found",
  appointments: "No appointments found",
  employees: "No employees found",
  patients: "No patients found",
};

function departmentsListFromResponse(res: unknown): Record<string, unknown>[] {
  if (!res) return [];
  const r = res as { data?: unknown };
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
  const nested = r.data as { data?: unknown[] } | undefined;
  if (Array.isArray(nested?.data)) return nested.data as Record<string, unknown>[];
  if (Array.isArray(res)) return res as Record<string, unknown>[];
  return [];
}

function departmentSlugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>("all");

  const userFromCookie = useMemo(() => {
    try {
      const raw = Cookies.get("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const roles = getRolesFromUser(userFromCookie);
  const canSeeAll = isTenantAdmin(roles);

  const searchableMenu = useMemo<SearchResultItem[]>(() => {
    const allowedNav = canSeeAll
      ? sideNavigation
      : sideNavigation.filter((item) => item.tenantUserAllowed === true);

    const results: SearchResultItem[] = [];

    allowedNav.forEach((item) => {
      const hrefLower = (item.href || "").toLowerCase();
      let category: SearchResultItem["category"] = "menu";
      if (hrefLower.includes("schedule")) category = "schedule";
      else if (hrefLower.includes("appointment")) category = "appointment";
      else if (hrefLower.includes("employee")) category = "employee";
      else if (hrefLower.includes("patient")) category = "patient";
      else if (hrefLower.includes("department")) category = "department";

      results.push({
        title: item.name,
        href: item.href,
        section: "Menu",
        keywords: [item.name, item.href, "dashboard", "menu"],
        category,
      });

      if (item.children?.length) {
        item.children.forEach((child) => {
          const chref = (child.href || "").toLowerCase();
          let childCat: SearchResultItem["category"] = "menu";
          if (chref.includes("schedule")) childCat = "schedule";
          else if (chref.includes("appointment")) childCat = "appointment";
          else if (chref.includes("employee")) childCat = "employee";
          else if (chref.includes("patient")) childCat = "patient";
          else if (chref.includes("department")) childCat = "department";
          results.push({
            title: child.title,
            href: child.href,
            section: item.name,
            keywords: [child.title, child.href, item.name, "menu"],
            category: childCat,
          });
        });
      }
    });

    return results;
  }, [canSeeAll]);

  const { data: departmentsResponse } = useSWR(
    API_ENDPOINTS.GET_DEPARTMENTS,
    async (url: string) => processRequestOfflineAuth("get", url),
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  const departmentSearchHits = useMemo<SearchResultItem[]>(() => {
    const raw = departmentsListFromResponse(departmentsResponse);

    return raw.map((dept, index) => {
      const name =
        String(dept.name ?? dept.department_name ?? `Department ${index + 1}`);
      const code = String(dept.code ?? dept.department_code ?? "");
      const desc = String(dept.description ?? dept.departmentDescription ?? "");
      const id = String(dept.id ?? dept._id ?? "");
      const slug = departmentSlugFromName(name);
      return {
        title: name,
        href: `/dashboard/departments/${slug}`,
        section: "Departments",
        keywords: [name, code, desc, id, "department", "departments"],
        category: "department" as const,
      };
    });
  }, [departmentsResponse]);

  const allSearchable = useMemo(
    () => [...searchableMenu, ...departmentSearchHits],
    [searchableMenu, departmentSearchHits]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allSearchable.filter((item) => {
      const haystack =
        `${item.title} ${item.href} ${item.section} ${item.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [searchQuery, allSearchable]);

  const categorizedResults = useMemo(() => {
    return {
      departments: searchResults.filter((item) => item.category === "department"),
      schedules: searchResults.filter((item) => item.category === "schedule"),
      appointments: searchResults.filter((item) => item.category === "appointment"),
      employees: searchResults.filter((item) => item.category === "employee"),
      patients: searchResults.filter((item) => item.category === "patient"),
    };
  }, [searchResults]);

  const visibleResults = useMemo(() => {
    if (activeTab === "all") return searchResults;
    return categorizedResults[activeTab];
  }, [activeTab, searchResults, categorizedResults]);

  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/dashboard/search");
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 150);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#003465] mb-6">Search</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search organizations, employees, patients, appointments, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 h-[50px] rounded-[30px] pl-5 pr-14 bg-[#E4E8F2] outline-none focus:outline-2 focus:outline-[#003465] text-base"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-4 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <SearchIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </form>

        {/* Search Results */}
        {isSearching ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
          </div>
        ) : searchQuery ? (
          <div>
            <h2 className="text-[34px] font-semibold text-[#003465] leading-tight">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-[#6b7280] text-[22px] mt-2 mb-6">
              Found {searchResults.length} results across all entities
            </p>

            <div className="flex items-center gap-7 border-b border-[#E5E7EB] mb-8 overflow-x-auto">
              {(
                [
                  "all",
                  "departments",
                  "schedules",
                  "appointments",
                  "employees",
                  "patients",
                ] as ResultTab[]
              ).map((tab) => {
                const count =
                  tab === "all" ? searchResults.length : categorizedResults[tab].length;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-[20px] whitespace-nowrap border-b-2 transition-colors ${
                      isActive
                        ? "border-[#003465] text-[#003465] font-medium"
                        : "border-transparent text-[#4b5563] hover:text-[#003465]"
                    }`}
                  >
                    {TAB_LABELS[tab]} ({count})
                  </button>
                );
              })}
            </div>

            {activeTab === "all" ? (
              <div className="space-y-8">
                {(
                  [
                    "departments",
                    "schedules",
                    "appointments",
                    "employees",
                    "patients",
                  ] as Exclude<ResultTab, "all">[]
                ).map((tab) => (
                  <div key={tab} className="space-y-4">
                    <div className="flex items-center gap-2 text-[#111827]">
                      {tab === "departments" ? (
                        <Building2 className="size-5" />
                      ) : tab === "schedules" ? (
                        <OrgIcon className="size-5" />
                      ) : tab === "appointments" ? (
                        <CalendarClock className="size-5" />
                      ) : (
                        <Users className="size-5" />
                      )}
                      <h3 className="text-[36px] font-semibold">
                        {TAB_LABELS[tab]} ({categorizedResults[tab].length})
                      </h3>
                    </div>
                    {categorizedResults[tab].length === 0 ? (
                      <p className="text-[32px] text-[#6b7280]">{EMPTY_LABELS[tab]}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categorizedResults[tab].map((result, index) => (
                          <Link
                            key={`${tab}-${result.href}-${index}`}
                            href={result.href}
                            className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                          >
                            <p className="text-base font-semibold text-[#003465]">{result.title}</p>
                            <p className="text-sm text-gray-600">{result.href}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {visibleResults.length === 0 ? (
                  <p className="text-[32px] text-[#6b7280]">{EMPTY_LABELS[activeTab]}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleResults.map((result, index) => (
                      <Link
                        key={`${activeTab}-${result.href}-${index}`}
                        href={result.href}
                        className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        <p className="text-base font-semibold text-[#003465]">{result.title}</p>
                        <p className="text-sm text-gray-600">{result.href}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search query to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

