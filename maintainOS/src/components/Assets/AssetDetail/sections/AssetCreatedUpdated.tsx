import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";

export function AssetCreatedUpdated() {
  return (
    <>
      <div className="border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <span>Created By</span>
          <Avatar className="w-5 h-5">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <span>Ashwini Chauhan on 19/09/2025, 11:41</span>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-3">
          <span>Last updated By</span>
          <Avatar className="w-5 h-5">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <span>Ashwini Chauhan on 19/09/2025, 15:35</span>
        </div>
      </div>
    </>
  );
}
