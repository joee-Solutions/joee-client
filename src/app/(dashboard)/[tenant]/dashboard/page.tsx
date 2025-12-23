"use client";
import { NextPage } from "next";
// import Head from 'next/head';
import StatCard from "@/components/dashboard/StatCard";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import EmployeeSection from "@/components/dashboard/EmployeeSection";
import PatientsDonut from "@/components/dashboard/PatientsDonut";
import OrganizationList from "@/components/dashboard/OrganizationList";
import OrganizationStatus from "@/components/dashboard/OrganizationStatus";
import {
  appointmentsData,
  colors,
  employees,
  organizations,
  organizationStats,
  patientData,
} from "@/utils/dashboard";
// import { Organization, Employee, Patient } from '@/lib/types';

const DashboardPage: NextPage = () => {
  const stats = {
    allOrganizations: { count: 490, growth: null, icon: <></> },
    activeOrganizations: { count: 250, growth: 2.45, icon: <></>},
    inactiveOrganizations: {
      count: 100,
      growth: 2.45,
      icon: <></>,
    },
    deactivatedOrganizations: {
      count: 140,
      growth: -2.45,
      icon: <></>,
    },
    networkTab: { icon: <></> },
  };
  return (
    <div className="min-h-screen w-full mb-10">
      <main className="w-full py-6 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center md:items-start gap-1 py-2">
          <div className="flex md:flex-col items-center md:items-start gap-1">
            <h1 className="text-[18px] md:text-[20px] font-medium text-[#595959]">
              Welcome,
            </h1>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#003465]">
              Daniel James!
            </h2>
          </div>
          <span className="text-[#737373] text-[12px]">
            Here are your important tasks, updates and alerts.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="All Organizations"
            value={stats.allOrganizations.count}
            growth={stats.allOrganizations.growth}
            color="blue"
            icon={stats.allOrganizations.icon}
            href="/dashboard/organization"
          />
          <StatCard
            title="Active Organizations"
            value={stats.activeOrganizations.count}
            growth={stats.activeOrganizations.growth}
            color="green"
            icon={stats.activeOrganizations.icon}
            href="/dashboard/organization/active"
          />
          <StatCard
            title="Inactive Organizations"
            value={stats.inactiveOrganizations.count}
            growth={stats.inactiveOrganizations.growth}
            color="yellow"
            icon={stats.inactiveOrganizations.icon}
            href="/dashboard/organization/inactive"
          />
          <StatCard
            title="Deactived Organizations"
            value={stats.deactivatedOrganizations.count}
            growth={stats.deactivatedOrganizations.growth}
            color="red"
            icon={stats.deactivatedOrganizations.icon}
            href="/dashboard/organization/deactivated"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-4">
            <AppointmentsChart data={appointmentsData} />
            <PatientsDonut data={patientData} />
          </div>
          <EmployeeSection employees={employees} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrganizationList organizations={organizations} />
          <OrganizationStatus data={organizationStats} colors={colors} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
