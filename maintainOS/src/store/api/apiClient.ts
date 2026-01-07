import axios from "axios";
import { getRuntimeConfig } from "../../config/runtimeConfig";


let apiInstance: ReturnType<typeof axios.create> | null = null;

export async function getApiClient() {
  if (apiInstance) return apiInstance;

  const config = await getRuntimeConfig;

  apiInstance = axios.create({
    baseURL: config.api_url,
    timeout: 20000,
  });

  return apiInstance;
}
