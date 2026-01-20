export interface ProblematicAsset {
  id: string;
  name: string;
  criticality: "high" | "medium" | "low";
  location: string;
  type: string;
  downtimeMs: number;
  downtimeHours: number;
  formattedDowntime: string;
  failures: number;
  maintenanceCost: number;
}

export interface AssetHealthSummary {
  assetAvailability: number;
  online: number;
  offline: number;
  planned_offline: number;
  unplanned_offline: number;
  lastUpdated: string;
}
