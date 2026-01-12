import { formatDate } from "../../../utils/Date";

export function AssetCreatedUpdated({
  asset,
  createdUser,
}: {
  asset: any;
  createdUser: string;
}) {


  return (
    <>
      <div>
        {asset.createdAt === asset.updatedAt ? (
          <>
            <div className="text-sm text-gray-500 mt-2">
              Created By{" "}
              <span className="capitalize font-medium text-gray-700">
                {createdUser}{" "}
              </span>
              on {formatDate(asset.createdAt)}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500 mt-2">
              Created By{" "}
              <span className="capitalize font-medium text-gray-700">
                {createdUser}
              </span>{" "}
              on {formatDate(asset.createdAt)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Updated By{" "}
              <span className="capitalize font-medium text-gray-700">
                {createdUser}
              </span>{" "}
              on {formatDate(asset.updatedAt)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
