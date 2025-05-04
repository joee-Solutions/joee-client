import axios from "axios";

export const getTenantConfig = async (domain: string, headers: Headers) => {
  const api = process.env.API_URL;
  return { message: "success" };
  try {
    const res = axios.get(`${api}/v2/tenant/${domain}/ui`, {
      headers: headers as any,
    });
    return (await res).data;
  } catch (error) {
    // console.log(error);
    return null;
  }
};
