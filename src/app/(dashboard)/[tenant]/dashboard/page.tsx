"use client";
import { NextPage } from "next";
import { Building2, Users, UserCircle, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import EmployeeSection from "@/components/dashboard/EmployeeSection";
import PatientsDonut from "@/components/dashboard/PatientsDonut";
import ScheduleList from "@/components/dashboard/ScheduleList";
import DepartmentsStatus from "@/components/dashboard/DepartmentsStatus";
import { processRequestAuth } from "@/framework/https";
import { API_ENDPOINTS } from "@/framework/api-endpoints";
import Cookies from "js-cookie";
import { colors } from "@/utils/dashboard";

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
  const [patientsData, setPatientsData] = useState<any[]>([]);
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [schedulesData, setSchedulesData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardStats();
    loadUserData();
    loadDashboardData();
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
        processRequestAuth("get", API_ENDPOINTS.GET_EMPLOYEE),
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
      // Structure 1: { data: { data: [...] } }
      if (Array.isArray(data?.data?.data)) {
        return data.data.data.length;
      }
      // Structure 2: { data: [...] }
      if (Array.isArray(data?.data)) {
        return data.data.length;
      }
      // Structure 3: Direct array
      if (Array.isArray(data)) {
        return data.length;
      }
      // Structure 4: { data: { count: number } }
      if (typeof data?.data?.count === "number") {
        return data.data.count;
      }
      // Structure 5: { count: number }
      if (typeof data?.count === "number") {
        return data.count;
      }
      // Structure 6: { data: { total: number } }
      if (typeof data?.data?.total === "number") {
        return data.data.total;
      }
      // Structure 7: { total: number }
      if (typeof data?.total === "number") {
        return data.total;
      }
      // Structure 8: { data: { items: [...] } }
      if (Array.isArray(data?.data?.items)) {
        return data.data.items.length;
      }
      // Structure 9: { items: [...] }
      if (Array.isArray(data?.items)) {
        return data.items.length;
      }
    } else {
      // Log error for debugging
      const error = result.reason;
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn(`${type} API returned ${error.response.status} - authentication required`);
      } else if (error?.response?.status === 500) {
        console.warn(`${type} API returned 500 - server error`);
      } else {
        console.error(`Failed to fetch ${type}:`, error);
      }
    }
    return 0;
  };

  // Load all dashboard data for components
  const loadDashboardData = async () => {
    // Load patients
    try {
      const patientsRes = await processRequestAuth("get", API_ENDPOINTS.GET_PATIENTS);
      // Handle different response structures
      const patients = Array.isArray(patientsRes?.data?.data)
        ? patientsRes.data.data
        : Array.isArray(patientsRes?.data)
        ? patientsRes.data
        : Array.isArray(patientsRes)
        ? patientsRes
        : [];
      setPatientsData(patients);
    } catch (error: any) {
      console.error("Failed to load patients:", error);
      setPatientsData([]);
    }

    // Load employees (limit to 5)
    try {
      const employeesRes = await processRequestAuth("get", API_ENDPOINTS.GET_EMPLOYEE);
      // Handle different response structures
      const employees = Array.isArray(employeesRes?.data?.data)
        ? employeesRes.data.data
        : Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : Array.isArray(employeesRes)
        ? employeesRes
        : [];
      setEmployeesData(employees.slice(0, 5)); // Limit to 5
    } catch (error: any) {
      console.error("Failed to load employees:", error);
      setEmployeesData([]);
    }

    // Load appointments
    try {
      const appointmentsRes = await processRequestAuth("get", API_ENDPOINTS.GET_APPOINTMENTS);
      // Handle different response structures
      const appointments = Array.isArray(appointmentsRes?.data?.data)
        ? appointmentsRes.data.data
        : Array.isArray(appointmentsRes?.data)
        ? appointmentsRes.data
        : Array.isArray(appointmentsRes)
        ? appointmentsRes
        : [];
      setAppointmentsData(appointments);
    } catch (error: any) {
      console.error("Failed to load appointments:", error);
      setAppointmentsData([]);
    }

    // Load departments
    try {
      const departmentsRes = await processRequestAuth("get", API_ENDPOINTS.GET_DEPARTMENTS);
      // Handle different response structures
      const departments = Array.isArray(departmentsRes?.data?.data)
        ? departmentsRes.data.data
        : Array.isArray(departmentsRes?.data)
        ? departmentsRes.data
        : Array.isArray(departmentsRes)
        ? departmentsRes
        : [];
      setDepartmentsData(departments);
    } catch (error: any) {
      console.error("Failed to load departments:", error);
      setDepartmentsData([]);
    }

    // Load schedules (handle errors gracefully - endpoint may not be available)
    try {
      const schedulesRes = await processRequestAuth("get", API_ENDPOINTS.GET_SCHEDULES);
      // Handle different response structures
      const schedules = Array.isArray(schedulesRes?.data?.data)
        ? schedulesRes.data.data
        : Array.isArray(schedulesRes?.data)
        ? schedulesRes.data
        : Array.isArray(schedulesRes)
        ? schedulesRes
        : [];
      setSchedulesData(schedules);
    } catch (error: any) {
      // Silently handle 500 errors - endpoint may not be implemented yet
      if (error?.response?.status === 500) {
        // Endpoint not available or server error - silently fail
        setSchedulesData([]);
      } else {
        // Log other errors (401, 403, 404, etc.)
        console.error("Failed to load schedules:", error);
        setSchedulesData([]);
      }
    }
  };

  // Transform patients data for PatientsDonut component
  const getPatientsDonutData = () => {
    if (patientsData.length === 0) {
      return {
        totalPatients: 0,
        ageDistribution: [
          { range: "0-18", percentage: 0, color: "#3B82F6" },
          { range: "19-30", percentage: 0, color: "#10B981" },
          { range: "31-50", percentage: 0, color: "#F59E0B" },
          { range: "51-70", percentage: 0, color: "#EF4444" },
          { range: "71+", percentage: 0, color: "#8B5CF6" },
        ],
      };
    }

    // Calculate age distribution
    const ageGroups = {
      "0-18": 0,
      "19-30": 0,
      "31-50": 0,
      "51-70": 0,
      "71+": 0,
    };

    patientsData.forEach((patient: any) => {
      const dob = patient.date_of_birth || patient.dob || patient.dateOfBirth;
      if (dob) {
        const age = calculateAge(dob);
        if (age !== undefined) {
          if (age <= 18) ageGroups["0-18"]++;
          else if (age <= 30) ageGroups["19-30"]++;
          else if (age <= 50) ageGroups["31-50"]++;
          else if (age <= 70) ageGroups["51-70"]++;
          else ageGroups["71+"]++;
        }
      }
    });

    const total = patientsData.length;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

    return {
      totalPatients: total,
      ageDistribution: [
        { range: "0-18", percentage: Math.round((ageGroups["0-18"] / total) * 100), color: colors[0] },
        { range: "19-30", percentage: Math.round((ageGroups["19-30"] / total) * 100), color: colors[1] },
        { range: "31-50", percentage: Math.round((ageGroups["31-50"] / total) * 100), color: colors[2] },
        { range: "51-70", percentage: Math.round((ageGroups["51-70"] / total) * 100), color: colors[3] },
        { range: "71+", percentage: Math.round((ageGroups["71+"] / total) * 100), color: colors[4] },
      ],
    };
  };

  // Helper function to calculate age
  const calculateAge = (dob: string): number | undefined => {
    if (!dob) return undefined;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return undefined;
    }
  };

  // Transform employees data for EmployeeSection component
  const getEmployeesForSection = () => {
    return employeesData.map((employee: any, index: number) => {
      const firstName = employee.first_name || employee.firstName || employee.firstname || employee.name?.split(" ")[0] || "";
      const lastName = employee.last_name || employee.lastName || employee.lastname || employee.name?.split(" ").slice(1).join(" ") || "";
      const name = `${firstName} ${lastName}`.trim() || employee.username || "Employee";
      const role = employee.role || employee.designation || employee.job_title || "Employee";
      const roleStr = Array.isArray(role) ? role[0] : String(role);
      const department = employee.department?.name || employee.department_name || employee.department || "General";
      const picture = employee.profile_picture || employee.profilePicture || "/assets/doctorFemale.png";
      const description = employee.bio || employee.description || `${name} is a dedicated ${roleStr} in the ${department} department.`;

      return {
        id: employee.id || employee._id || index + 1,
        name,
        role: roleStr,
        organization: department,
        description,
        image: picture,
      };
    });
  };

  // Transform appointments data for AppointmentsChart component
  const getAppointmentsChartData = () => {
    if (appointmentsData.length === 0) {
      return {
        clinic: "No appointments this week",
        weeklyGrowth: 0,
        appointmentsByDay: [
          { day: "Mon", male: 0, female: 0 },
          { day: "Tue", male: 0, female: 0 },
          { day: "Wed", male: 0, female: 0 },
          { day: "Thu", male: 0, female: 0 },
          { day: "Fri", male: 0, female: 0 },
          { day: "Sat", male: 0, female: 0 },
          { day: "Sun", male: 0, female: 0 },
        ],
      };
    }

    // Get current week dates (Monday to Sunday)
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Adjust to start from Monday (if Sunday, go back 6 days; otherwise go back to Monday)
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter appointments for this week
    const weekAppointments = appointmentsData.filter((apt: any) => {
      // Handle different date field names and formats
      const aptDateStr = apt.appointment_date || 
                        apt.date || 
                        apt.appointmentDate || 
                        apt.scheduled_date ||
                        apt.createdAt;
      
      if (!aptDateStr) return false;
      
      try {
        const aptDate = new Date(aptDateStr);
        if (isNaN(aptDate.getTime())) return false;
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      } catch {
        return false;
      }
    });

    // Group by day and gender
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const appointmentsByDay = days.map((day, dayIndex) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + dayIndex);
      
      const dayAppointments = weekAppointments.filter((apt: any) => {
        const aptDateStr = apt.appointment_date || 
                          apt.date || 
                          apt.appointmentDate || 
                          apt.scheduled_date ||
                          apt.createdAt;
        
        if (!aptDateStr) return false;
        
        try {
          const aptDate = new Date(aptDateStr);
          if (isNaN(aptDate.getTime())) return false;
          return aptDate.toDateString() === dayDate.toDateString();
        } catch {
          return false;
        }
      });

      let male = 0;
      let female = 0;

      dayAppointments.forEach((apt: any) => {
        // Try to get patient gender from various possible locations
        const gender = apt.patient?.gender || 
                      apt.patient?.sex ||
                      apt.gender || 
                      apt.patient_gender ||
                      apt.patient?.patient?.gender;
        
        if (gender) {
          const genderLower = String(gender).toLowerCase();
          if (genderLower === "male" || genderLower === "m" || genderLower === "male") {
            male++;
          } else if (genderLower === "female" || genderLower === "f" || genderLower === "female") {
            female++;
          }
        }
      });

      return { day, male, female };
    });

    // Calculate weekly growth (compare this week to last week)
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(startOfWeek.getDate() - 7);
    const lastWeekEnd = new Date(endOfWeek);
    lastWeekEnd.setDate(endOfWeek.getDate() - 7);

    const lastWeekAppointments = appointmentsData.filter((apt: any) => {
      const aptDateStr = apt.appointment_date || 
                        apt.date || 
                        apt.appointmentDate || 
                        apt.scheduled_date ||
                        apt.createdAt;
      
      if (!aptDateStr) return false;
      
      try {
        const aptDate = new Date(aptDateStr);
        if (isNaN(aptDate.getTime())) return false;
        return aptDate >= lastWeekStart && aptDate <= lastWeekEnd;
      } catch {
        return false;
      }
    });

    const thisWeekCount = weekAppointments.length;
    const lastWeekCount = lastWeekAppointments.length;
    const weeklyGrowth = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : thisWeekCount > 0 ? 100 : 0;

    return {
      clinic: "Weekly Appointments Overview",
      weeklyGrowth,
      appointmentsByDay,
    };
  };

  // Transform departments data for DepartmentsStatus component
  const getDepartmentsStatusData = () => {
    if (departmentsData.length === 0) {
      return {
        activeCount: 0,
        inactiveCount: 0,
        totalCount: 0,
        completionPercentage: 0,
      };
    }

    const activeCount = departmentsData.filter((dept: any) => {
      const status = dept.status || dept.Status || "Active";
      return status.toLowerCase() === "active";
    }).length;

    const inactiveCount = departmentsData.length - activeCount;
    const totalCount = departmentsData.length;
    const completionPercentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

    return {
      activeCount,
      inactiveCount,
      totalCount,
      completionPercentage,
    };
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
            <PatientsDonut data={getPatientsDonutData()} />
            <AppointmentsChart data={getAppointmentsChartData()} />
          </div>
          <EmployeeSection employees={getEmployeesForSection()} />
        </div>

        {/* Bottom Row: Departments Status and Schedules List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentsStatus data={getDepartmentsStatusData()} colors={colors} />
          <ScheduleList schedules={schedulesData} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
