import { Card, CardContent } from "../ui/card";
import type { Item } from "./Inventory";
import { mockLocations } from "./Inventory";

export function PartCard({
  item,
  selected,
  onSelect,
}: {
  item: Item;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{item.name}</h4>
            <div className="text-sm text-muted-foreground">
              {mockLocations.find((l) => l.id === item.locationId)?.name ?? "-"}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{item.unitsInStock} units</div>
        </div>
      </CardContent>
    </Card>
  );
}
