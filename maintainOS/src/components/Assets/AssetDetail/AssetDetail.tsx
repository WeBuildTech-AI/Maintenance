import {
  useState,
  type FC,
  useEffect,
} from "react";
import { AssetDetailContent } from "./AssetDetailContent";
import { AssetDetailHeader } from "./AssetDetailHeader";
import { MapPin, History, ArrowRight } from "lucide-react";
import { formatDate } from "../../utils/Date";
// import { workOrderService } from "../../../store/workOrders"; // Unused import removed

// ✅ DIRECT IMPORT to avoid circular dependency
import { assetService } from "../../../store/assets/assets.service";
import type { AssetLog } from "../../../store/assets/assets.types";
import Loader from "../../Loader/Loader";

interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: any;
  createdBy: string;
  updatedBy: string;
  [key: string]: any;
}

interface AssetDetailProps {
  asset: any;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string | number) => void;
  onCopy: (asset: Asset) => void;
  fetchAssetsData: () => void;
  setSeeMoreAssetStatus: (value: boolean) => void;
  onClose: () => void;
  restoreData: string;
  showDeleted: boolean;
}

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
  const [createdUserName, setCreatedUserName] = useState<string>("Loading...");
  // const [updatedUserName, setUpdatedUserName] = useState<string>("Loading...");

  // ✅ New State for Logs
  const [historyLogs, setHistoryLogs] = useState<AssetLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch user names (Existing Logic)
  useEffect(() => {
    if(asset.createdBy) setCreatedUserName("User"); 
  }, [asset]);

  // ✅ NEW: Fetch Logs when History Tab is opened
  useEffect(() => {
    const fetchHistory = async () => {
      if (showHistory && asset?.id) {
        setLoadingLogs(true);
        try {
          console.log("Fetching History Logs for:", asset.id);
          const res = await assetService.fetchAssetStatusLog(asset.id.toString());
          if (res && res.logs) {
            setHistoryLogs(res.logs);
          }
        } catch (error) {
          console.error("Failed to fetch history logs", error);
        } finally {
          setLoadingLogs(false);
        }
      }
    };

    fetchHistory();
  }, [showHistory, asset?.id]);

  const renderInitials = (text: string) =>
    text && text !== "Loading..."
      ? text
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "NA";

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
                    Status changed by <span className="font-medium text-gray-900">{log.user?.fullName || "System"}</span>
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
          updatedUser={"..."}
        />
      )}
    </div>
  );
};