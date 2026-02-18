export const API_ENDPOINTS = {
  LOGIN: "/auth/tenant/login",
  FORGOT_PASSWORD: "/tenant/auth/forgot-password",
  RESET_PASSWORD: "/tenant/auth/reset-password",
  VERIFY_LOGIN: "/tenant/auth/verify-otp",
  VERIFY_OTP: "/tenant/auth/verify-otp", // For password reset OTP verification
  RESEND_OTP: "/tenant/auth/resend-otp",
  REFRESH_TOKEN: "/tenant/auth/refresh-token",
  
  // Profile endpoints
  GET_PROFILE: "/tenant/profile",
  UPDATE_PROFILE: "/tenant/profile",
  CHANGE_PASSWORD: "/tenant/user/change-password",
  
  // Dashboard endpoints
  GET_DEPARTMENTS: "/tenant/department",
  GET_APPOINTMENTS: "/tenant/appointment",
  DELETE_APPOINTMENT: (tenantId: number, appointmentId: number | string) => `/tenant/appointment/${appointmentId}`,
  UPDATE_APPOINTMENT: (tenantId: number, appointmentId: number | string) => `/tenant/appointment/${appointmentId}`,
  CREATE_APPOINTMENT: (tenantId: number) => `/tenant/appointment`,
  GET_EMPLOYEE: "/tenant/employee",
  
  // Schedule endpoints
  // GET "/tenant/schedule" - get all schedules
  GET_SCHEDULES: "/tenant/schedule",
  // POST, GET, PATCH, DELETE "/tenant/schedule/{employeeId}"
  CREATE_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  GET_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  UPDATE_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  DELETE_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  
  // Patient endpoints
  // GET and POST "/tenant/patient"
  GET_PATIENTS: "/tenant/patient",
  CREATE_PATIENT: "/tenant/patient",
  // GET, PATCH and DELETE "/tenant/patient/{id}"
  GET_PATIENT: (patientId: number | string) => `/tenant/patient/${patientId}`,
  UPDATE_PATIENT: (patientId: number | string) => `/tenant/patient/${patientId}`,
  DELETE_PATIENT: (patientId: number | string) => `/tenant/patient/${patientId}`,
  
  // Legacy aliases for backward compatibility (will be removed)
  TENANTS_PATIENTS: "/tenant/patient",
  GET_ALL_PATIENTS: "/tenant/patient",
  
  // Employee endpoints (functions)
  GET_TENANTS_EMPLOYEES: (tenantId: number) => `/tenant/employee`,
};
