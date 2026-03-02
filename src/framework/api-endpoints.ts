export const API_ENDPOINTS = {
  LOGIN: "/auth/tenant/login",
  FORGOT_PASSWORD: "/tenant/auth/forgot-password",
  RESET_PASSWORD: "/auth/tenant/reset-password",
  VERIFY_LOGIN: "/tenant/auth/verify-otp",
  VERIFY_OTP: "/tenant/auth/verify-otp", // For password reset OTP verification
  RESEND_OTP: "/tenant/auth/resend-otp",
  REFRESH_TOKEN: "/auth/tenant/refresh",

  // Profile endpoints (GET, PATCH)
  GET_PROFILE: "/tenant/profile",
  UPDATE_PROFILE: "/tenant/profile",
  CHANGE_PASSWORD: "/tenant/change-password",

  // Dashboard endpoints
  GET_DEPARTMENTS: "/tenant/department",
  GET_APPOINTMENTS: "/tenant/appointment",
  DELETE_APPOINTMENT: (_tenantId: number, appointmentId: number | string) => `/tenant/appointment/${appointmentId}`,
  UPDATE_APPOINTMENT: (_tenantId: number, appointmentId: number | string) => `/tenant/appointment/${appointmentId}`,
  CREATE_APPOINTMENT: (_tenantId: number) => `/tenant/appointment`,
  GET_EMPLOYEE: "/tenant/employee",

  // Schedule endpoints
  GET_SCHEDULES: "/tenant/schedule",
  CREATE_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  GET_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  UPDATE_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,
  DELETE_SCHEDULE: (employeeId: number | string) => `/tenant/schedule/${employeeId}`,

  // Patient endpoints
  GET_PATIENTS: "/tenant/patient",
  CREATE_PATIENT: "/tenant/patient",
  GET_PATIENT: (patientId: number | string) => `/tenant/patient/${patientId}`,
  UPDATE_PATIENT: (patientId: number | string) => `/tenant/patient/${patientId}`,
  DELETE_PATIENT: (patientId: number | string) => `/tenant/patient/${patientId}`,

  TENANTS_PATIENTS: "/tenant/patient",
  GET_ALL_PATIENTS: "/tenant/patient",
  GET_TENANTS_EMPLOYEES: (_tenantId: number) => `/tenant/employee`,

  // Notifications (unread count: GET; mark as read: POST /read)
  GET_NOTIFICATIONS: "/tenant/notifications",
  GET_NOTIFICATION: (id: number | string) => `/tenant/notification/${id}`,
  GET_NOTIFICATION_UNREAD: "/tenant/notification/unread",
  POST_NOTIFICATION_READ: "/tenant/notification/read",

  // Backup
  GET_BACKUPS: "/tenant/backup",
  GET_BACKUP: (backupId: number | string) => `/tenant/backup/${backupId}`,
  CREATE_BACKUP: "/tenant/backup",
  DELETE_BACKUP: (backupId: number | string) => `/tenant/backup/${backupId}`,
  RESTORE_BACKUP: (backupId: number | string) => `/tenant/backup/restore/${backupId}`,
};
