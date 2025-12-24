export type ViewMode = "panel" | "table";

export type Address = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Vendor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
};

export type POItem = {
  id: string;
  partId:string
  itemName: string;
  partNumber?: string;
  quantity: number;
  unitCost: number;
};

export type NewPOForm = {
  poNumber: string;
  vendorId: string;
  items: POItem[];
  shippingAddress: Address[];
  billingAddress: Address[];
  shippingAddressId?: string;
  billingAddressId?: string;
  sameShipBill: boolean;
  phoneOrMail: string;
  dueDate?: string;
  notes?: string;
  extraCosts: number;
  contactName: string;
  contactEmailOrPhone: string;
  taxLines: string;
  vendorContactIds: [];
};

export type NewPOFormProps = {
  newPO: NewPOForm;
  setNewPO: React.Dispatch<React.SetStateAction<NewPOForm>>;
  newPOSubtotal: number;
  newPOTotal: number;
  addNewPOItemRow: () => void;
  removePOItemRow: (id: string) => void;
  updateItemField: (
    id: string,
    field: keyof POItem,
    value: string | number
  ) => void;
  createPurchaseOrder: () => void;
  onCancel: () => void;
  handleCreatePurchaseOrder: () => void;
  isCreating: boolean;
  apiError: string;
  attachedFiles: () => void;
  fileInputRef: () => void;
  handleFileAttachClick: () => void;
  handleFileChange: () => void;
  removeAttachedFile: () => void;
  showCustomPoInput: boolean;
  setShowCustomPoInput: boolean;
};

export type POStatus =
  | "Draft"
  | "Approved"
  | "pending"
  | "Received"
  | "Cancelled"
  | "completed";


export type vendor = {
  name:string;
}


export type PurchaseOrder = {
  id: string; // internal id
  title: string;
  poNumber: string; // display “PO Number”
  vendorId: string;
  vendor: vendor[];
  status: POStatus;
  dueDate?: string; // ISO date
  shippingAddress?: Address;
  shippingAddressId?: string;
  billingAddressId?: string;
  billingAddress?: Address;
  notes?: string;
  items: POItem[];
  extraCosts?: number; // taxes, freight, misc
  createdBy: string;
  createdAt: string;
};

// type PurchaseOrder = Record<string, any>;

export type ColumnKey =
  | "title"
  | "id"
  | "vendor"
  | "status"
  | "createdAt"
  | "createdBy";

export type ColumnConfig = {
  key: ColumnKey;
  label: string;
};

export type PurchaseOrdersTableProps = {
  orders: PurchaseOrder[];
  columns: ColumnConfig[];
  pageSize: number;
};

export type SettingsModalProps = {
  allColumns: ColumnConfig[];
  selectedColumns: ColumnConfig[];
  onClose: () => void;
  onSave: (columns: ColumnConfig[], pageSize: number) => void;
  initialPageSize: number;
};

export const allColumns: ColumnConfig[] = [
  { key: "title", label: "Title" },
  { key: "id", label: "ID" },
  { key: "vendor", label: "Vendor" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "createdBy", label: "Created By" },
] as const;

/* ------------------------------- Mock Data -------------------------------- */
export const mockVendors: Vendor[] = [
  {
    id: "V-001",
    name: "Ramu",
    email: "ramu@vendor.com",
    phone: "+91 9876543210",
    address: {
      line1: "8A/1, Block C, Niranjan Park",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110043",
      country: "IN",
    },
  },
  {
    id: "V-002",
    name: "Acme Spares",
    email: "sales@acmespares.com",
    phone: "+91 9988776655",
    address: {
      line1: "Plot 21, Industrial Area, Phase 2",
      city: "Pune",
      state: "MH",
      postalCode: "411001",
      country: "IN",
    },
  },
];

