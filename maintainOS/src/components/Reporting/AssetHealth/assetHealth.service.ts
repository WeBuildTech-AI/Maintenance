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
   */
  fetchProblematicAssets: async (
    limit: number = 10,
    startDate?: string
  ): Promise<ProblematicAsset[]> => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (startDate) {
      params.append("startDate", startDate);
    }
    const res = await api.get(`/asset-health/analytics/problematic?${params.toString()}`);
    return res.data;
  },
};
