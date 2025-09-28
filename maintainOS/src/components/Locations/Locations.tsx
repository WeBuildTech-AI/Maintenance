"use client";

import { Building, ChevronDown, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NewLocationForm } from "./NewLocationForm/NewLocationForm";
import { locationService } from "../../store/locations";
import type { LocationResponse } from "../../store/locations";
import type { ViewMode } from "../purchase-orders/po.types";
import { LocationHeaderComponent } from "./LocationsHeader";

export function Locations() {
  const [showForm, setShowForm] = useState(false);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);


  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await locationService.fetchLocations(10, 1, 0);
        setLocations(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {LocationHeaderComponent(viewMode, setViewMode, searchQuery, setSearchQuery, setShowForm, setShowSettings)}

      {/* Two Cards Layout */}
      <div className="flex gap-2 flex-1 overflow-hidden mt-6 min-h-0">
        {/* Left Card (~40%) */}
        <div
          className="border w-112
         flex flex-col"
        >
          <div className="p-3 border-b border-border flex-shrink-0">
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
                  <DropdownMenuItem>Location</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="">
              {loading ? (
                // Loader first
                <div className="flex justify-center items-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : locations && locations.length > 0 ? (
                // Locations list
                locations.map((items) => (
                  <Card key={items.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center"></div>
                          <div>
                            <h4 className="font-medium">{items.name}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {items.description}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Empty state
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">No assets found</p>
                  <Button variant="link" className="text-primary p-0">
                    Create the first asset
                  </Button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Card (~60%) */}
        <Card className="flex flex-col h-full overflow-hidden flex-1">
          <CardContent className="flex-1 overflow-y-auto min-h-0">
            {showForm ? (
              <NewLocationForm
                onCancel={() => setShowForm(false)}
                onCreate={() => setShowForm(false)}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Location editing interface, map integration, and asset
                assignment would be implemented here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