// export const mockPOsSeed: PurchaseOrder[] = [
//   {
//     id: "PO-001",
//     title: "Order for Motor Belts and Cables",
//     number: "Purchase Order #1",
//     vendorId: "V-001",
//     vendor: "Ramu Verma",
//     status: "Approved",
//     dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "8A/1, Block C, Niranjan Park",
//       city: "New Delhi",
//       state: "Delhi",
//       postalCode: "110043",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "8A/1, Block C, Niranjan Park",
//       city: "New Delhi",
//       state: "Delhi",
//       postalCode: "110043",
//       country: "IN",
//     },
//     notes: "Urgent delivery requested.",
//     items: [
//       {
//         id: "I-1",
//         itemName: "Motor Belt",
//         partNumber: "#MB-123",
//         quantity: 3,
//         unitCost: 45,
//       },
//       {
//         id: "I-2",
//         itemName: "Cable ties (100pc)",
//         partNumber: "#CT-100",
//         quantity: 2,
//         unitCost: 1.08,
//       },
//     ],
//     extraCosts: 20,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "PO-002",
//     title: "Order for Air Filters",
//     number: "Purchase Order #2",
//     vendorId: "V-002",
//     vendor: "Acme Spares",
//     status: "Draft",
//     dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "Plot 21, Industrial Area, Phase 2",
//       city: "Pune",
//       state: "MH",
//       postalCode: "411001",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "Plot 21, Industrial Area, Phase 2",
//       city: "Pune",
//       state: "MH",
//       postalCode: "411001",
//       country: "IN",
//     },
//     notes: "",
//     items: [
//       {
//         id: "I-3",
//         itemName: "Air Filter 20x20x1",
//         partNumber: "#AF-20",
//         quantity: 10,
//         unitCost: 5.5,
//       },
//     ],
//     extraCosts: 0,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "PO-003",
//     title: "Order for Bearings and Lubricants",
//     number: "Purchase Order #3",
//     vendorId: "V-001",
//     vendor: "Ramu Verma",
//     status: "Received",
//     dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "Warehouse B, Sector 9",
//       city: "Gurgaon",
//       state: "HR",
//       postalCode: "122001",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "Warehouse B, Sector 9",
//       city: "Gurgaon",
//       state: "HR",
//       postalCode: "122001",
//       country: "IN",
//     },
//     notes: "Send via express courier.",
//     items: [
//       {
//         id: "I-4",
//         itemName: "Ball Bearing 6203",
//         partNumber: "#BRG-6203",
//         quantity: 50,
//         unitCost: 4.8,
//       },
//       {
//         id: "I-5",
//         itemName: "Grease Cartridge",
//         partNumber: "#LUBE-EP2",
//         quantity: 25,
//         unitCost: 3.9,
//       },
//     ],
//     extraCosts: 15,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "PO-004",
//     title: "Order for Hydraulic Pump Seal",
//     number: "Purchase Order #4",
//     vendorId: "V-002",
//     vendor: "Acme Spares",
//     status: "Received",
//     dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "Block C, Niranjan Park",
//       city: "New Delhi",
//       state: "Delhi",
//       postalCode: "110043",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "Block C, Niranjan Park",
//       city: "New Delhi",
//       state: "Delhi",
//       postalCode: "110043",
//       country: "IN",
//     },
//     notes: "All items received in good condition.",
//     items: [
//       {
//         id: "I-6",
//         itemName: "Hydraulic Pump Seal",
//         partNumber: "#HPS-456",
//         quantity: 5,
//         unitCost: 120,
//       },
//     ],
//     extraCosts: 0,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "PO-005",
//     title: "Order for Gearbox Assembly",
//     number: "Purchase Order #5",
//     vendorId: "V-001",
//     vendor: "Ramu Verma",
//     status: "Cancelled",
//     dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "Plant 3, Sector 18",
//       city: "Noida",
//       state: "UP",
//       postalCode: "201301",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "Plant 3, Sector 18",
//       city: "Noida",
//       state: "UP",
//       postalCode: "201301",
//       country: "IN",
//     },
//     notes: "Order cancelled due to stock availability.",
//     items: [
//       {
//         id: "I-7",
//         itemName: "Gearbox Assembly",
//         partNumber: "#GBX-789",
//         quantity: 2,
//         unitCost: 300,
//       },
//     ],
//     extraCosts: 0,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "PO-006",
//     title: "Order for Conveyor Belt and Lubricants",
//     number: "Purchase Order #6",
//     vendorId: "V-002",
//     vendor: "Acme Spares",
//     status: "Approved",
//     dueDate: new Date(Date.now() + 21 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "Industrial Zone, Block A",
//       city: "Bangalore",
//       state: "KA",
//       postalCode: "560001",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "Industrial Zone, Block A",
//       city: "Bangalore",
//       state: "KA",
//       postalCode: "560001",
//       country: "IN",
//     },
//     notes: "Pack with extra cushioning.",
//     items: [
//       {
//         id: "I-8",
//         itemName: "Conveyor Belt",
//         partNumber: "#CVB-100",
//         quantity: 1,
//         unitCost: 750,
//       },
//       {
//         id: "I-9",
//         itemName: "Lubricant Spray",
//         partNumber: "#LUB-SPR",
//         quantity: 12,
//         unitCost: 8,
//       },
//     ],
//     extraCosts: 25,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "PO-007",
//     title: "Order for Coolant Pump",
//     number: "Purchase Order #7",
//     vendorId: "V-001",
//     vendor: "Ramu Verma",
//     status: "Draft",
//     dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
//     shippingAddress: {
//       line1: "Assembly Line, Plant 4",
//       city: "Chennai",
//       state: "TN",
//       postalCode: "600001",
//       country: "IN",
//     },
//     billingAddress: {
//       line1: "Assembly Line, Plant 4",
//       city: "Chennai",
//       state: "TN",
//       postalCode: "600001",
//       country: "IN",
//     },
//     notes: "",
//     items: [
//       {
//         id: "I-10",
//         itemName: "Coolant Pump",
//         partNumber: "#CP-555",
//         quantity: 4,
//         unitCost: 150,
//       },
//     ],
//     extraCosts: 12,
//     createdBy: "Ashwini Chauhan",
//     createdAt: new Date().toISOString(),
//   },
// ];
