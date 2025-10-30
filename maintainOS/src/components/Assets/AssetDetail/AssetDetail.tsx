import { useState, FC } from "react";
import { AssetDetailContent } from "./AssetDetailContent";
import { AssetDetailHeader } from "./AssetDetailHeader";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { MapPin } from "lucide-react";
import { formatDate, formatFriendlyDate } from "../../utils/Date";

// 1. Define a clear type for your Asset.
// You should reuse this from your main Assets component file.
interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  location: {
    id: number | string;
    name: string;
  };
  // Add other properties of your asset here
}

// 2. Define a type for the component's props.
interface AssetDetailProps {
  asset: Asset;
  onEdit: (asset: Asset) => void; // Add this line
  onDelete: (asset: Asset) => void; // Add this line
}

// 3. Use the defined types in your component.
export const AssetDetail: FC<AssetDetailProps> = ({
  asset,
  onEdit,
  onDelete,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // console.log("AssetDetail - :", allLocationData);

  return (
    <div className="h-full border mr-3 flex flex-col min-h-0">
      <AssetDetailHeader
        asset={asset}
        setShowHistory={setShowHistory}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {showHistory ? (
        <div className="flex items-start gap-3 p-3 border-b border-gray-100">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
            {renderInitials(user?.fullName)}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="text-sm text-gray-800">
              <span className="font-semibold">{user?.fullName}</span>
              <span className="text-gray-500 ml-2">
                {formatDate(asset.createdAt)}
              </span>
            </div>

            <div className="text-sm text-gray-700 mt-0.5 flex items-center">
              <span>Created the asset at location</span>
              {/* Message */}
              {asset?.location ? (
                <>
                  <MapPin className="w-4 h-4 text-orange-600 mx-1" />
                  <span className="font-medium">
                    {asset.location && asset.location.name}
                  </span>
                </>
              ) : (
                <div className="ml-2"> - Null</div>
              )}
            </div>
          </div>
        </div> // This will show when showHistory is true
      ) : (
        <AssetDetailContent asset={asset} /> // This will show when show-history is false
      )}
    </div>
  );
};
