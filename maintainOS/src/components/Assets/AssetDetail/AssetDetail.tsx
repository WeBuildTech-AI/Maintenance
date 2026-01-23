import {
  useState,
  type FC,
  useEffect,
  useRef,
} from "react";
import { AssetDetailContent } from "./AssetDetailContent";
import { AssetDetailHeader } from "./AssetDetailHeader";
import { MapPin, History, ArrowRight } from "lucide-react";
import { formatDate } from "../../utils/Date";
// ✅ DIRECT IMPORT to avoid circular dependency
import { assetService } from "../../../store/assets/assets.service";
import Loader from "../../Loader/Loader";
// ✅ Import API for fetching users
import api from "../../../store/auth/auth.service";

// ✅ Define Interface locally to match your JSON Response exactly
interface AssetLogUser {
  id: string;
  fullName: string;
  email: string;
}

interface AssetLog {
  id: string;
  assetId: string;
  userId: string;
  previousStatus: string;
  status: string;
  notes: string | null;
  since: string;
  to: string | null;
  downtimeType: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  user?: AssetLogUser; // Nested user object
}

interface AssetDetailProps {
  asset: any;
  onEdit: (asset: any) => void;
  onDelete: (id: string | number) => void;
  onCopy: (asset: any) => void;
  fetchAssetsData: (force?: boolean) => void;
  setSeeMoreAssetStatus: (value: boolean) => void;
  onClose: () => void;
  restoreData: string;
  showDeleted: boolean;
}

// ✅ GLOBAL CACHE (Module-level, resets on page reload)
const userCache = new Map<string, string>();

export const AssetDetail: FC<AssetDetailProps> = ({
  asset,
  onEdit,
  onDelete,
  onCopy,
  fetchAssetsData,
  setSeeMoreAssetStatus,
  onClose,
  restoreData,
  showDeleted,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // ✅ State for User Names (Top Header)
  const [createdUserName, setCreatedUserName] = useState<string>("Loading...");
  const [updatedUserName, setUpdatedUserName] = useState<string>("Loading...");

  // ✅ New State for Logs
  const [historyLogs, setHistoryLogs] = useState<AssetLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // ✅ PERF: Track last fetched history ID to prevent re-fetching on toggle
  const lastFetchedHistoryIdRef = useRef<string | null>(null);

  // ✅ Fetch User Names Effect (Real API Call + Caching)
  useEffect(() => {
    const fetchUserNames = async () => {
      // Helper to fetch single user
      const getUserName = async (userId: string): Promise<string> => {
        if (!userId || userId.length <= 20) return userId || "System"; // Not a UUID or System

        if (userCache.has(userId)) {
          return userCache.get(userId)!;
        }

        try {
          const res = await api.get(`/users/${userId}`);
          const name = res.data?.fullName || "Unknown";
          userCache.set(userId, name);
          return name;
        } catch (error) {
          console.error("Failed to fetch user", userId, error);
          return "Unknown";
        }
      };

      // 1. Fetch Created By
      const createdBy = asset?.createdBy;
      const createdName = await getUserName(createdBy);
      setCreatedUserName(createdName);

      // 2. Fetch Updated By
      const updatedBy = asset?.updatedBy;
      const updatedName = await getUserName(updatedBy);
      setUpdatedUserName(updatedName);
    };

    fetchUserNames();
  }, [asset?.createdBy, asset?.updatedBy]);

  // ✅ New State for Last Updated Date (from logs)
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  // ✅ NEW: Fetch Logs Immediately to get "Last Updated" info
  useEffect(() => {
    const fetchHistory = async () => {
      const assetId = asset?.id?.toString();

      if (assetId && showHistory) { // ✅ Only fetch if History tab is active
        setLoadingLogs(true);
        try {
          const res = await assetService.fetchAssetStatusLog(assetId);

          if (res && Array.isArray(res.logs)) {
            setHistoryLogs(res.logs);
            lastFetchedHistoryIdRef.current = assetId;

            // Optional: Update global last updated info from logs if needed, 
            // but relying on asset.updatedAt for initial view is faster.
            if (res.logs.length > 0) {
              const latestLog = res.logs[0];
              if (latestLog) {
                setLastUpdatedDate(latestLog.createdAt);
              }
            }
          } else {
            setHistoryLogs([]);
          }
        } catch (error) {
          console.error("Failed to fetch history logs", error);
          setHistoryLogs([]);
        } finally {
          setLoadingLogs(false);
        }
      }
    };

    if (showHistory) {
      fetchHistory();
    }
  }, [asset?.id, showHistory]); // ✅ Depend on showHistory

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online": return "text-green-600 bg-green-100";
      case "offline": return "text-red-600 bg-red-100";
      case "donottrack": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="h-full border mr-3 mb-2 flex flex-col min-h-0 bg-white shadow-sm rounded-lg">
      <AssetDetailHeader
        asset={asset}
        setShowHistory={setShowHistory}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopy={onCopy}
        onClose={onClose}
        restoreData={restoreData}
        fetchAssetsData={fetchAssetsData}
        showDeleted={showDeleted}
      />

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-4 h-4" /> Activity Log
          </h3>

          {/* Static Creation Log (Always First) */}
          <div className="flex items-start gap-3 pb-6 border-b border-gray-100 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Asset Created</p>
              <p className="text-xs text-gray-500 mt-1">
                Created by <span className="font-medium text-gray-700">{createdUserName}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(asset.createdAt)}</p>
              {asset.location && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
                  <MapPin className="w-3 h-3" /> {asset.location.name}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic API Logs */}
          {loadingLogs ? (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          ) : historyLogs.length === 0 ? (
            <div className="text-sm text-gray-500">No additional history found.</div>
          ) : (
            historyLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-6 border-b border-gray-100 mb-4 last:border-0 last:mb-0">
                <div className="w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(log.previousStatus)}`}>
                      {log.previousStatus}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Status changed by <span className="font-medium text-gray-900">
                      {log.user?.fullName || "System"}
                    </span>
                  </p>

                  {log.downtimeType && (
                    <p className="text-xs text-red-500 mt-1">
                      Downtime: {log.downtimeType}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <AssetDetailContent
          fetchAssetsData={fetchAssetsData}
          asset={asset}
          setSeeMoreAssetStatus={setSeeMoreAssetStatus}
          createdUser={createdUserName}
          updatedUser={updatedUserName}
          lastUpdatedDate={lastUpdatedDate} // ✅ Pass new prop
        />
      )}
    </div>
  );
};