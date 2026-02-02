"use client";
import { NextPage } from "next";
import { Building2, Users, UserCircle, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import EmployeeSection from "@/components/dashboard/EmployeeSection";
import PatientsDonut from "@/components/dashboard/PatientsDonut";
import OrganizationList from "@/components/dashboard/OrganizationList";
import DepartmentsStatus from "@/components/dashboard/DepartmentsStatus";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import Cookies from "js-cookie";
import {
  appointmentsData,
  colors,
  employees,
  organizations,
  departmentsStats,
  patientData,
} from "@/utils/dashboard";

interface DashboardStats {
  departments: { count: number; growth: number | null; icon: React.ReactElement };
  employees: { count: number; growth: number | null; icon: React.ReactElement };
  patients: { count: number; growth: number | null; icon: React.ReactElement };
  appointments: { count: number; growth: number | null; icon: React.ReactElement };
}

const DashboardPage: NextPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    departments: { 
      count: 0, 
      growth: null, 
      icon: <Building2 className="text-white size-5" /> 
    },
    employees: { 
      count: 0, 
      growth: null, 
      icon: <Users className="text-white size-5" /> 
    },
    patients: { 
      count: 0, 
      growth: null, 
      icon: <UserCircle className="text-white size-5" /> 
    },
    appointments: { 
      count: 0, 
      growth: null, 
      icon: <CalendarClock className="text-white size-5" /> 
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadDashboardStats();
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Load user data from cookies (set during login)
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from cookies:", error);
      }
    }
  };

  // Extract user name - matching MainHeader logic
  const getUserName = () => {
    if (!userData) return "User";
    
    // Try to get first and last name
    const firstName = userData.first_name || userData.firstname || userData.firstName || userData.name?.split(" ")[0] || "";
    const lastName = userData.last_name || userData.lastname || userData.lastName || userData.name?.split(" ").slice(1).join(" ") || "";
    
    // Build full name
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (fullName) {
      return fullName;
    } else if (userData.name) {
      return userData.name;
    } else if (userData.username) {
      return userData.username;
    } else if (userData.email) {
      return userData.email.split("@")[0];
    }
    
    return "User";
  };

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all stats in parallel
      const [departmentsRes, patientsRes, appointmentsRes, usersRes] = await Promise.allSettled([
        processRequestAuth("get", API_ENDPOINTS.GET_DEPARTMENTS),
        processRequestAuth("get", API_ENDPOINTS.GET_PATIENTS),
        processRequestAuth("get", API_ENDPOINTS.GET_APPOINTMENTS),
        processRequestAuth("get", API_ENDPOINTS.GET_USERS),
      ]);

      // Extract counts from responses
      const departmentsCount = getCountFromResponse(departmentsRes, "departments");
      const patientsCount = getCountFromResponse(patientsRes, "patients");
      const appointmentsCount = getCountFromResponse(appointmentsRes, "appointments");
      const usersCount = getCountFromResponse(usersRes, "users");

      setStats({
        departments: { 
          count: departmentsCount, 
          growth: null, // TODO: Calculate growth from historical data
          icon: <Building2 className="text-white size-5" /> 
        },
        employees: { 
          count: usersCount, 
          growth: null, // TODO: Calculate growth from historical data
          icon: <Users className="text-white size-5" /> 
        },
        patients: { 
          count: patientsCount, 
          growth: null, // TODO: Calculate growth from historical data
          icon: <UserCircle className="text-white size-5" /> 
        },
        appointments: { 
          count: appointmentsCount, 
          growth: null, // TODO: Calculate growth from historical data
          icon: <CalendarClock className="text-white size-5" /> 
        },
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract count from API response
  const getCountFromResponse = (result: PromiseSettledResult<any>, type: string): number => {
    if (result.status === "fulfilled") {
      const data = result.value;
      // Handle different response structures
      if (Array.isArray(data?.data)) {
        return data.data.length;
      } else if (Array.isArray(data)) {
        return data.length;
      } else if (typeof data?.data?.count === "number") {
        return data.data.count;
      } else if (typeof data?.count === "number") {
        return data.count;
      } else if (typeof data?.data?.total === "number") {
        return data.data.total;
      } else if (typeof data?.total === "number") {
        return data.total;
      }
    } else {
      // Log error for debugging
      const error = result.reason;
      if (error?.response?.status === 401) {
        console.warn(`${type} API returned 401 - authentication required`);
      } else {
        console.error(`Failed to fetch ${type}:`, error);
      }
    }
    return 0;
  };
  
  return (
    <div className="min-h-screen w-full mb-10">
      <main className="w-full py-6 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center md:items-start gap-1 py-2">
          <div className="flex md:flex-col items-center md:items-start gap-1">
            <h1 className="text-[18px] md:text-[20px] font-medium text-[#595959]">
              Welcome back,
            </h1>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#003465]">
              {getUserName()}!
            </h2>
          </div>
          <span className="text-[#737373] text-[12px]">
            Manage your healthcare operations and stay updated with real-time insights.
          </span>
        </div>

        {/* Top Row: 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Departments"
            value={stats.departments.count}
            growth={stats.departments.growth}
            color="blue"
            icon={stats.departments.icon}
            href="/dashboard/departments"
          />
          <StatCard
            title="Employees"
            value={stats.employees.count}
            growth={stats.employees.growth}
            color="green"
            icon={stats.employees.icon}
            href="/dashboard/employees"
          />
          <StatCard
            title="Patients"
            value={stats.patients.count}
            growth={stats.patients.growth}
            color="yellow"
            icon={stats.patients.icon}
            href="/dashboard/patients"
          />
          <StatCard
            title="Appointments"
            value={stats.appointments.count}
            growth={stats.appointments.growth}
            color="red"
            icon={stats.appointments.icon}
            href="/dashboard/appointments"
          />
        </div>

        {/* Middle Row: Charts and Employees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-4">
            <PatientsDonut data={patientData} />
            <AppointmentsChart data={appointmentsData} />
          </div>
          <EmployeeSection employees={employees} />
        </div>

        {/* Bottom Row: Departments Status and Organizations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentsStatus data={departmentsStats} colors={colors} />
          <OrganizationList organizations={organizations} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
