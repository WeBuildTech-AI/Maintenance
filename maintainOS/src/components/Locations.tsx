import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus, MapPin, Building, QrCode, Upload } from "lucide-react";

export function Locations() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Locations</h1>
          <p className="text-muted-foreground">
            Manage facility hierarchy and location structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Codes
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Hierarchy</CardTitle>
            <CardDescription>Tree structure of facilities and areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
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
                  <div className="ml-6">
                    <div className="flex items-center gap-2 p-2 text-sm">
                      <span>Line A Station 1</span>
                      <Badge variant="outline">3 assets</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <MapPin className="h-4 w-4" />
                    <span>Utility Room</span>
                    <Badge variant="secondary">4 assets</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Management</CardTitle>
            <CardDescription>Add, edit, and organize facility locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Location editing interface, map integration, and asset assignment would be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}