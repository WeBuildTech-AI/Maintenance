import { formatDate } from "../../../utils/Date";

export function AssetCreatedUpdated({
  asset,
  createdUser,
  updatedUser,
  lastUpdatedDate,
}: {
  asset: any;
  createdUser: string;
  updatedUser: string;
  lastUpdatedDate?: string | null;
}) {
  return (
    <div className="border-t pt-4">
      <div className="text-sm text-gray-500">
        Created By{" "}
        <span className="capitalize font-medium text-gray-700">
          {createdUser}
        </span>{" "}
        on {formatDate(asset.createdAt)}
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Updated By{" "}
        <span className="capitalize font-medium text-gray-700">
          {updatedUser}
        </span>{" "}
        on {formatDate(lastUpdatedDate || asset.updatedAt)}
      </div>
    </div>
  );
}