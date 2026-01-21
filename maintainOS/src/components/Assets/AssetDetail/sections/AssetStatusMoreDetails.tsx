import {
  useEffect,
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
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
import Loader from "../../../Loader/Loader";
import { MeterReadings } from "../../../Meters/MeterDetail/MeterReadings";
import { Button } from "../../../ui/button";
import { CustomDateRangeModal } from "../../../utils/CustomDateRangeModal";

type Period = "1H" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "Custom";

interface AssetStatusMoreDetailsProps {
  setSeeMoreAssetStatus: (value: boolean) => void;
  asset: Asset;
  fetchAssetsData?: () => void;
  setShowNewAssetForm: Dispatch<SetStateAction<boolean>>;
}

export default function AssetStatusMoreDetails({
  setSeeMoreAssetStatus,
  fetchAssetsData,
  asset,
  setShowNewAssetForm,
}: AssetStatusMoreDetailsProps) {
  const [seeMoreFlag, setSeeMoreFlag] = useState(false);

  // State for Period and Custom Dates
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1W");
  const [customRange, setCustomRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // State for Modal visibility
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const customDateAnchorRef = useRef<HTMLButtonElement>(null);

  const [selectedEntry, setSelectedEntry] = useState<number>(0);
  const [updateAssetModal, setUpdateAssetModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [logData, setLogData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [hideSeeReadingFlag, setHideSeeReadingFlag] = useState(false);

  useEffect(() => {
    setShowActionMenu(false);
  }, [selectedEntry]);

  const handleEditStatus = () => {
    setUpdateAssetModal(!updateAssetModal);
    setShowActionMenu(false);
  };

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
      setIsLoading(true);
      const [res, durationRes] = await Promise.all([
        assetService.fetchAssetStatusLog(asset.id),
        assetService.updateAssetLogDuration(asset.id),
      ]);
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

  const handleDeleteStatus = async (id: string) => {
    setShowActionMenu(false);
    await assetService.deleteAssetStatus(id);
    getAssetStatusLog();
  };

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
      case "1H":
        return hour;
      case "1D":
        return day;
      case "1W":
        return 7 * day;
      case "1M":
        return 30 * day;
      case "3M":
        return 90 * day;
      case "6M":
        return 180 * day;
      case "1Y":
        return 365 * day;
      default:
        return 7 * day;
    }
  };

  const getDateRange = () => {
    if (selectedPeriod === "Custom" && customRange) {
      return {
        startTime: customRange.start.getTime(),
        endTime: customRange.end.getTime(),
        duration: customRange.end.getTime() - customRange.start.getTime(),
      };
    }
    const now = new Date().getTime();
    const duration = getPeriodDurationInMs(selectedPeriod);
    return {
      startTime: now - duration,
      endTime: now,
      duration: duration,
    };
  };

  const getNormalizedStatus = (status: string) => {
    const raw = (status || "").toLowerCase().trim();
    if (raw === "offline") return "offline";
    if (
      [
        "donottrack",
        "do not track",
        "do_not_track",
        "donotdisturb",
        "do not disturb",
        "do_not_disturb",
      ].includes(raw)
    ) {
      return "doNotTrack";
    }
    return "online";
  };

  const generateTimelineSegments = () => {
    const { startTime, endTime, duration } = getDateRange();

    const relevantLogs = logData.filter((e) => {
      if (!e.since) return false;
      const logStart = new Date(e.since).getTime();
      const logEnd = e.to ? new Date(e.to).getTime() : new Date().getTime();
      return logEnd >= startTime && logStart <= endTime;
    });

    return relevantLogs.map((entry) => {
      let logStart = new Date(entry.since).getTime();
      let logEnd = entry.to
        ? new Date(entry.to).getTime()
        : new Date().getTime();

      if (logStart < startTime) logStart = startTime;
      if (logEnd > endTime) logEnd = endTime;

      const totalDuration = Math.max(logEnd - logStart, 0);
      const left = ((logStart - startTime) / duration) * 100;
      const width = (totalDuration / duration) * 100;

      const normalizedStatus = getNormalizedStatus(entry.status);
      let color = "bg-green-500";

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
        to: entry.to || new Date().toISOString(),
      };
    });
  };

  const timelineSegments = generateTimelineSegments();

  const calculateDurations = () => {
    let uptime = 0;
    let plannedDowntime = 0;
    let unplannedDowntime = 0;

    const { startTime, endTime } = getDateRange();

    logData.forEach((entry) => {
      if (!entry.since) return;

      let start = new Date(entry.since).getTime();
      let end = entry.to ? new Date(entry.to).getTime() : new Date().getTime();

      if (end < startTime || start > endTime) return;
      if (start < startTime) start = startTime;
      if (end > endTime) end = endTime;

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
    });

    return {
      uptime: uptime.toFixed(1),
      plannedDowntime: plannedDowntime.toFixed(1),
      unplannedDowntime: unplannedDowntime.toFixed(1),
    };
  };

  const { uptime, plannedDowntime, unplannedDowntime } = calculateDurations();

  const generateDateLabels = () => {
    const { startTime, duration } = getDateRange();
    const labelCount = 8;
    const labels = [];

    for (let i = 0; i <= labelCount; i++) {
      const time = startTime + (duration * i) / labelCount;
      const d = new Date(time);
      let label = "";

      if (selectedPeriod === "1H" || selectedPeriod === "1D") {
        label = d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (selectedPeriod === "Custom" && duration < 86400000 * 2) {
        label = d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (selectedPeriod === "1Y") {
        label = d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        });
      } else {
        label = d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
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

  const handleExport = () => {
    if (!logData || logData.length === 0) {
      toast.error("No data to export.");
      return;
    }
    toast.success("Export started!");
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
              <Button
                className="gap-2 cursor-pointer bg-orange-600 hover:outline-none"
                onClick={() => {
                  setShowNewAssetForm(true);
                  setSeeMoreAssetStatus(false);
                }}
              >
                <Plus />
                New Asset
              </Button>
            </div>

            <div className="border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xl">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setSeeMoreAssetStatus(false)}
                  >
                    <ChevronLeft className="w-4 h-4 text-orange-600 mt-1" />
                    <span className="text-orange-600">{asset.name}</span>
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
                  fetchAssetsData={fetchAssetsData}
                />

                <button
                  onClick={handleExport}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 text-orange-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
                >
                  <Download className="w-4 h-4" /> Export Data
                </button>
              </div>

              {/* Status History Section */}
              <div className="p-6">
                <div className="flex justify-between mb-6 relative">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Status History
                  </h2>
                  <div className="flex gap-2 relative">
                    {periods.map((period) => {
                      if (period === "Custom") {
                        return (
                          <div key={period} className="relative">
                            <button
                              ref={customDateAnchorRef}
                              onClick={() =>
                                setShowCustomDateModal((prev) => !prev)
                              }
                              className={`px-3 py-1 text-xs cursor-pointer font-medium rounded ${
                                selectedPeriod === "Custom"
                                  ? "bg-orange-600 text-white "
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {selectedPeriod === "Custom" && customRange
                                ? `${formatDateOnly(
                                    customRange.start.toISOString()
                                  )} - ${formatDateOnly(
                                    customRange.end.toISOString()
                                  )}`
                                : "Custom"}
                            </button>

                            {showCustomDateModal && (
                              <CustomDateRangeModal
                                anchorRef={customDateAnchorRef as any}
                                onClose={() => setShowCustomDateModal(false)}
                                onApply={(start, end) => {
                                  setCustomRange({ start, end });
                                  setSelectedPeriod("Custom");
                                  setShowCustomDateModal(false);
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={period}
                          onClick={() => {
                            setSelectedPeriod(period);
                            setShowCustomDateModal(false);
                          }}
                          className={`px-3 py-1 text-xs cursor-pointer font-medium rounded ${
                            selectedPeriod === period
                              ? "bg-orange-600 text-white "
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {period}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Chart */}
                <div className="bg-white rounded border border-gray-200 p-4 mb-8">
                  <div className="space-y-3">
                    {/* Example Online Row */}
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
                            ></div>
                          ))}
                      </div>
                    </div>
                    {/* Example Offline Row */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 w-20">
                        Offline
                      </span>
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
                            ></div>
                          ))}
                      </div>
                    </div>
                    {/* Example Do Not Track Row */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 w-20">
                        Do Not Track
                      </span>
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

                <button
                  onClick={() => setUpdateAssetModal(!updateAssetModal)}
                  className=" cursor-pointer flex items-center gap-2 px-4 py-2 text-orange-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium mb-6"
                >
                  <Plus className="w-4 h-4" /> Add Manual Downtime
                </button>

                {/* Table & Details Panel */}
                <div className="flex gap-6">
                  {/* Table Code */}
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
                              // ✅ EXACT DURATION LOGIC (hh mm ss)
                              let durationStr = entry.duration || "-";
                                                            
                              if (!entry.duration && entry.since && entry.to) {
                                const since = new Date(entry.since).getTime();
                                const to = new Date(entry.to).getTime();
                                const diffMs = Math.abs(to - since);
  
                                const days = Math.floor(
                                  diffMs / (1000 * 60 * 60 * 24)
                                );
                                const hours = Math.floor(
                                  (diffMs / (1000 * 60 * 60)) % 24
                                );
                                const minutes = Math.floor(
                                  (diffMs / (1000 * 60)) % 60
                                );
                                const seconds = Math.floor(
                                  (diffMs / 1000) % 60
                                );
  
                                // Format: 1d 2h 30m 45s (Ensure minutes are always shown if hours > 0 or seconds > 0)
                                const parts = [];
                                if (days > 0) parts.push(`${days}d`);
                                if (hours > 0) parts.push(`${hours}h`);
                                if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
                                parts.push(`${seconds}s`);
  
                                durationStr = parts.length > 0 ? parts.join(" ") : "0m 0s";
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
                                          getNormalizedStatus(entry.status) ===
                                          "offline"
                                            ? "bg-red-500"
                                            : getNormalizedStatus(
                                                entry.status
                                              ) === "online"
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
                              getNormalizedStatus(
                                logData[selectedEntry].status
                              ) === "offline"
                                ? "bg-red-500"
                                : getNormalizedStatus(
                                    logData[selectedEntry].status
                                  ) === "online"
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
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showActionMenu && (
                            <div className="absolute right-0 left-10 top-full mt-1 mr-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <button
                                onClick={handleEditStatus}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteStatus(logData[selectedEntry].id)
                                }
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Start Date & Time
                          </div>
                          <div className="text-sm text-gray-800">
                            {formatDate(logData[selectedEntry].since)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            End Date & Time
                          </div>
                          <div className="text-sm text-gray-800">
                            {formatDate(logData[selectedEntry].to)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            User
                          </div>
                          <div className="text-sm text-gray-800 capitalize">
                            {logData[selectedEntry].user?.fullName || "-"}
                          </div>
                        </div>
                        {logData[selectedEntry].downtimeType && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Downtime Type
                            </div>
                            <div className="text-sm text-gray-800 capitalize">
                              {logData[selectedEntry].downtimeType}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Notes
                          </div>
                          <div className="text-sm text-gray-800">
                            {logData[selectedEntry].notes || "No notes added"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meter Readings section */}
                <div className="mt-4 ">
                  <h6 className="font-bold">Meter Reading</h6>
                  {asset.meters?.length > 0 && (
                    <div className="flex-wrap justify-between items-center ">
                      {asset.meters.map((meter) => (
                        <div
                          key={meter.id || meter.name}
                          className="border border-orange-600 mt-2 rounded-lg"
                        >
                          <p className="text-sm font-medium p-2">
                            {meter?.name || "-"}
                          </p>
                          <br />
                          <MeterReadings
                            selectedMeter={meter}
                            setShowReadingMeter={() => {}}
                            hideSeeReadingFlag={hideSeeReadingFlag}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Modals */}
            {updateAssetModal && (
              <UpdateAssetStatusModal
                asset={asset}
                initialStatus={asset.status}
                onClose={() => setUpdateAssetModal(false)}
                isLoading={isSubmitting}
                onSubmit={handleManualDowntimeSubmit}
                fetchAssetsData={fetchAssetsData}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}