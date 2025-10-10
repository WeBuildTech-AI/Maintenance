import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { formatDate } from "../../../utils/Date";

export function AssetCreatedUpdated({ asset }: { asset: any }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <>
      <div>
        {asset.createdAt === asset.updatedAt ? (
          <>
            <div className="text-sm text-gray-500 mt-2">
              Created By{" "}
              <span className="capitalize font-medium text-gray-700">
                {user?.fullName}
              </span>{" "}
              on {formatDate(asset.createdAt)}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500 mt-2">
              Created By{" "}
              <span className="capitalize font-medium text-gray-700">
                {user?.fullName}
              </span>{" "}
              on {formatDate(asset.createdAt)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Updated By{" "}
              <span className="capitalize font-medium text-gray-700">
                {user?.fullName}
              </span>{" "}
              on {formatDate(asset.updatedAt)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
