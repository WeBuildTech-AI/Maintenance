"use client";

import { Building, ChevronDown, Edit, Link, MapPin, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import Loader from "../Loader/Loader";
import { formatDate } from "../utils/Date";
import { LocationTable } from "./LocationTable";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function Locations() {
  const hasFetched = useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<
    (typeof locations)[0] | null
  >(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<
    LocationResponse[]
  >([]);

  // Fetch locations on mount
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await locationService.fetchLocations(10, 1, 0);
        setLocations(res);
        setFilteredLocations(res); // initially same
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        hasFetched.current = true;
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredLocations(
        locations.filter(
          (loc) => loc.name.toLowerCase().includes(lowerQuery) // assuming "name" field exists
        )
      );
    }
  }, [searchQuery, locations]);

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {LocationHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setShowForm,
        setShowSettings
      )}

      {viewMode === "table" ? (
        <>
          <LocationTable
            location={locations}
            selectedLocation={selectedLocation}
          />
        </>
      ) : (
        <>
          <div className="flex gap-2 flex-1 overflow-hidden mt-6 min-h-0">
            {/* Left Card (~40%) */}
            <div
              className="border ml-3 mr-2 w-96
         flex flex-col"
            >
              <div className="p-3 border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Sort By:
                  </span>
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
                      <DropdownMenuItem>
                        Name: Descending Order
                      </DropdownMenuItem>
                      <DropdownMenuItem>Status</DropdownMenuItem>
                      <DropdownMenuItem>Location</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 ">
                <div className="">
                  {loading ? (
                    // Loader first
                    <Loader />
                  ) : filteredLocations && filteredLocations?.length > 0 ? (
                    // Locations list
                    filteredLocations?.map((items) => (
                      <Card
                        key={items.id}
                        onClick={() => setSelectedLocation(items)}
                        className={`cursor-pointer hover:border-blue-400 ${
                          selectedLocation?.id === items.id
                            ? "border-blue-500"
                            : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {items.icon || renderInitials(items.name)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <h4 className="font-medium capitalize">
                                  {items.name}
                                </h4>
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
                      <p className="text-muted-foreground mb-2">
                        No Locations found
                      </p>
                      <Button variant="link" className="text-primary p-0">
                        Create the first asset
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Card className="flex flex-col h-full overflow-hidden flex-1 mr-2">
              <CardContent className="flex-1 overflow-y-auto min-h-0">
                {showForm ? (
                  <NewLocationForm
                    onCancel={() => setShowForm(false)}
                    onCreate={() => setShowForm(false)}
                  />
                ) : selectedLocation ? (
                  <div className="max-w-2xl p-4 mx-auto bg-white">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800 capitalize ">
                        {selectedLocation?.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          title="Copy Link"
                          className="p-2 rounded-md text-orange-600 cursor-pointer"
                        >
                          <Link size={18} />
                        </button>
                        <button
                          title="Edit"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md cursor-pointer text-orange-600 hover:bg-orange-50 border border-orange-600"
                        >
                          <Edit size={16} /> Edit
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700">
                        Description
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {selectedLocation.description ||
                          "No description available"}
                      </p>
                    </div>

                    <hr className="my-4" />

                    {/* Sub-Locations */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700">
                        Sub-Locations (0)
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Add sub elements inside this Location
                      </p>
                      <button className="mt-2 text-blue-600 hover:underline text-sm">
                        Create Sub-Location
                      </button>
                    </div>

                    <hr className="my-4" />

                    {/* Footer */}
                    <div className="text-sm text-gray-500">
                      Created By{" "}
                      <span className="font-medium text-gray-700 capitalize">
                        {/* Replace with actual creator’s name if available */}
                        {selectedLocation?.name}
                      </span>{" "}
                      on {formatDate(selectedLocation.createdAt)}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 flex justify-center">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 p-2 rounded-full text-sm shadow-sm transition">
                        Use in New Work Order
                      </button>
                    </div>
                  </div>
                ) : (
                  // 👉 Show placeholder if nothing is selected
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a location to view details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Two Cards Layout */}
    </div>
  );
}
