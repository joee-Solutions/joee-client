import Cookies from 'js-cookie';

export const getToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  const AUTH_TOKEN = Cookies.get('auth_token');
  return AUTH_TOKEN;
};

export const getRefreshToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  const AUTH_TOKEN = Cookies.get('refresh_token');
  return AUTH_TOKEN;
};
 export const getMfaToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  const AUTH_TOKEN = Cookies.get('mfa_token');
  return AUTH_TOKEN;
 }