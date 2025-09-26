"use client";

import { Building, ChevronDown, Plus } from "lucide-react";
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
// import { locationService } from "../../store/locations/locationService"; // update path
import type { LocationResponse } from "../../store/locations";

export function Locations() {
  const [showForm, setShowForm] = useState(false);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await locationService.fetchLocations(10, 1, 0);
        // setLocations(res);
        console.log(res);
        // setError(null);
      } catch (err) {
        // console.error(err);
        // setError("Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="h-screen flex flex-col p-2 overflow-hidden">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-none">
        <div>
          <h1>Locations</h1>
          <p className="text-muted-foreground">
            Manage facility hierarchy and location structure
          </p>
        </div>
        <div className="gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Two Cards Layout */}
      <div className="flex gap-2 flex-1 overflow-hidden mt-6 min-h-0">
        {/* Left Card (~40%) */}
        <div className="border w-96 flex flex-col">
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
            {loading && <p className="p-4 text-center">Loading...</p>}
            {error && <p className="p-4 text-center text-red-500">{error}</p>}
            {!loading && !error && locations?.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">
                No locations found
              </p>
            )}
            {!loading && !error && locations?.length > 0 && (
              <ul>
                {locations?.map((loc) => (
                  <li
                    key={loc.id}
                    className="p-2 border-b cursor-pointer hover:bg-gray-50"
                  >
                    {loc.name}
                  </li>
                ))}
              </ul>
            )}
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
