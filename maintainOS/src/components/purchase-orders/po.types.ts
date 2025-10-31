// Minimal shared types and mocks for the Purchase Orders components
export type POStatus =
  | "pending"
  | "approved"
  | "sent"
  | "received"
  | "cancelled"
  | "Draft";

export interface Address {
  id: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface POItem {
  id: string;
  partId: string | null;
  itemName: string;
  partNumber?: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber?: string;
  number?: string;
  vendorId?: string;
  vendor?: { id?: string; name?: string; email?: string; phone?: string } | string;
  orderItems?: Array<{
    id?: string;
    partId?: string | null;
    itemName?: string;
    partNumber?: string;
    unitsOrdered?: number;
    unitCost?: number;
    price?: number;
    part?: { id?: string; name?: string; partNumber?: string } | null;
  }>;
  shippingAddressId?: string | null;
  billingAddressId?: string | null;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  sameShipBill?: boolean;
  dueDate?: string | null;
  notes?: string;
  extraCosts?: number;
  contactName?: string;
  phoneOrMail?: string;
  status?: POStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewMode = "panel" | "table";

export interface NewPOForm {
  id: string | null;
  vendorId: string;
  items: POItem[];
  sameShipBill: boolean;
  shippingAddressId: string;
  shippingAddress: Address | null;
  billingAddressId: string;
  billingAddress: Address | null;
  dueDate: string;
  notes: string;
  extraCosts: number;
  contactName: string;
  phoneOrMail: string;
  poNumber: string;
}

export const allColumns = ["poNumber", "vendor", "status", "total"] as const;

export const mockVendors = [
  { id: "v1", name: "ACME Corp", email: "sales@acme.com", phone: "+1-555-0100" },
  { id: "v2", name: "Widgets Ltd", email: "hello@widgets.io", phone: "+1-555-0200" },
];

export const mockPOsSeed: PurchaseOrder[] = [
  {
    id: "po_1",
    poNumber: "PO-1001",
    vendorId: "v1",
    vendor: { id: "v1", name: "ACME Corp", email: "sales@acme.com" , phone: "+1-555-0100"},
    orderItems: [
      { id: "i1", itemName: "Bolt", unitsOrdered: 10, unitCost: 2.5, price: 25 },
    ],
    shippingAddress: { id: "a1", line1: "123 Main St", city: "Townsville" },
    billingAddress: { id: "a2", line1: "456 Market St", city: "Townsville" },
    extraCosts: 5,
    contactName: "Jane Doe",
    phoneOrMail: "jane@acme.com",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export type NewPOFormType = NewPOForm;

export { mockPOsSeed as default };
