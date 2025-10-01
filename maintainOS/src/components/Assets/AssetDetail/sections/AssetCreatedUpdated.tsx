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
      <div className="border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <span>Created By</span>
          <Avatar className="w-7 h-7">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
            <AvatarFallback>{renderInitials(user?.fullName)}</AvatarFallback>
          </Avatar>
          <span>
            {user?.fullName} on {formatDate(asset?.createdAt)}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-3">
          <span>Last updated By</span>
          <Avatar className="w-7 h-7">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
            <AvatarFallback>{renderInitials(user?.fullName)}</AvatarFallback>
          </Avatar>
          <span>
            {user?.fullName} on {formatDate(asset?.updatedAt)}
          </span>
        </div>
      </div>
    </>
  );
}
