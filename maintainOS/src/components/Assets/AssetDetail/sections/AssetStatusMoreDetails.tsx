import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import type { Asset } from "../../Assets";
import {
  AssetStatusReadings,
  UpdateAssetStatusModal,
} from "./AssetStatusReadings";
import { assetService } from "../../../../store/assets";
import type { RootState } from "../../../../store";
import { useSelector } from "react-redux";
import { formatDateOnly } from "../../../utils/Date";
import toast from "react-hot-toast";

type Period = "1H" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "Custom";

interface AssetStatusMoreDetailsProps {
  setSeeMoreAssetStatus: (value: boolean) => void;
  asset: Asset;
  fetchAssetsData?: () => void;
}

export default function AssetStatusMoreDetails({
  setSeeMoreAssetStatus,
  fetchAssetsData,
  asset,
}: AssetStatusMoreDetailsProps) {
  const [seeMoreFlag, setSeeMoreFlag] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1W");
  const [selectedEntry, setSelectedEntry] = useState<number>(0);
  const [updateAssetModal, setUpdateAssetModal] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [logData, setLogData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const periods: Period[] = [
    "1H",
    "1D",
    "1W",
    "1M",
    "3M",
    "6M",
    "1Y",
    "Custom",
  ];

  const getAssetStatusLog = async () => {
    try {
      const res = await assetService.fetchAssetStatusLog(asset.id);
      setLogData(res.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAssetStatusLog();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Duration calculator (Uptime / Downtime)
  const calculateDurations = () => {
    let uptime = 0;
    let plannedDowntime = 0;
    let unplannedDowntime = 0;

    logData.forEach((entry) => {
      if (!entry.since || !entry.to) return;

      const since = new Date(entry.since).getTime();
      const to = new Date(entry.to).getTime();
      const diffHours = Math.abs(to - since) / (1000 * 60 * 60);

      if (entry.status === "online") {
        uptime += diffHours;
      } else if (entry.status === "offline") {
        if (entry.downtimeType === "planned") {
          plannedDowntime += diffHours;
        } else {
          unplannedDowntime += diffHours;
        }
      }
    });

    return {
      uptime: uptime.toFixed(1),
      plannedDowntime: plannedDowntime.toFixed(1),
      unplannedDowntime: unplannedDowntime.toFixed(1),
    };
  };

  const { uptime, plannedDowntime, unplannedDowntime } = calculateDurations();

  // ✅ Filter data based on selected period
  const filterByPeriod = () => {
    const now = new Date();
    const rangeMap: Record<Period, number> = {
      "1H": 1 / 24,
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
      Custom: 365,
    };

    const days = rangeMap[selectedPeriod];
    const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return logData.filter(
      (e) =>
        new Date(e.to).getTime() >= fromDate.getTime() &&
        new Date(e.since).getTime() <= now.getTime()
    );
  };

  const filteredLogs = filterByPeriod();

  // ✅ Generate timeline segments dynamically
  const generateTimelineSegments = () => {
    if (!filteredLogs.length) return [];

    const sorted = [...filteredLogs].sort(
      (a, b) => new Date(a.since).getTime() - new Date(b.since).getTime()
    );

    const startRange = new Date(sorted[0].since).getTime();
    const endRange = new Date(sorted[sorted.length - 1].to).getTime();
    const totalRange = endRange - startRange;

    return sorted.map((entry) => {
      const since = new Date(entry.since).getTime();
      const to = new Date(entry.to).getTime();

      const left = ((since - startRange) / totalRange) * 100;
      const width = ((to - since) / totalRange) * 100;

      let color = "bg-teal-400";
      if (entry.status === "offline" && entry.downtimeType === "planned")
        color = "bg-blue-500";
      else if (entry.status === "offline" && entry.downtimeType !== "planned")
        color = "bg-red-500";
      else if (entry.status === "doNotTrack") color = "bg-gray-400";

      return { left, width, color, since, to };
    });
  };

  const timelineSegments = generateTimelineSegments();

  // ✅ Generate dynamic date labels (bottom timeline)
  const generateDateLabels = () => {
    if (!timelineSegments.length) return [];
    const start = timelineSegments[0].since;
    const end = timelineSegments[timelineSegments.length - 1].to;
    const diff = end - start;

    const labelCount = 8;
    const labels = [];
    for (let i = 0; i <= labelCount; i++) {
      const t = new Date(start + (diff * i) / labelCount);
      labels.push(
        t.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      );
    }
    return labels;
  };

  const dateLabels = generateDateLabels();

  const handleManualDowntimeSubmit = async (statusData: {
    status: string;
    notes?: string;
    since?: string;
    to?: string;
    downtimeType?: string;
  }) => {
    if (!asset?.id) return;

    setIsSubmitting(true);
    try {
      await assetService.updateAssetStatus(asset.id, statusData);
      getAssetStatusLog();
      setUpdateAssetModal(false);
      toast.success("Asset Status Successfully updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update Asset Status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto bg-white">
        <div className="flex justify-between item-center gap-6 p-6">
          <h1 className="text-2xl font-semibold">Assets</h1>
          <button>New Asset</button>
        </div>

        <div className="border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xl">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setSeeMoreAssetStatus(false)}
              >
                <ChevronLeft className="w-4 h-4 text-blue-600 mt-1" />
                <span className="text-blue-600">{asset.name}</span>
              </div>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700">Status</span>
            </div>
          </div>

          <div className="p-6 flex justify-between items-center">
            <AssetStatusReadings
              asset={asset}
              seeMoreFlag={seeMoreFlag}
              getAssetStatusLog={getAssetStatusLog}
            />
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium">
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>

          {/* ✅ Status History Section */}
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Status History
              </h2>
              <div className="flex gap-2">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      selectedPeriod === period
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ Timeline Visualization */}
            <div className="bg-white rounded border border-gray-200 p-4 mb-8">
              <div className="space-y-3">
                {["Online", "Offline", "Do Not Track"].map((label) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 w-20">{label}</span>
                    <div className="flex-1 relative h-6 bg-gray-50 rounded">
                      {timelineSegments
                        .filter((seg) =>
                          label === "Online"
                            ? seg.color === "bg-teal-400"
                            : label === "Offline"
                            ? ["bg-red-500", "bg-blue-500"].includes(seg.color)
                            : seg.color === "bg-gray-400"
                        )
                        .map((seg, i) => (
                          <div
                            key={i}
                            className={`absolute h-full rounded ${seg.color}`}
                            style={{
                              left: `${seg.left}%`,
                              width: `${seg.width}%`,
                            }}
                          ></div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Dynamic Date Labels */}
              {dateLabels.length > 0 && (
                <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                  {dateLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {uptime}h
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {unplannedDowntime}h
                </div>
                <div className="text-sm text-gray-600">Unplanned Downtime</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-blue-600">
                  {plannedDowntime}h
                </div>
                <div className="text-sm text-gray-600">Planned Downtime</div>
              </div>
            </div>

            {/* ✅ Add Manual Downtime */}
            <button
              onClick={() => setUpdateAssetModal(!updateAssetModal)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium mb-6"
            >
              <Plus className="w-4 h-4" /> Add Manual Downtime
            </button>

            {/* ✅ Status Table */}
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">
                            Status
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">
                            Updated By
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50">
                            Duration
                          </th>
                          <th className="w-8 bg-gray-50"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {logData.map((entry, index) => {
                          let durationStr = "-";
                          if (entry.since && entry.to) {
                            const since = new Date(entry.since).getTime();
                            const to = new Date(entry.to).getTime();
                            const diffMs = Math.abs(to - since);
                            const totalMinutes = Math.floor(
                              diffMs / (1000 * 60)
                            );
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            durationStr =
                              hours > 0
                                ? `${hours}h ${minutes}m`
                                : `${minutes}m`;
                          }

                          return (
                            <tr
                              key={index}
                              onClick={() => setSelectedEntry(index)}
                              className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                selectedEntry === index ? "bg-blue-50" : ""
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      entry.status === "offline"
                                        ? "bg-red-500"
                                        : entry.status === "online"
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></span>
                                  <span className="text-sm text-gray-700 capitalize">
                                    {entry.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm capitalize text-gray-700">
                                {entry.user?.fullName || "-"}{" "}
                                {formatDateOnly(entry?.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {durationStr}
                              </td>
                              <td className="px-4 py-3">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ✅ Details Panel */}
              {logData[selectedEntry] && (
                <div className="w-80 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          logData[selectedEntry].status === "offline"
                            ? "bg-red-500"
                            : logData[selectedEntry].status === "online"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {logData[selectedEntry].status}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logData[selectedEntry].downtimeType && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-sm text-gray-700">
                          {logData[selectedEntry].downtimeType}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">From</div>
                      <div className="text-sm text-gray-700">
                        {formatDate(logData[selectedEntry].since)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">To</div>
                      <div className="text-sm text-gray-700">
                        {formatDate(logData[selectedEntry].to)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Updated By
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                          👤
                        </div>
                        <span className="text-sm text-gray-700">
                          {logData[selectedEntry].user?.fullName}
                        </span>
                      </div>
                    </div>
                    {logData[selectedEntry].notes && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Note</div>
                        <div className="text-sm text-gray-700">
                          {logData[selectedEntry].notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {updateAssetModal && (
          <UpdateAssetStatusModal
            asset={asset}
            initialStatus={asset.status}
            onClose={() => setUpdateAssetModal(false)}
            isLoading={isSubmitting}
            onSubmit={handleManualDowntimeSubmit}
          />
        )}
      </div>
    </div>
  );
}
