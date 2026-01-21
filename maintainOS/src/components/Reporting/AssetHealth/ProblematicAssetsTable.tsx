import { useEffect, useState, useMemo } from "react";
import { Loader2, ChevronUp, ChevronDown, Info, ExternalLink } from "lucide-react";
import { assetHealthService } from "./assetHealth.service";
import type { ProblematicAsset } from "./assetHealth.types";

interface ProblematicAssetsTableProps {
  dateRange: { startDate: string; endDate: string };
  limit?: number;
}

type SortField = "name" | "criticality" | "location" | "formattedDowntime" | "failures" | "maintenanceCost";
type SortDirection = "asc" | "desc";

const criticalityOrder = { high: 3, medium: 2, low: 1 };

export function ProblematicAssetsTable({
  dateRange,
  limit = 10,
}: ProblematicAssetsTableProps) {
  const [assets, setAssets] = useState<ProblematicAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("formattedDowntime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert MM/DD/YYYY to YYYY-MM-DD for API
      const [month, day, year] = dateRange.startDate.split("/");
      const apiStartDate = `${year}-${month}-${day}`;
      const data = await assetHealthService.fetchProblematicAssets(limit, apiStartDate);
      setAssets(data);
    } catch (err) {
      console.error("Failed to fetch problematic assets:", err);
      setError("Failed to load problematic assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, limit]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "criticality":
          aVal = criticalityOrder[a.criticality] || 0;
          bVal = criticalityOrder[b.criticality] || 0;
          break;
        case "formattedDowntime":
          aVal = a.downtimeMs;
          bVal = b.downtimeMs;
          break;
        case "failures":
          aVal = a.failures;
          bVal = b.failures;
          break;
        case "maintenanceCost":
          aVal = a.maintenanceCost;
          bVal = b.maintenanceCost;
          break;
        default:
          aVal = (a[sortField] || "").toString().toLowerCase();
          bVal = (b[sortField] || "").toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [assets, sortField, sortDirection]);

  const getCriticalityBadge = (criticality: string) => {
    const styles: Record<string, string> = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      low: "bg-green-100 text-green-700 border-green-200",
    };
    const labels: Record<string, string> = {
      high: "High",
      medium: "Medium",
      low: "Low",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
          styles[criticality] || "bg-gray-100 text-gray-700"
        }`}
      >
        {labels[criticality] || criticality}
      </span>
    );
  };

  const getStatusDot = (criticality: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500",
      medium: "bg-amber-500",
      low: "bg-green-500",
    };
    return <span className={`w-2 h-2 rounded-full ${colors[criticality] || "bg-gray-400"}`}></span>;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 text-amber-600 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 text-amber-600 ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-48 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-900">Most Problematic Assets</h3>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            See More
            <ExternalLink className="h-3 w-3" />
          </a>
          {/* <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
            <span className="text-gray-600">Group by Asset</span>
            <span className="text-amber-600">+</span>
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Asset Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("criticality")}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Criticality
                  <SortIcon field="criticality" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("location")}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Location
                  <SortIcon field="location" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("formattedDowntime")}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Downtime
                  <Info className="h-3 w-3 ml-1 text-gray-400" />
                  <SortIcon field="formattedDowntime" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("failures")}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Failures
                  <Info className="h-3 w-3 ml-1 text-gray-400" />
                  <SortIcon field="failures" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("maintenanceCost")}
                  className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Labor & Parts Cost
                  <Info className="h-3 w-3 ml-1 text-gray-400" />
                  <SortIcon field="maintenanceCost" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusDot(asset.criticality)}
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {asset.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {getCriticalityBadge(asset.criticality)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {asset.location || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{asset.type}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                  {asset.formattedDowntime}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  {asset.failures}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                  ${asset.maintenanceCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-amber-600 hover:text-amber-700">
                  <a href={`/assets/${asset.id}`} className="hover:underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
            {sortedAssets.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No problematic assets found for the selected date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
