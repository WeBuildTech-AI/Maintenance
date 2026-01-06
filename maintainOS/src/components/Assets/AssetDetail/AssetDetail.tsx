import {
  useState,
  type FC,
  useEffect,
} from "react";
import { AssetDetailContent } from "./AssetDetailContent";
import { AssetDetailHeader } from "./AssetDetailHeader";
import { MapPin } from "lucide-react";
import { formatDate } from "../../utils/Date";
import { workOrderService } from "../../../store/workOrders";

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
  const [updatedUserName, setUpdatedUserName] = useState<string>("Loading...");

  const fetchUserNames = async () => {
    try {
      // Fetch Creator Name
      if (asset.createdBy) {
        const creatorRes: any = await workOrderService.fetchUserById(asset.createdBy);
        setCreatedUserName(creatorRes.fullName || "Unknown User");
      }
      
      // Fetch Updater Name
      if (asset.updatedBy) {
        const updaterRes: any = await workOrderService.fetchUserById(asset.updatedBy);
        setUpdatedUserName(updaterRes.fullName || "Unknown User");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setCreatedUserName("Error loading");
      setUpdatedUserName("Error loading");
    }
  };

  useEffect(() => {
    fetchUserNames();
  }, [asset.createdBy, asset.updatedBy]);

  const renderInitials = (text: string) =>
    text && text !== "Loading..."
      ? text
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "NA";

  return (
    <div className="h-full border mr-3 mb-2 flex flex-col min-h-0">
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
        <div className="flex items-start gap-3 p-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
            {renderInitials(createdUserName)}
          </div>

          <div className="flex-1">
            <div className="text-sm text-gray-800">
              <span className="font-semibold">{createdUserName}</span>
              <span className="text-gray-500 ml-2">
                {formatDate(asset.createdAt)}
              </span>
            </div>

            <div className="text-sm text-gray-700 mt-0.5 flex items-center">
              <span>Created the asset at location</span>
              {asset?.location ? (
                <>
                  <MapPin className="w-4 h-4 text-orange-600 mx-1" />
                  <span className="font-medium">
                    {asset.location.name}
                  </span>
                </>
              ) : (
                <div className="ml-2"> - Null</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AssetDetailContent
          fetchAssetsData={fetchAssetsData}
          asset={asset}
          setSeeMoreAssetStatus={setSeeMoreAssetStatus}
          createdUser={createdUserName}
          updatedUser={updatedUserName}
        />
      )}
    </div>
  );
};