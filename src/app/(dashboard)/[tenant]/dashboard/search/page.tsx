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
import { arrayFromApiResponse } from "@/utils/api-array";

type SearchResultItem = {
  title: string;
  href: string;
  section: string;
  keywords: string[];
  category: "menu" | "department" | "schedule" | "appointment" | "employee" | "patient";
  /** Middle segment of breadcrumb, e.g. "Department", "Employee". */
  entityLabel: string;
  /** Last segment of breadcrumb (usually the result name). */
  breadcrumbItem: string;
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

function departmentSlugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function employeeHrefFromUser(user: Record<string, unknown>): string {
  const first = String(user.first_name ?? user.firstName ?? user.firstname ?? "").trim();
  const last = String(user.last_name ?? user.lastName ?? user.lastname ?? "").trim();
  const name = `${first} ${last}`.trim() || String(user.username ?? user.email ?? "employee");
  return `/dashboard/employees/${name.split(/\s+/).join("-")}`;
}

function patientDisplayName(p: Record<string, unknown>): string {
  const first = String(p.first_name ?? p.firstName ?? "").trim();
  const middle = String(p.middle_name ?? p.middleName ?? "").trim();
  const last = String(p.last_name ?? p.lastName ?? "").trim();
  const joined = [first, middle, last].filter(Boolean).join(" ").trim();
  return joined || String(p.name ?? p.full_name ?? p.email ?? "Patient");
}

const swrOpts = {
  revalidateOnFocus: true,
  refreshInterval: 30000,
  dedupingInterval: 5000,
};

function SearchResultCard({
  result,
  organizationName,
}: {
  result: SearchResultItem;
  organizationName: string;
}) {
  const trail = `${organizationName} > ${result.entityLabel} > ${result.breadcrumbItem}`;
  return (
    <Link
      href={result.href}
      className="block rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow hover:border-[#003465]/25 hover:shadow-md"
    >
      <p className="text-base font-semibold text-[#003465]">{result.title}</p>
      <p className="mt-2 text-xs font-medium leading-relaxed text-[#64748b]">{trail}</p>
    </Link>
  );
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

  const organizationName = useMemo(() => {
    const u = userFromCookie;
    return (
      String(
        u?.name ??
          u?.organization_name ??
          u?.domain ??
          u?.tenant?.name ??
          u?.tenant_name ??
          ""
      ).trim() || "Organization"
    );
  }, [userFromCookie]);

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
        entityLabel: "Navigation",
        breadcrumbItem: item.name,
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
            entityLabel: "Navigation",
            breadcrumbItem: child.title,
          });
        });
      }
    });

    return results;
  }, [canSeeAll]);

  const fetcher = (url: string) => processRequestOfflineAuth("get", url);

  const { data: departmentsResponse } = useSWR(API_ENDPOINTS.GET_DEPARTMENTS, fetcher, swrOpts);
  const { data: employeesResponse } = useSWR(API_ENDPOINTS.GET_EMPLOYEE, fetcher, swrOpts);
  const { data: patientsResponse } = useSWR(API_ENDPOINTS.GET_PATIENTS, fetcher, swrOpts);
  const { data: appointmentsResponse } = useSWR(API_ENDPOINTS.GET_APPOINTMENTS, fetcher, swrOpts);
  const { data: schedulesResponse } = useSWR(API_ENDPOINTS.GET_SCHEDULES, fetcher, swrOpts);

  const departmentSearchHits = useMemo<SearchResultItem[]>(() => {
    const raw = arrayFromApiResponse(departmentsResponse);
    return raw.map((dept, index) => {
      const name = String(dept.name ?? dept.department_name ?? `Department ${index + 1}`);
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
        entityLabel: "Department",
        breadcrumbItem: name,
      };
    });
  }, [departmentsResponse]);

  const employeeSearchHits = useMemo<SearchResultItem[]>(() => {
    const raw = arrayFromApiResponse(employeesResponse);
    return raw.map((user, index) => {
      const first = String(user.first_name ?? user.firstName ?? user.firstname ?? "").trim();
      const last = String(user.last_name ?? user.lastName ?? user.lastname ?? "").trim();
      const fullName = `${first} ${last}`.trim() || String(user.username ?? user.email ?? `Employee ${index + 1}`);
      const email = String(user.email ?? user.email_address ?? "");
      const designation = String(user.role ?? user.designation ?? user.job_title ?? "");
      const dept =
        typeof user.department === "object" && user.department !== null
          ? String((user.department as { name?: string }).name ?? "")
          : String(user.department_name ?? user.department ?? "");
      const id = String(user.id ?? user._id ?? index);
      return {
        title: fullName,
        href: employeeHrefFromUser(user),
        section: "Employees",
        keywords: [fullName, email, designation, dept, id, "employee"],
        category: "employee" as const,
        entityLabel: "Employee",
        breadcrumbItem: fullName,
      };
    });
  }, [employeesResponse]);

  const patientSearchHits = useMemo<SearchResultItem[]>(() => {
    const raw = arrayFromApiResponse(patientsResponse);
    return raw.map((p, index) => {
      const name = patientDisplayName(p);
      const email = String(p.email ?? "");
      const phone = String(p.phone ?? p.phone_number ?? p.phoneNumber ?? "");
      const ailment = String(p.ailment ?? p.diagnosis ?? "");
      const id = String(p.id ?? p._id ?? index);
      return {
        title: name,
        href: `/dashboard/patients/${encodeURIComponent(id)}`,
        section: "Patients",
        keywords: [name, email, phone, ailment, id, "patient"],
        category: "patient" as const,
        entityLabel: "Patient",
        breadcrumbItem: name,
      };
    });
  }, [patientsResponse]);

  const appointmentSearchHits = useMemo<SearchResultItem[]>(() => {
    const raw = arrayFromApiResponse(appointmentsResponse);
    return raw.map((a: Record<string, unknown>, index: number) => {
      const patient = (a.patient ?? {}) as Record<string, unknown>;
      const user = (a.user ?? {}) as Record<string, unknown>;
      const fromPatientRecord = [
        patient.first_name,
        patient.middle_name,
        patient.last_name,
      ]
        .filter(Boolean)
        .join(" ");
      const patientName = String(
        a.patientName ?? (fromPatientRecord || "")
      ).trim();
      const fromUser = [user.firstname, user.lastname].filter(Boolean).join(" ");
      const doctorName = String(
        a.doctorName ?? (fromUser || String(user.name ?? "") || "")
      ).trim();
      const id = String(a.id ?? a.appointmentId ?? index);
      const dateStr = String(a.date ?? a.appointmentDate ?? a.scheduledAt ?? a.createdAt ?? "");
      const deptRaw = a.department;
      const dept =
        typeof deptRaw === "object" && deptRaw !== null
          ? String((deptRaw as { name?: string }).name ?? "")
          : String(deptRaw ?? a.departmentName ?? "");
      const title = patientName ? `Appointment — ${patientName}` : `Appointment (${id})`;
      return {
        title,
        href: "/dashboard/appointments",
        section: "Appointments",
        keywords: [patientName, doctorName, id, dateStr, dept, String(a.description ?? a.notes ?? ""), "appointment"],
        category: "appointment" as const,
        entityLabel: "Appointment",
        breadcrumbItem: patientName || id,
      };
    });
  }, [appointmentsResponse]);

  const scheduleSearchHits = useMemo<SearchResultItem[]>(() => {
    const raw = arrayFromApiResponse(schedulesResponse);
    return raw.map((schedule: Record<string, unknown>, scheduleIndex: number) => {
      const u = (schedule.user ?? {}) as Record<string, unknown>;
      const userFirstname = String(u.firstname ?? u.first_name ?? u.firstName ?? "");
      const userLastname = String(u.lastname ?? u.last_name ?? u.lastName ?? "");
      const employeeName = `${userFirstname} ${userLastname}`.trim() || "Staff";
      const department = String(
        typeof schedule.department === "object" && schedule.department !== null
          ? (schedule.department as { name?: string }).name ?? ""
          : schedule.department ??
              (schedule.employee as { department?: { name?: string } } | undefined)?.department?.name ??
              schedule.department_name ??
              ""
      );
      const kw: string[] = [employeeName, department, String(schedule.id ?? schedule._id ?? scheduleIndex)];
      const days = schedule.availableDays;
      if (Array.isArray(days)) {
        days.forEach((d: Record<string, unknown>) => {
          kw.push(String(d.day ?? ""), String(d.startTime ?? d.start_time ?? ""), String(d.endTime ?? d.end_time ?? ""));
        });
      } else {
        kw.push(
          String(schedule.date ?? schedule.schedule_date ?? ""),
          String(schedule.start_time ?? schedule.startTime ?? ""),
          String(schedule.end_time ?? schedule.endTime ?? "")
        );
      }
      const id = String(schedule.id ?? schedule._id ?? scheduleIndex);
      return {
        title: `Schedule — ${employeeName}`,
        href: "/dashboard/schedules",
        section: "Schedules",
        keywords: kw,
        category: "schedule" as const,
        entityLabel: "Schedule",
        breadcrumbItem: employeeName,
      };
    });
  }, [schedulesResponse]);

  const allSearchable = useMemo(
    () =>
      [
        ...searchableMenu,
        ...departmentSearchHits,
        ...employeeSearchHits,
        ...patientSearchHits,
        ...appointmentSearchHits,
        ...scheduleSearchHits,
      ],
    [
      searchableMenu,
      departmentSearchHits,
      employeeSearchHits,
      patientSearchHits,
      appointmentSearchHits,
      scheduleSearchHits,
    ]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allSearchable.filter((item) => {
      const haystack = `${item.title} ${item.section} ${item.keywords.join(" ")}`.toLowerCase();
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

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search departments, employees, patients, appointments, schedules..."
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

        {isSearching ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
          </div>
        ) : searchQuery ? (
          <div>
            <h2 className="text-[34px] font-semibold text-[#003465] leading-tight">
              Search Results for &quot;{searchQuery}&quot;
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
                          <SearchResultCard
                            key={`${tab}-${result.href}-${result.title}-${index}`}
                            result={result}
                            organizationName={organizationName}
                          />
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
                      <SearchResultCard
                        key={`${activeTab}-${result.href}-${result.title}-${index}`}
                        result={result}
                        organizationName={organizationName}
                      />
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
