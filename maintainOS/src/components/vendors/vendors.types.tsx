export type VendorContact = {
  name: string;
  role?: string;
  phone?: string;
  phoneExtension?: string;
  email?: string;
  color?: string;
};

export type VendorLocation = {
  name: string;
  parent?: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  services: string[];
  contacts: VendorContact[];
  locations: VendorLocation[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  partsSummary?: string;
};

const colors = ["#2563eb", "#10b981", "#f97316", "#14b8a6", "#6366f1", "#ec4899"];

export const mockVendors: Vendor[] = [
  {
    id: "VEN-001",
    name: "Ramu Services",
    category: "Electrical",
    services: ["Preventive Maintenance", "Emergency Callouts"],
    contacts: [
      { name: "Ramu Verma", role: "Owner", phone: "+91 9876543210", email: "ramu@ramuservices.com", color: colors[1] },
    ],
    locations: [{ name: "Substation 1", parent: "Plant A" }],
    createdBy: "System",
    createdAt: "2025-01-05T09:00:00Z",
    updatedAt: "2025-01-10T09:00:00Z",
    partsSummary: "Switchgear, relays",
  },
  {
    id: "VEN-002",
    name: "Delta Pump Solutions",
    category: "Mechanical",
    services: ["Pump Overhaul", "Spare Supply"],
    contacts: [
      { name: "Miguel Rodriguez", role: "Account Manager", email: "miguel@delta.com", color: colors[0] },
    ],
    locations: [{ name: "Utility Yard", parent: "Pump Station" }],
    createdBy: "System",
    createdAt: "2025-01-06T09:00:00Z",
    updatedAt: "2025-01-11T09:00:00Z",
    partsSummary: "Mechanical seals, impellers",
  },
  {
    id: "VEN-003",
    name: "Skyline HVAC Partners",
    category: "HVAC",
    services: ["Chiller Maintenance", "Controls Tuning"],
    contacts: [{ name: "Emily Chen", role: "Technical Lead", phone: "+91 9123456789", color: colors[2] }],
    locations: [{ name: "Mechanical Yard", parent: "Plant HVAC" }],
    createdBy: "Priya Sharma",
    createdAt: "2025-01-07T09:00:00Z",
    updatedAt: "2025-01-12T09:00:00Z",
    partsSummary: "Control boards",
  },
  {
    id: "VEN-004",
    name: "FlowGuard Plumbing",
    category: "Plumbing",
    services: ["Pipe Replacement", "Leak Detection"],
    contacts: [{ name: "Anil Gupta", role: "Manager", email: "anil@flowguard.com", color: colors[3] }],
    locations: [{ name: "Basement", parent: "Building B" }],
    createdBy: "Admin",
    createdAt: "2025-01-08T09:00:00Z",
    updatedAt: "2025-01-13T09:00:00Z",
    partsSummary: "Valves, joints",
  },
  {
    id: "VEN-005",
    name: "BrightLight Electricals",
    category: "Electrical",
    services: ["Lighting Setup", "Energy Audit"],
    contacts: [{ name: "Rakesh Singh", role: "Supervisor", phone: "+91 9988776655", color: colors[4] }],
    locations: [{ name: "Admin Block", parent: "HQ" }],
    createdBy: "System",
    createdAt: "2025-01-09T09:00:00Z",
    updatedAt: "2025-01-14T09:00:00Z",
    partsSummary: "LEDs, wiring",
  },
  {
    id: "VEN-006",
    name: "TechSecure IT Solutions",
    category: "IT",
    services: ["CCTV Setup", "Network Security"],
    contacts: [{ name: "Sonia Mehta", role: "Engineer", email: "sonia@techsecure.com", color: colors[5] }],
    locations: [{ name: "Data Center", parent: "IT Wing" }],
    createdBy: "System",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
    partsSummary: "Servers, routers",
  },
  {
    id: "VEN-007",
    name: "PureAir Filters",
    category: "HVAC",
    services: ["Filter Replacement", "Duct Cleaning"],
    contacts: [{ name: "Manoj Kumar", role: "Technician", phone: "+91 9090909090", color: colors[0] }],
    locations: [{ name: "AHU Room", parent: "Plant HVAC" }],
    createdBy: "Admin",
    createdAt: "2025-01-11T09:00:00Z",
    updatedAt: "2025-01-16T09:00:00Z",
    partsSummary: "Air filters",
  },
  {
    id: "VEN-008",
    name: "AquaCool Chillers",
    category: "HVAC",
    services: ["Chiller Repair", "AMC Services"],
    contacts: [{ name: "Rahul Sharma", role: "Service Lead", color: colors[1] }],
    locations: [{ name: "Chiller Plant", parent: "Building C" }],
    createdBy: "System",
    createdAt: "2025-01-12T09:00:00Z",
    updatedAt: "2025-01-17T09:00:00Z",
    partsSummary: "Compressors, chillers",
  },
  {
    id: "VEN-009",
    name: "SafeGuard Fire Systems",
    category: "Safety",
    services: ["Fire Alarm Setup", "Sprinkler Testing"],
    contacts: [{ name: "Deepak Yadav", role: "Safety Officer", color: colors[2] }],
    locations: [{ name: "Fire Control Room", parent: "Building D" }],
    createdBy: "System",
    createdAt: "2025-01-13T09:00:00Z",
    updatedAt: "2025-01-18T09:00:00Z",
    partsSummary: "Sprinklers, smoke detectors",
  },
  {
    id: "VEN-010",
    name: "GreenGrow Landscaping",
    category: "Facility",
    services: ["Garden Maintenance", "Pest Control"],
    contacts: [{ name: "Kavita Rao", role: "Facility Manager", email: "kavita@greengrow.com", color: colors[3] }],
    locations: [{ name: "Campus Lawn" }],
    createdBy: "System",
    createdAt: "2025-01-14T09:00:00Z",
    updatedAt: "2025-01-19T09:00:00Z",
    partsSummary: "Lawn mowers",
  },
  // 👇 add 10 more to make ~20
  {
    id: "VEN-011",
    name: "CleanPro Housekeeping",
    category: "Facility",
    services: ["Deep Cleaning", "Waste Disposal"],
    contacts: [{ name: "Sunita Devi", role: "Supervisor", color: colors[4] }],
    locations: [{ name: "Building E" }],
    createdBy: "Admin",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-20T09:00:00Z",
    partsSummary: "Cleaning supplies",
  },
];

