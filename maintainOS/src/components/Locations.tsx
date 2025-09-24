"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Plus,
  MapPin,
  Building,
  LayoutGrid,
  ChevronDown,
  Search,
  AlertTriangle,
  Settings,
  TableIcon,
} from "lucide-react";
import { NewLocationForm } from "../components/Locations/NewLocationForm";
import { Input } from "./ui/input";

export function Locations() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"panel" | "table">("panel");

  const LocationsTable = () => (
    <div className="p-6">
      <table className="w-full border">
        <thead>
          <tr className="bg-muted text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Assets</th>
            <th className="p-2">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2">Manufacturing Plant</td>
            <td className="p-2">12</td>
            <td className="p-2">Building</td>
          </tr>
          <tr className="border-t">
            <td className="p-2">Production Floor 1</td>
            <td className="p-2">8</td>
            <td className="p-2">Area</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Page Header */}
      <div className="border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Locations</h1>

            {/* View Mode Toggle */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                setViewMode(viewMode === "panel" ? "table" : "panel")
              }
            >
              {viewMode === "panel" ? (
                <>
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Panel View
                  </span>
                </>
              ) : (
                <>
                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Table View
                  </span>
                </>
              )}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {/* Search + Button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              className="gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              New Location
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Criticality
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-orange-600">
            <Settings className="h-4 w-4" />
            My Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "panel" ? (
        <div className="flex gap-6 flex-1 overflow-hidden mt-6 min-h-0">
          {/* Left Panel (Hierarchy) */}
          <Card className="flex flex-col h-full overflow-hidden w-96">
            <CardHeader>
              <CardTitle>Location Hierarchy</CardTitle>
              <CardDescription>
                Tree structure of facilities and areas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2">
                  <Building className="h-4 w-4" />
                  <span className="font-medium">Manufacturing Plant</span>
                  <Badge variant="outline">12 assets</Badge>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="flex items-center gap-2 p-2">
                    <MapPin className="h-4 w-4" />
                    <span>Production Floor 1</span>
                    <Badge variant="secondary">8 assets</Badge>
                  </div>
                  <div className="ml-6 flex items-center gap-2 p-2 text-sm">
                    <span>Line A Station 1</span>
                    <Badge variant="outline">3 assets</Badge>
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <MapPin className="h-4 w-4" />
                    <span>Utility Room</span>
                    <Badge variant="secondary">4 assets</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side (Panel Content) */}
          <Card className="flex flex-col h-full overflow-hidden flex-1">
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              {showForm ? (
                <div className="p-6">NewLocationForm goes here...</div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Location editing interface, map integration, and asset
                  assignment would be implemented here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Table View (full width, only header stays)
        <div className="flex-1 overflow-y-auto mt-6 min-h-0">
          <LocationsTable />
        </div>
      )}
    </div>
  );
}
