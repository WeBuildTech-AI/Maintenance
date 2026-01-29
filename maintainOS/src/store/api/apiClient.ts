import axios from "axios";



let apiInstance: ReturnType<typeof axios.create> | null = null;

export async function getApiClient() {
  if (apiInstance) return apiInstance;

  // Prioritize local env, fallback to runtime config if needed (or remove runtime config if deprecated)
  const baseUrl = import.meta.env.VITE_API_URL;

  apiInstance = axios.create({
    baseURL: baseUrl,
    timeout: 20000,
  });

  return apiInstance;
}
