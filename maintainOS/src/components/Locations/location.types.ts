import type { BUD } from "../utils/BlobUpload";

export type LocationContact = {
  name: string;
  role?: string;
  phone?: string;
  phoneExtension?: string;
  email?: string;
  color?: string;
};

export type Location = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  locationImages?: BUD[];
  locationDocs?: BUD[];
  teamsInCharge: string[];
  vendorIds: string[];
  parentLocationId?: string;
  children?: Location[];
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // Keep old fields for backward compatibility
  photoUrls?: BUD[];
  files?: BUD[];
};
