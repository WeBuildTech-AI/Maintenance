import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
  AlertTriangle,
  Zap,
  Building2,
  Edit,
  MoreHorizontal,
  MapPin,
  Tag,
  Clock,
  Calendar,
  Play,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for meters
const mockMeters = [
  {
    id: "M-001",
    name: "Electrical",
    type: "HVAC",
    asset: "HVAC Unit 1",
    location: "General",
    lastReading: "50 Feet",
    status: "Overdue",
    isOverdue: true,
    unit: "Feet",
  },
  {
    id: "M-002",
    name: "Water Flow",
    type: "Plumbing",
    asset: "Main Pipe",
    location: "Building A",
    lastReading: "120 Liters",
    status: "Normal",
    isOverdue: false,
    unit: "Liters",
  },
  {
    id: "M-003",
    name: "Gas Pressure",
    type: "Gas",
    asset: "Boiler 1",
    location: "Basement",
    lastReading: "70 PSI",
    status: "Normal",
    isOverdue: false,
    unit: "PSI",
  },
  {
    id: "M-004",
    name: "Temperature",
    type: "HVAC",
    asset: "Chiller 1",
    location: "Roof",
    lastReading: "18 °C",
    status: "Overdue",
    isOverdue: true,
    unit: "°C",
  },
  {
    id: "M-005",
    name: "Energy Consumption",
    type: "Electrical",
    asset: "Main Transformer",
    location: "Building B",
    lastReading: "250 kWh",
    status: "Normal",
    isOverdue: false,
    unit: "kWh",
  },
];

// Mock reading data for the chart
const mockReadingData = [
  { date: "13 Sep", value: 20 },
  { date: "14 Sep", value: 20 },
  { date: "15 Sep", value: 20 },
  { date: "16 Sep", value: 20 },
  { date: "17 Sep", value: 20 },
  { date: "18 Sep", value: 22 },
  { date: "19 Sep", value: 50 }
];

