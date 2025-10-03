import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import type { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { formatDate } from "../../utils/Date";

export function MeterWorkOrders({ selectedMeter }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">
          Upcoming Reading Work Orders (1)
        </h2>
        <Button
          variant="ghost"
          className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm">📧</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Check the voltage #5</span>
                <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Created by{" "}
                <Avatar className="inline-flex w-6 h-6 mx-1 align-text-bottom">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>
                    {renderInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
                {user?.fullName} on {formatDate(selectedMeter?.createdAt)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Due Date:</div>
            <div className="text-sm font-medium">22/09/2025, 12:00</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
