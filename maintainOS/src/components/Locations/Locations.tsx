"use client";

import { Building, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { NewLocationForm } from "./NewLocationForm/NewLocationForm";

export function Locations() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="h-screen flex flex-col p-2 overflow-hidden">
      {/* Page Header (Fixed) */}
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

      {/* Two Cards Layout using flex */}
      <div className="flex gap-2 flex-1 overflow-hidden mt-6 min-h-0">
        {/* Left Card (~40%) */}
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
