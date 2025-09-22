import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Search,
  Plus,
  LayoutGrid,
  ChevronDown,
  Filter,
  Settings,
  MapPin,
  Upload,
  Image as ImageIcon,
  File,
  AlertTriangle,
  Link,
  Edit,
  MoreHorizontal,
  ChevronRight,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for assets
const mockAssets = [
  {
    id: "AST-001",
    name: "HVAC Unit",
    location: "Building A - Roof",
    status: "Online",
    isOnline: true,
    icon: "🏠",
    criticality: "High",
    manufacturer: "Siemens",
    model: "dpr123",
  },
  {
    id: "AST-002", 
    name: "Boiler #1",
    location: "Basement - Mechanical Room",
    status: "Online",
    isOnline: true,
    icon: "🔥",
    criticality: "Critical",
    manufacturer: "Viessmann",
    model: "B200H-80",
  },
  {
    id: "AST-003",
    name: "Emergency Generator",
    location: "Building B - Generator Room", 
    status: "Offline",
    isOnline: false,
    icon: "⚡",
    criticality: "Critical",
    manufacturer: "Caterpillar",
    model: "C18-ACERT",
  },
  {
    id: "AST-004",
    name: "Water Pump #1",
    location: "Basement - Pump Room",
    status: "Online",
    isOnline: true,
    icon: "💧",
    criticality: "High",
    manufacturer: "Grundfos",
    model: "CR64-2-2",
  },
  {
    id: "AST-005",
    name: "Air Compressor",
    location: "Warehouse - Equipment Bay",
    status: "Online", 
    isOnline: true,
    icon: "🌀",
    criticality: "Medium",
    manufacturer: "Atlas Copco",
    model: "GA30VSD",
  },
  {
    id: "AST-006",
    name: "Elevator Motor",
    location: "Building A - Elevator Shaft",
    status: "Maintenance",
    isOnline: false,
    icon: "🏗️",
    criticality: "High",
    manufacturer: "Otis",
    model: "GeN2-MR",
  },
  {
    id: "AST-007",
    name: "Cooling Tower",
    location: "Roof - West Side",
    status: "Online",
    isOnline: true,
    icon: "❄️",
    criticality: "High",
    manufacturer: "Baltimore Aircoil",
    model: "VTI-1500",
  },
  {
    id: "AST-008",
    name: "Industrial Chiller",
    location: "Building B - HVAC Room",
    status: "Online",
    isOnline: true,
    icon: "🧊",
    criticality: "Critical",
    manufacturer: "Trane",
    model: "CVHF-2000",
  },
  {
    id: "AST-009",
    name: "Lighting Control Panel",
    location: "Building A - Electrical Room",
    status: "Online",
    isOnline: true,
    icon: "💡",
    criticality: "Low",
    manufacturer: "Lutron",
    model: "HomeWorks QS",
  },
  {
    id: "AST-010",
    name: "Fire Pump",
    location: "Basement - Fire Protection",
    status: "Online",
    isOnline: true,
    icon: "🚨",
    criticality: "Critical",
    manufacturer: "Pentair",
    model: "Aurora 4280",
  },
  {
    id: "AST-011",
    name: "UPS System",
    location: "Building A - Server Room",
    status: "Online",
    isOnline: true,
    icon: "🔋",
    criticality: "Critical",
    manufacturer: "APC",
    model: "Galaxy 7000",
  },
  {
    id: "AST-012",
    name: "Conveyor Belt #3",
    location: "Warehouse - Production Line",
    status: "Offline",
    isOnline: false,
    icon: "📦",
    criticality: "Medium",
    manufacturer: "Dorner",
    model: "2200 Series",
  },
  {
    id: "AST-013",
    name: "Steam Boiler",
    location: "Building C - Mechanical",
    status: "Online",
    isOnline: true,
    icon: "♨️",
    criticality: "High",
    manufacturer: "Cleaver-Brooks",
    model: "CB-700-300",
  },
  {
    id: "AST-014",
    name: "Waste Water Pump",
    location: "Basement - Utility Room",
    status: "Online",
    isOnline: true,
    icon: "🌊",
    criticality: "Medium",
    manufacturer: "Flygt",
    model: "3127.171",
  },
  {
    id: "AST-015",
    name: "Transformer #2",
    location: "Electrical Yard",
    status: "Online",
    isOnline: true,
    icon: "⚡",
    criticality: "Critical",
    manufacturer: "ABB",
    model: "ONAN-1500",
  }
];

