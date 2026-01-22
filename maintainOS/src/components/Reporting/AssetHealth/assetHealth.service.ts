import api from "../../../store/auth/auth.service";
import type { AssetHealthSummary, ProblematicAsset } from "./assetHealth.types";

export const assetHealthService = {
  /**
   * Fetch asset health summary statistics
   */
  fetchSummary: async (): Promise<AssetHealthSummary> => {
    const res = await api.get("/asset-health/analytics/summary");
    return res.data;
  },

  /**
   * Fetch most problematic assets
   * @param limit - Number of assets to fetch (default: 10)
   * @param startDate - Start date for analysis (YYYY-MM-DD format)
   * @param filters - Additional filters (status, criticality, etc.)
   */
  fetchProblematicAssets: async (
    limit: number = 10,
    startDate?: string,
    filters?: Record<string, any>
  ): Promise<ProblematicAsset[]> => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (startDate) {
      params.append("startDate", startDate);
    }
    
    // Add filter parameters
    if (filters) {
      // Handle status filter
      if (filters.status && Array.isArray(filters.status)) {
        filters.status.forEach((status: string) => {
          params.append("statusOneOf", status);
        });
      }
      
      // Handle criticality filter
      if (filters.criticality && Array.isArray(filters.criticality)) {
        filters.criticality.forEach((crit: string) => {
          params.append("criticalityOneOf", crit);
        });
      }
      
      // Handle downtime type filter
      if (filters.downtimeType && Array.isArray(filters.downtimeType)) {
        filters.downtimeType.forEach((type: string) => {
          params.append("downtimeTypeOneOf", type);
        });
      }
    }
    
    const res = await api.get(`/asset-health/analytics/problematic?${params.toString()}`);
    return res.data;
  },
};
