import { AlertTriangle, Building2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";

export function MeterCard({ meter, selectedMeter, setSelectedMeter }: any) {
  return (
    <Card
      key={meter.id}
      className={`cursor-pointer transition-colors ${
        selectedMeter?.id === meter.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={() => setSelectedMeter(meter)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium">{meter.name}</h4>
          {meter.isOverdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
              <Building2 className="h-2 w-2 text-orange-600" />
            </div>
            <span className="text-sm">{meter.type}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
              <span className="text-xs">📍</span>
            </div>
            <span className="text-sm text-muted-foreground">{meter.location}</span>
          </div>

          <div className="mt-2">
            <span className="text-sm text-muted-foreground">Last Reading: {meter.lastReading}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
