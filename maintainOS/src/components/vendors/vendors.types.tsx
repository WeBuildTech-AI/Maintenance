import type { BUD } from "../utils/BlobUpload";

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
  description?: string
  name: string;
  category: string;
  services: string[];
  vendorImages: BUD[];
  vendorDocs: BUD[];
  contacts: VendorContact[];
  locations: VendorLocation[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  partsSummary?: string;
};

const colors = ["#2563eb", "#10b981", "#f97316", "#14b8a6", "#6366f1", "#ec4899"];

