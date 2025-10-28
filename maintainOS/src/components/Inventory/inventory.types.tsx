import { id } from "./utils";
import type { BUD } from "../utils/BlobUpload";

/* ------------------------------- Types ------------------------------- */
export type Vendor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type Location = {
  id: string;
  name: string;
  area?: string;
};

export type ItemVendor = { vendorId: string; orderingPartNumber?: string };

export type Item = {
  id: string;
  name: string;
  description?: string;
  unitCost: number;
  unitsInStock: number;
  minInStock: number;
  locationId?: string;
  area?: string;
  qrCode?: string;
  partTypes?: string[];
  assetNames?: string[];
  vendors: ItemVendor[];
  files?: string[];
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;

  partImages?: BUD[];
  partDocs?: BUD[];
};

/* ---------------------------- New Item Form -------------------------- */
export type NewItem = {
  name: string;
  unitCost: number;
  description: string;
  partTypes: string[];
  qrCode?: string;
  locationId?: string;
  area?: string;
  unitsInStock: number;
  minInStock: number;
  assetNames: string[];
  vendors: ItemVendor[];
  files: string[];
};

/* ----------------------------- Mock Data ---------------------------- */
export const mockVendors: Vendor[] = [
  {
    id: "V-001",
    name: "Ramu",
    email: "ramu@vendor.com",
    phone: "+91 9876543210",
  },
  {
    id: "V-002",
    name: "Acme Spares",
    email: "sales@acmespares.com",
    phone: "+91 9988776655",
  },
];

export const mockLocations: Location[] = [
  { id: "L-1", name: "Substation 1", area: "Ground Floor" },
  { id: "L-2", name: "Warehouse A", area: "Bay 3" },
];

export const seedItems: Item[] = [
  {
    id: id(),
    name: "Test Part",
    description: "General spare used with HVAC assemblies.",
    unitCost: 20,
    unitsInStock: 30,
    minInStock: 5,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "5FNYVUEGCF27",
    partTypes: ["Critical"],
    assetNames: ["HVAC"],
    vendors: [{ vendorId: "V-001", orderingPartNumber: "1234542" }],
    files: ["spec-sheet-test-part.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Air Filter 20×20×1 (MERV 8)",
    description: "Pleated HVAC filter; replace quarterly.",
    unitCost: 5.25,
    unitsInStock: 12,
    minInStock: 20,
    locationId: "L-2",
    area: "Bay 3",
    qrCode: "AF-20x20-1",
    partTypes: ["Consumable"],
    assetNames: ["HVAC"],
    vendors: [
      { vendorId: "V-002", orderingPartNumber: "AF-20201" },
      { vendorId: "V-001", orderingPartNumber: "FIL-7792" },
    ],
    files: ["air-filter-datasheet.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: 'Cable Ties (100 pc, 8")',
    description: "UV-resistant nylon cable ties.",
    unitCost: 1.08,
    unitsInStock: 200,
    minInStock: 100,
    locationId: "L-2",
    area: "Bay 3",
    qrCode: "CT-100-8IN",
    partTypes: ["Consumable"],
    assetNames: [],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "CT-100" }],
    files: [],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "6203-2RS Ball Bearing",
    description: "Sealed ball bearing for small motors.",
    unitCost: 4.6,
    unitsInStock: 0,
    minInStock: 8,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "BRG-6203-2RS",
    partTypes: ["Critical"],
    assetNames: ["HVAC", "Pump"],
    vendors: [{ vendorId: "V-001", orderingPartNumber: "6203-2RS" }],
    files: ["bearing-size-chart.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Multipurpose Grease (400g Cartridge)",
    description: "Lithium EP2 grease for general lubrication.",
    unitCost: 3.9,
    unitsInStock: 48,
    minInStock: 24,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "LUBE-EP2-400",
    partTypes: ["Consumable"],
    assetNames: ["HVAC", "Conveyor"],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "EP2-400G" }],
    files: ["sds-ep2.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  // intentional duplicates from your original seed:
  {
    id: id(),
    name: 'Cable Ties (100 pc, 8")',
    description: "UV-resistant nylon cable ties.",
    unitCost: 1.08,
    unitsInStock: 200,
    minInStock: 100,
    locationId: "L-2",
    area: "Bay 3",
    qrCode: "CT-100-8IN",
    partTypes: ["Consumable"],
    assetNames: [],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "CT-100" }],
    files: [],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "6203-2RS Ball Bearing",
    description: "Sealed ball bearing for small motors.",
    unitCost: 4.6,
    unitsInStock: 0,
    minInStock: 8,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "BRG-6203-2RS",
    partTypes: ["Critical"],
    assetNames: ["HVAC", "Pump"],
    vendors: [{ vendorId: "V-001", orderingPartNumber: "6203-2RS" }],
    files: ["bearing-size-chart.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Multipurpose Grease (400g Cartridge)",
    description: "Lithium EP2 grease for general lubrication.",
    unitCost: 3.9,
    unitsInStock: 48,
    minInStock: 24,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "LUBE-EP2-400",
    partTypes: ["Consumable"],
    assetNames: ["HVAC", "Conveyor"],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "EP2-400G" }],
    files: ["sds-ep2.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
];

