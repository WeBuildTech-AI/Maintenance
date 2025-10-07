import { ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { MeterCard } from "./MeterCard";
import Loader from "../../Loader/Loader";

export function MetersList({
  filteredMeters,
  selectedMeter,
  setSelectedMeter,
  loading,
  getAssetData,
  getLocationData,
  handleShowNewMeterForm,
}: any) {
  const meters = Array.isArray(filteredMeters) ? filteredMeters : [];

  return (
    <div className="w-96 border ml-3 mr-2 border-border bg-card flex flex-col">
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort By:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary p-2 h-auto"
              >
                Name: Ascending Order
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name: Ascending Order</DropdownMenuItem>
              <DropdownMenuItem>Name: Descending Order</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Last Reading</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <>
            <Loader />
          </>
        ) : (
          <>
            <div className="">
              {meters?.map((meter: any) => (
                <MeterCard
                  key={meter.id}
                  meter={meter}
                  selectedMeter={selectedMeter}
                  setSelectedMeter={setSelectedMeter}
                  getAssetData={getAssetData}
                  getLocationData={getLocationData}
                />
              ))}

              {meters.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">No meters found</p>
                  <Button
                    variant=""
                    onClick={() => handleShowNewMeterForm(true)}
                    className="text-primary bg-white p-0 cursor-pointer"
                  >
                    Create the first meter
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