export function Assets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewAssetForm, setShowNewAssetForm] =
    useState(false);
  const [selectedAsset, setSelectedAsset] = useState<
    (typeof mockAssets)[0] | null
  >(null);

  // New asset form state
  const [newAsset, setNewAsset] = useState({
    name: "",
    location: "",
  });

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesSearch =
      asset.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      asset.location
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleCreateAsset = () => {
    // Handle asset creation logic here
    console.log("Creating asset:", newAsset);
    setShowNewAssetForm(false);
    setNewAsset({
      name: "",
      location: "",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle file drop logic here
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Assets</h1>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Panel View
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
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
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowNewAssetForm(true)}
            >
              <Plus className="h-4 w-4" />
              New Asset
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Criticality
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-blue-600"
          >
            <Settings className="h-4 w-4" />
            My Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Assets List */}
        <div className="w-112 border-r border-border bg-card flex flex-col min-h-0">
          {/* Sort */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Sort By:
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary p-0 h-auto"
                  >
                    Name: Ascending Order
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    Name: Ascending Order
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Name: Descending Order
                  </DropdownMenuItem>
                  <DropdownMenuItem>Status</DropdownMenuItem>
                  <DropdownMenuItem>Location</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Assets List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-3">
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className={`cursor-pointer transition-colors ${
                    selectedAsset?.id === asset.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-lg">{asset.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {asset.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {asset.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={`gap-1 ${
                            asset.status === "Online"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : asset.status === "Offline"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              asset.status === "Online"
                                ? "bg-green-500"
                                : asset.status === "Offline"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          {asset.status}
                        </Badge>
                        {asset.criticality && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              asset.criticality === "Critical"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : asset.criticality === "High"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : asset.criticality === "Medium"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {asset.criticality}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAssets.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    No assets found
                  </p>
                  <Button
                    variant="link"
                    className="text-primary p-0"
                  >
                    Create the first asset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 bg-card min-h-0 flex flex-col">
          {showNewAssetForm ? (
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-lg font-medium mb-6">
                New Asset
              </h2>

              <div className="space-y-6 max-w-md">
                {/* Asset Name */}
                <div>
                  <Input
                    placeholder="Enter Asset Name (Required)"
                    value={newAsset.name}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        name: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Pictures */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pictures
                  </label>
                  <div
                    className="w-full h-32 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <ImageIcon className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-sm text-blue-600">
                      Add or drag pictures
                    </span>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Files
                  </label>
                  <div
                    className="w-full h-32 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <File className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-sm text-blue-600">
                      Add or drag files
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Select
                    value={newAsset.location}
                    onValueChange={(value: string) =>
                      setNewAsset({
                        ...newAsset,
                        location: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        General
                      </SelectItem>
                      <SelectItem value="building-a">
                        Building A
                      </SelectItem>
                      <SelectItem value="building-b">
                        Building B
                      </SelectItem>
                      <SelectItem value="basement">
                        Basement
                      </SelectItem>
                      <SelectItem value="roof">Roof</SelectItem>
                      <SelectItem value="warehouse">
                        Warehouse
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleCreateAsset}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!newAsset.name}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedAsset ? (
            <div className="h-full flex flex-col min-h-0">
              {/* Asset Header */}
              <div className="p-6 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-medium">
                      {selectedAsset.name}
                    </h1>
                    <Link className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                    <TabsTrigger value="details">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      History
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Asset Content */}
              <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8">
                {/* Status and Meter Readings */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">
                      Status and Meter Readings
                    </h2>
                    <Button
                      variant="ghost"
                      className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto"
                    >
                      See More
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Status Dropdown */}
                    <Select defaultValue="online">
                      <SelectTrigger className="w-48">
                        <div className="flex items-center gap-2">
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Online
                          </div>
                        </SelectItem>
                        <SelectItem value="offline">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Offline
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Last Updated */}
                    <p className="text-sm text-muted-foreground">
                      Last updated:{" "}
                      <span className="font-medium">
                        MaintainX
                      </span>
                      , Today at 11:41
                    </p>

                    {/* Meter Reading Card */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            Electrical
                          </span>
                          <span className="text-muted-foreground">
                            50 Feet
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>
                                AC
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              Ashwini Chauhan, Today at 13:28
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-medium mb-3">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{selectedAsset.location}</span>
                  </div>
                </div>

                {/* Criticality */}
                <div>
                  <h3 className="font-medium mb-3">
                    Criticality
                  </h3>
                  <Badge
                    variant="outline"
                    className={`inline-flex w-fit ${
                      selectedAsset.criticality === "Critical"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : selectedAsset.criticality === "High"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : selectedAsset.criticality === "Medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {selectedAsset.criticality || "None"}
                  </Badge>
                </div>

                {/* Manufacturer */}
                <div>
                  <h3 className="font-medium mb-3">
                    Manufacturer
                  </h3>
                  <p>{selectedAsset.manufacturer}</p>
                </div>

                {/* Use in New Work Order Button */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Calendar className="h-4 w-4" />
                    Use in New Work Order
                  </Button>
                </div>

                {/* Model */}
                <div className="border-t border-border pt-8">
                  <h3 className="font-medium mb-3">Model</h3>
                  <p>{selectedAsset.model}</p>
                </div>

                {/* Sub-Assets */}
                <div className="border-t border-border pt-8">
                  <h3 className="font-medium mb-3">
                    Sub-Assets (0)
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add sub elements inside this Asset
                  </p>
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    Create Sub-Asset
                  </Button>
                </div>

                {/* Automations */}
                <div className="border-t border-border pt-8">
                  <h3 className="font-medium mb-4">
                    Automations (0)
                  </h3>
                  <div className="border border-dashed border-border rounded-lg p-6">
                    <Button
                      variant="ghost"
                      className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                      Create Automation
                    </Button>
                  </div>
                </div>

                {/* Created By */}
                <div className="border-t border-border pt-8">
                  <div className="flex items-center gap-3">
                    <span>Created By</span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <span>
                      Ashwini Chauhan on 19/09/2025, 11:41
                    </span>
                  </div>
                </div>

                {/* Last Updated By */}
                <div className="pt-4">
                  <div className="flex items-center gap-3">
                    <span>Last updated By</span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <span>
                      Ashwini Chauhan on 19/09/2025, 15:35
                    </span>
                  </div>
                </div>

                {/* Work Order History */}
                <div className="border-t border-border pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium">
                      Work Order History
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Aug 1 - Sep 19
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Filter className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64 mb-6">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={[
                          { date: "29/07/2025", value: 0 },
                          { date: "04/08/2025", value: 0 },
                          { date: "11/08/2025", value: 0 },
                          { date: "18/08/2025", value: 0 },
                          { date: "25/08/2025", value: 0 },
                          { date: "01/09/2025", value: 0 },
                          { date: "08/09/2025", value: 0 },
                          { date: "15/09/2025", value: 3 },
                        ]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{
                            fill: "#3b82f6",
                            strokeWidth: 2,
                            r: 4,
                          }}
                          activeDot={{ r: 6, fill: "#3b82f6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Work Order List */}
                  <div className="space-y-4">
                    {/* Daily inspection - Open */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-sm">
                            📋
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">
                            Daily inspection
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Requested by</span>
                            <Avatar className="w-4 h-4">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>
                                AC
                              </AvatarFallback>
                            </Avatar>
                            <span>Ashwini Chauhan</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                            Open
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 mb-2"
                        >
                          Electrical
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          #6
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs text-muted-foreground">
                            High
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Daily inspection - Done */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-sm">
                            📋
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">
                            Daily inspection
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Completed by</span>
                            <Avatar className="w-4 h-4">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>
                                AC
                              </AvatarFallback>
                            </Avatar>
                            <span>Ashwini Chauhan</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 mb-2"
                        >
                          Electrical
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          #2
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs text-muted-foreground">
                            High
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Check the voltage - Done #1 */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-sm">
                            📋
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">
                            Check the voltage
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Completed by</span>
                            <Avatar className="w-4 h-4">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>
                                AC
                              </AvatarFallback>
                            </Avatar>
                            <span>Ashwini Chauhan</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 mb-2"
                        >
                          Electrical
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          #3
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs text-muted-foreground">
                            High
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Check the voltage - Done #2 */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-sm">
                            📋
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">
                            Check the voltage
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Completed by</span>
                            <Avatar className="w-4 h-4">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>
                                AC
                              </AvatarFallback>
                            </Avatar>
                            <span>Ashwini Chauhan</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 mb-2"
                        >
                          Electrical
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          #4
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs text-muted-foreground">
                            High
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Use in New Work Order Button */}
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full px-6"
                    >
                      <Calendar className="h-4 w-4" />
                      Use in New Work Order
                    </Button>
                  </div>

                  {/* Check the voltage - Requested */}
                  <div className="mt-8">
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-sm">
                            📋
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">
                            Check the voltage
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Requested by</span>
                            <Avatar className="w-4 h-4">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>
                                AC
                              </AvatarFallback>
                            </Avatar>
                            <span>Ashwini Chauhan</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          #5
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                </div>
                <p className="text-muted-foreground mb-2">
                  Select an asset to view details
                </p>
                <p className="text-sm text-muted-foreground">
                  or create a new asset to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}