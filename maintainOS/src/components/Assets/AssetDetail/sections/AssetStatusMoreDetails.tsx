import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronRight,
  MoreVertical,
  User,
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
import Loader from "../../../Loader/Loader";

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
  const [isLoading, setIsLoading] = useState(false);
  const [logData, setLogData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    setShowActionMenu(false);
  }, [selectedEntry]);

  const handleEditStatus = () => {
    setUpdateAssetModal(!updateAssetModal);
    setShowActionMenu(false);
  };

  const handleDeleteStatus = () => {
    setShowActionMenu(false);
    // Add delete logic here
  };

  const periods: Period[] = [
    "1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom",
  ];

  const getAssetStatusLog = async () => {
    try {
      setIsLoading(true);
      const res = await assetService.fetchAssetStatusLog(asset.id);
      setLogData(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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

  const getPeriodDurationInMs = (period: Period) => {
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;
    switch (period) {
      case "1H": return hour;
      case "1D": return day;
      case "1W": return 7 * day;
      case "1M": return 30 * day;
      case "3M": return 90 * day;
      case "6M": return 180 * day;
      case "1Y": return 365 * day;
      case "Custom": return 365 * day;
      default: return 7 * day;
    }
  };

  // ---------------------------------------------------------
  // ✅ NEW Helper: Normalize Status (Common Logic)
  // ---------------------------------------------------------
  const getNormalizedStatus = (status: string) => {
    const raw = (status || "").toLowerCase().trim();
    
    if (raw === "offline") return "offline";
    
    // All variations of "Do Not Track"
    if ([
      "donottrack", 
      "do not track", 
      "do_not_track", 
      "donotdisturb", 
      "do not disturb", 
      "do_not_disturb"
    ].includes(raw)) {
      return "doNotTrack";
    }

    // Default fallback to online if not offline/dnt
    return "online"; 
  };

  // ---------------------------------------------------------
  // ✅ Updated Timeline Logic
  // ---------------------------------------------------------
// ---------------------------------------------------------
  // ✅ Updated Timeline Logic (Fix for missing 'to' date)
  // ---------------------------------------------------------
  const generateTimelineSegments = () => {
    const now = new Date().getTime();
    const duration = getPeriodDurationInMs(selectedPeriod);
    const startTime = now - duration;

    const relevantLogs = logData.filter((e) => {
      if (!e.since) return false; // 'since' hona zaroori hai
      
      const logStart = new Date(e.since).getTime();
      // Agar 'to' nahi hai, toh maan lo abhi tak chal raha hai (now)
      const logEnd = e.to ? new Date(e.to).getTime() : now; 

      // Check overlap
      return logEnd >= startTime && logStart <= now;
    });

    return relevantLogs.map((entry) => {
      let logStart = new Date(entry.since).getTime();
      // Agar 'to' nahi hai, toh 'now' use karein
      let logEnd = entry.to ? new Date(entry.to).getTime() : now;

      // Clipping logic (chart ke bahar ka hissa kaatne ke liye)
      if (logStart < startTime) logStart = startTime;
      if (logEnd > now) logEnd = now;

      // Width calculation safely
      const totalDuration = Math.max(logEnd - logStart, 0);
      
      const left = ((logStart - startTime) / duration) * 100;
      const width = (totalDuration / duration) * 100;

      // Use Helper Function
      const normalizedStatus = getNormalizedStatus(entry.status);

      let color = "bg-green-500"; // Default Online color
      if (normalizedStatus === "offline") {
        const type = (entry.downtimeType || "").toLowerCase();
        color = type === "planned" ? "bg-blue-500" : "bg-red-500";
      } else if (normalizedStatus === "doNotTrack") {
        color = "bg-orange-600";
      }

      return {
        left,
        width,
        color,
        status: normalizedStatus,
        downtimeType: entry.downtimeType,
        since: entry.since,
        to: entry.to || new Date().toISOString(), // Tooltip ke liye
      };
    });
  };

  const timelineSegments = generateTimelineSegments();

  // ---------------------------------------------------------
  // ✅ FIXED: Uptime Calculation (Now matches Chart Logic)
  // ---------------------------------------------------------
  const calculateDurations = () => {
    let uptime = 0;
    let plannedDowntime = 0;
    let unplannedDowntime = 0;

    const now = new Date().getTime();
    const duration = getPeriodDurationInMs(selectedPeriod);
    const startTime = now - duration;

    logData.forEach((entry) => {
      if (!entry.since || !entry.to) return;

      let start = new Date(entry.since).getTime();
      let end = new Date(entry.to).getTime();

      // Overlap Check (Same logic as chart)
      if (end < startTime || start > now) return;

      // Clamp time for calculation (sirf visible area ka stats dikhane ke liye)
      // Agar aapko "Total History" ka stats chahiye, to neeche ki 2 lines hata dein
      if (start < startTime) start = startTime;
      if (end > now) end = now;

      const diffHours = (end - start) / (1000 * 60 * 60);
      const normalizedStatus = getNormalizedStatus(entry.status);

      if (normalizedStatus === "online") {
        uptime += diffHours;
      } else if (normalizedStatus === "offline") {
        const type = (entry.downtimeType || "").toLowerCase();
        if (type === "planned") {
          plannedDowntime += diffHours;
        } else {
          unplannedDowntime += diffHours;
        }
      }
      // "doNotTrack" is ignored in uptime/downtime calculation usually
    });

    return {
      uptime: uptime.toFixed(1),
      plannedDowntime: plannedDowntime.toFixed(1),
      unplannedDowntime: unplannedDowntime.toFixed(1),
    };
  };

  const { uptime, plannedDowntime, unplannedDowntime } = calculateDurations();

  const generateDateLabels = () => {
    const now = new Date().getTime();
    const duration = getPeriodDurationInMs(selectedPeriod);
    const startTime = now - duration;
    const labelCount = 8;
    const labels = [];

    for (let i = 0; i <= labelCount; i++) {
      const time = startTime + (duration * i) / labelCount;
      const d = new Date(time);
      let label = "";
      if (selectedPeriod === "1H" || selectedPeriod === "1D") {
        label = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      } else {
        label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      }
      labels.push(label);
    }
    return labels;
  };

  const dateLabels = generateDateLabels();

  const handleManualDowntimeSubmit = async (statusData: any) => {
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
    <>
      {isLoading ? (
        <div className="flex justify-center item-center h-full">
          <Loader />
        </div>
      ) : (
        <div className="min-h-screen p-4">
          <div className="max-w-7xl mx-auto bg-white">
            {/* Header */}
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

              {/* Status History Section */}
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

                {/* Timeline Chart */}
                <div className="bg-white rounded border border-gray-200 p-4 mb-8">
                  <div className="space-y-3">
                    {/* Row 1: Online */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 w-20">Online</span>
                      <div className="flex-1 relative h-6 bg-gray-50 rounded">
                        {timelineSegments
                          .filter((seg) => seg.status === "online")
                          .map((seg, i) => (
                            <div
                              key={i}
                              className={`absolute h-full rounded ${seg.color}`}
                              style={{
                                left: `${seg.left}%`,
                                width: `${seg.width}%`,
                              }}
                              title={`Online: ${formatDate(seg.since)}`}
                            ></div>
                          ))}
                      </div>
                    </div>

                    {/* Row 2: Offline */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 w-20">Offline</span>
                      <div className="flex-1 relative h-6 bg-gray-50 rounded">
                        {timelineSegments
                          .filter((seg) => seg.status === "offline")
                          .map((seg, i) => (
                            <div
                              key={i}
                              className={`absolute h-full rounded ${seg.color}`}
                              style={{
                                left: `${seg.left}%`,
                                width: `${seg.width}%`,
                              }}
                              title={`${seg.downtimeType}: ${formatDate(seg.since)}`}
                            ></div>
                          ))}
                      </div>
                    </div>

                    {/* Row 3: Do Not Track */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 w-20">Do Not Track</span>
                      <div className="flex-1 relative h-6 bg-gray-50 rounded">
                        {timelineSegments
                          .filter((seg) => seg.status === "doNotTrack")
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
                  </div>

                  {/* Date Labels */}
                  {dateLabels.length > 0 && (
                    <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                      {dateLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
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
                    <div className="text-sm text-gray-600">
                      Unplanned Downtime
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-black">
                      {plannedDowntime}h
                    </div>
                    <div className="text-sm text-gray-600">
                      Planned Downtime
                    </div>
                  </div>
                </div>

                {/* Add Manual Downtime Button */}
                <button
                  onClick={() => setUpdateAssetModal(!updateAssetModal)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium mb-6"
                >
                  <Plus className="w-4 h-4" /> Add Manual Downtime
                </button>

                {/* Table & Details Panel */}
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
                                const totalMinutes = Math.floor(diffMs / (1000 * 60));
                                const hours = Math.floor(totalMinutes / 60);
                                const minutes = totalMinutes % 60;
                                durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
                                          getNormalizedStatus(entry.status) === "offline"
                                            ? "bg-red-500"
                                            : getNormalizedStatus(entry.status) === "online"
                                            ? "bg-green-500"
                                            : "bg-orange-600"
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

                  {/* Details Panel */}
                  {logData[selectedEntry] && (
                    <div className="w-80 border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                                getNormalizedStatus(logData[selectedEntry].status) === "offline"
                                ? "bg-red-500"
                                : getNormalizedStatus(logData[selectedEntry].status) === "online"
                                ? "bg-green-500"
                                : "bg-orange-600"
                            }`}
                          ></span>
                          <span className="font-semibold text-gray-800 capitalize">
                            {logData[selectedEntry].status}
                          </span>
                        </div>
                        
                        <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(!showActionMenu);
                              }}
                              className={`p-1 rounded transition-colors ${
                                showActionMenu ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {showActionMenu && (
                              <div className="absolute right-0 left-10 top-full mt-1 mr-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                                <button
                                  onClick={handleEditStatus}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Edit
                                </button>
                                <div className="border-t border-gray-100"></div>
                                <button
                                  onClick={handleDeleteStatus}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {logData[selectedEntry].downtimeType && (
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-sm text-gray-700">
                              {logData[selectedEntry].downtimeType}
                            </div>
                          </div>
                        )}
                        {logData[selectedEntry].since && (
                          <div className="flex justify-between bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">From</div>
                            <div className="text-sm text-gray-700">
                              {formatDate(logData[selectedEntry].since)}
                            </div>
                          </div>
                        )}
                        {logData[selectedEntry].to && (
                            <div className="flex justify-between bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">To</div>
                            <div className="text-sm text-gray-700">
                                {formatDate(logData[selectedEntry].to)}
                            </div>
                            </div>
                        )}
                        <div className="flex justify-between bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-500 mb-1">Created By</div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                              <User />
                            </div>
                            <span className="text-sm text-gray-700">
                              {logData[selectedEntry].user?.fullName}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-500 mb-1">Updated By</div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                              <User />
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
      )}
    </>
  );
}