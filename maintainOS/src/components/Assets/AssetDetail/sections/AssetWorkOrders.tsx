import { CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";

export function AssetWorkOrders() {
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <div className="border-t border-border pt-8">
      <div className="space-y-4">
        {/* Daily inspection - Open */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
              <span className="text-orange-600 text-sm">📋</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Daily inspection</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Requested by</span>
                <Avatar className="w-7 h-7">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>
                    {renderInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span>{user?.fullName}</span>
              </div>
              <Badge
                variant="outline"
                className="mt-2 bg-orange-50 text-orange-700 border-orange-200"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
                Open
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 mb-2"
            >
              Electrical
            </Badge>
            <div className="text-sm text-muted-foreground">#6</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Daily inspection - Done */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
              <span className="text-orange-600 text-sm">📋</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Daily inspection</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Completed by</span>
                <Avatar className="w-7 h-7">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>
                    {renderInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span>{user?.fullName}</span>
              </div>
              <Badge
                variant="outline"
                className="mt-2 bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Done
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 mb-2"
            >
              Electrical
            </Badge>
            <div className="text-sm text-muted-foreground">#2</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Check the voltage - Done #1 */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
              <span className="text-orange-600 text-sm">📋</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Check the voltage</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Completed by</span>
                <Avatar className="w-7 h-7">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>
                    {renderInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span>{user?.fullName}</span>
              </div>
              <Badge
                variant="outline"
                className="mt-2 bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Done
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 mb-2"
            >
              Electrical
            </Badge>
            <div className="text-sm text-muted-foreground">#3</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Check the voltage - Done #2 */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
              <span className="text-orange-600 text-sm">📋</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Check the voltage</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Completed by</span>
                <Avatar className="w-7 h-7">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>
                    {renderInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span>{user?.fullName}</span>
              </div>
              <Badge
                variant="outline"
                className="mt-2 bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Done
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 mb-2"
            >
              Electrical
            </Badge>
            <div className="text-sm text-muted-foreground">#4</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Check the voltage - Requested #5 */}
        <div className="mt-8">
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                <span className="text-orange-600 text-sm">📋</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Check the voltage</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Requested by</span>
                  <Avatar className="w-7 h-7">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                    <AvatarFallback>
                      {renderInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user?.fullName}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">#5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
