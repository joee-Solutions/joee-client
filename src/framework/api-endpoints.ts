export const API_ENDPOINTS = {
  LOGIN: "/tenant/auth/login",
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
  GET_PATIENTS: "/tenant/patient",
  GET_APPOINTMENTS: "/tenant/appointment",
  GET_USERS: "/tenant/users",
};