export function Meters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMeterForm, setShowNewMeterForm] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [meterType, setMeterType] = useState("manual");
  const [selectedMeter, setSelectedMeter] = useState<typeof mockMeters[0] | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1W");

  // New meter form state
  const [newMeter, setNewMeter] = useState({
    name: "",
    description: "",
    measurementUnit: "",
    asset: "",
    location: ""
  });

  const filteredMeters = mockMeters.filter(meter => {
    const matchesSearch = meter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meter.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meter.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || meter.type.toLowerCase() === selectedType.toLowerCase();
    const matchesAsset = selectedAsset === "all" || meter.asset.toLowerCase() === selectedAsset.toLowerCase();
    const matchesLocation = selectedLocation === "all" || meter.location.toLowerCase() === selectedLocation.toLowerCase();
    
    return matchesSearch && matchesType && matchesAsset && matchesLocation;
  });

  const handleCreateMeter = () => {
    // Handle meter creation logic here
    console.log("Creating meter:", { ...newMeter, type: meterType });
    setShowNewMeterForm(false);
    setNewMeter({
      name: "",
      description: "",
      measurementUnit: "",
      asset: "",
      location: ""
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Meters</h1>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Panel View</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search Meters"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button 
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowNewMeterForm(true)}
            >
              <Plus className="h-4 w-4" />
              New Meter
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1">
          <Button
            variant={selectedType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedType("all")}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Type
          </Button>
          <Button
            variant={selectedAsset === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedAsset("all")}
            className="gap-2"
          >
            <Building2 className="h-4 w-4" />
            Asset
          </Button>
          <Button
            variant={selectedLocation === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedLocation("all")}
            className="gap-2"
          >
            📍 Location
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Panel - Meters List */}
        <div className="w-112 border-r border-border bg-card flex flex-col">
          {/* Sort */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort By:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
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

          {/* Meters List */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-3">
              {filteredMeters.map(meter => (
                <Card 
                  key={meter.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedMeter?.id === meter.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
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
              ))}
              
              {filteredMeters.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">No meters found</p>
                  <Button variant="link" className="text-primary p-0">
                    Create the first meter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 bg-card">
          {showNewMeterForm ? (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-6">New Meter</h2>
              
              <div className="space-y-6 max-w-md">
                {/* Meter Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter Meter Name (Required)
                  </label>
                  <Input
                    placeholder="Enter Meter Name (Required)"
                    value={newMeter.name}
                    onChange={(e) => setNewMeter({ ...newMeter, name: e.target.value })}
                    className="w-full"
                  />
                </div>

                {/* Meter Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meter Type
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={meterType === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMeterType("manual")}
                      className="gap-2"
                    >
                      👤 Manual
                    </Button>
                    <Button
                      variant={meterType === "automated" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMeterType("automated")}
                      className="gap-2"
                    >
                      🔧 Automated
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Add a description"
                    value={newMeter.description}
                    onChange={(e) => setNewMeter({ ...newMeter, description: e.target.value })}
                    className="w-full min-h-[100px]"
                  />
                </div>

                {/* Measurement Unit */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Measurement Unit (Required)
                  </label>
                  <Select
                    value={newMeter.measurementUnit}
                    onValueChange={(value: string) => setNewMeter({ ...newMeter, measurementUnit: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Start typing to search or customize" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feet">Feet</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="gallons">Gallons</SelectItem>
                      <SelectItem value="kwh">kWh</SelectItem>
                      <SelectItem value="cubic-meters">Cubic Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Asset and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Asset
                    </label>
                    <Select
                      value={newMeter.asset}
                      onValueChange={(value: string) => setNewMeter({ ...newMeter, asset: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Start typing..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hvac-1">HVAC Unit 1</SelectItem>
                        <SelectItem value="hvac-2">HVAC Unit 2</SelectItem>
                        <SelectItem value="boiler-1">Boiler 1</SelectItem>
                        <SelectItem value="chiller-1">Chiller 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    <Select
                      value={newMeter.location}
                      onValueChange={(value: string) => setNewMeter({ ...newMeter, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Start typing..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="building-a">Building A</SelectItem>
                        <SelectItem value="building-b">Building B</SelectItem>
                        <SelectItem value="basement">Basement</SelectItem>
                        <SelectItem value="roof">Roof</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <Button 
                    onClick={handleCreateMeter}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!newMeter.name || !newMeter.measurementUnit}
                  >
                    Create
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowNewMeterForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedMeter ? (
            /* Meter Detail View */
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-medium">{selectedMeter.name}</h1>
                  <div className="flex items-center gap-2">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Record Reading
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-blue-600">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedMeter.asset}</span>
                    <span>-</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedMeter.location}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-8">
                {/* Readings Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Readings</h2>
                    <div className="flex items-center gap-1">
                      {["1H", "1D", "1W", "1M", "3M", "6M", "1Y", "Custom"].map((period) => (
                        <Button
                          key={period}
                          variant={selectedTimePeriod === period ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedTimePeriod(period)}
                          className={selectedTimePeriod === period ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">{selectedMeter.unit}</div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockReadingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#666" }}
                          />
                          <YAxis
                            domain={[15, 55]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#666" }}
                          />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* See All Readings Button */}
                    <div className="pt-4">
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        See All Readings
                      </Button>
                    </div>
                  </div>
                </div>


                {/* Meter Details Section */}
                <div>
                  <h2 className="text-lg font-medium mb-6">Meter Details</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Measurement Unit */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Measurement Unit</h3>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">{selectedMeter.unit}</span>
                      </div>
                    </div>

                    {/* Last Reading */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Reading</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">{selectedMeter.lastReading}</span>
                      </div>
                    </div>

                    {/* Last Reading On */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Reading On</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">19/09/2025, 13:28</span>
                      </div>
                    </div>

                    {/* Reading Frequency */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Reading Frequency</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">Every 1 hour</span>
                      </div>
                    </div>

                    {/* Next Reading */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Reading</h3>
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <span className="text-base">Today by 14:28</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automations Section */}
                <div>
                  <h2 className="text-lg font-medium mb-4">Automations (0)</h2>
                  <div className="border border-dashed border-border rounded-lg p-6">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Create Automation
                    </Button>
                  </div>
                </div>

                {/* Upcoming Reading Work Orders Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Upcoming Reading Work Orders (1)</h2>
                    <Button variant="ghost" className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto">
                      See all
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm">📧</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Check the voltage #5</span>
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">⚡</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created by{" "}
                            <Avatar className="inline-flex w-4 h-4 mx-1 align-text-bottom">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
                              <AvatarFallback>AC</AvatarFallback>
                            </Avatar>
                            Ashwini Chauhan on 19/09/2025, 11:56
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Due Date:</div>
                        <div className="text-sm font-medium">22/09/2025, 12:00</div>
                      </div>
                    </div>
                  </Card>
                </div>

                
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                </div>
                <p className="text-muted-foreground mb-2">Select a meter to view details</p>
                <p className="text-sm text-muted-foreground">or create a new meter to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}