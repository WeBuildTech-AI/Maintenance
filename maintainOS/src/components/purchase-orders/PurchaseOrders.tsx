import * as React from "react";
import { createPortal } from "react-dom";
import { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { AvatarCheckboxDemo } from "../ui/avatar-checkbox-demo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  Plus,
  LayoutGrid,
  ChevronDown,
  Filter,
  Settings,
  MapPin,
  Upload,
  File,
  Link as LinkIcon,
  Edit,
  MoreHorizontal,
  ChevronRight,
  Calendar,
  CheckCircle,
  DollarSign,
  Building2,
  Trash2,
  Paperclip,
  Mail,
  Phone,
  Check,
  PanelTop,
  Table,
  Send,
} from "lucide-react";
import POFilterBar from "./POFilterBar";
import { NewPOForm } from "./NewPOForm";

import {
  mockPOsSeed,
  mockVendors,
  type Address,
  type POItem,
  type POStatus,
  type PurchaseOrder,
  type ViewMode,
  type NewPOForm as NewPOFormType,
  allColumns,
} from "./po.types";
import { addressToLine, cryptoId, formatMoney } from "./helpers";
import PurchaseOrdersTable from "./POTableView";
import SettingsModal from "./SettingsModal";
import { NewPOFormDialog } from "./NewPOFormDialog";
import { AvatarCheckbox } from "../ui/avatar-checkbox";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Comment from "../Comment/Comment";
import { POHeaderComponent } from "./POHeader";

/* ---------------------------- Purchase Orders UI -------------------------- */
export function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] =
    useState<PurchaseOrder[]>(mockPOsSeed);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPOId, setSelectedPOId] = useState<string | null>(
    purchaseOrders[0]?.id ?? null
  );

  const [creatingPO, setCreatingPO] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [selectedColumns, setSelectedColumns] = useState(allColumns);
  const [pageSize, setPageSize] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const commentsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("details");

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab("details");
    }
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveTab("comments");
    }
  };

  const handleSend = () => {
    if (comment.trim()) {
      console.log("Comment sent:", comment);
      setComment("");
      setShowCommentBox(false); // close after send (optional)
    }
  };

  const ChatIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m2.25 2.25H15M3.75 21.75c1.036 0 1.875-.84 1.875-1.875V15c0-1.036-.84-1.875-1.875-1.875H3.75c-1.036 0-1.875.84-1.875 1.875v4.875c0 1.035.84 1.875 1.875 1.875Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );

  const XMarkIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );

  const PaperAirplaneIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
      />
    </svg>
  );

  // const [showNewPOModal, setShowNewPOModal] = useState(false);

  // New PO Form state
  const [newPO, setNewPO] = useState<NewPOFormType>(() => ({
    vendorId: "",
    items: [
      {
        id: cryptoId(),
        itemName: "",
        partNumber: "",
        quantity: 0,
        unitCost: 0,
      },
    ],
    shippingAddress: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IN",
    },
    billingAddress: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IN",
    },
    sameShipBill: true,
    dueDate: "",
    notes: "",
    extraCosts: 0,
    contactName: "",
    contactEmailOrPhone: "",
  }));

  const filteredPOs = purchaseOrders.filter((po) => {
    const vendor = mockVendors.find((v) => v.id === po.vendorId)?.name ?? "";
    const q = searchQuery.toLowerCase();
    return (
      po.number.toLowerCase().includes(q) ||
      vendor.toLowerCase().includes(q) ||
      po.status.toLowerCase().includes(q)
    );
  });

  const selectedPO =
    purchaseOrders.find((po) => po.id === selectedPOId) || null;

  const totals = useMemo(() => {
    return Object.fromEntries(
      purchaseOrders.map((po) => [
        po.id,
        po.items.reduce((acc, it) => acc + it.quantity * it.unitCost, 0) +
          (po.extraCosts ?? 0),
      ])
    );
  }, [purchaseOrders]);

  // Apply pagination (just slicing for demo)
  const pagedOrders = mockPOsSeed.slice(0, pageSize);

  /* ------------------------------- Handlers ------------------------------- */
  const resetNewPO = () =>
    setNewPO({
      vendorId: "",
      items: [
        {
          id: cryptoId(),
          itemName: "",
          partNumber: "",
          quantity: 0,
          unitCost: 0,
        },
      ],
      shippingAddress: {
        line1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "IN",
      },
      billingAddress: {
        line1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "IN",
      },
      sameShipBill: true,
      dueDate: "",
      notes: "",
      extraCosts: 0,
      contactName: "",
      contactEmailOrPhone: "",
    });

  const addNewPOItemRow = () =>
    setNewPO((s) => ({
      ...s,
      items: [
        ...s.items,
        {
          id: cryptoId(),
          itemName: "",
          partNumber: "",
          quantity: 0,
          unitCost: 0,
        },
      ],
    }));

  const removePOItemRow = (id: string) =>
    setNewPO((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));

  const updateItemField = (
    id: string,
    field: keyof POItem,
    value: string | number
  ) =>
    setNewPO((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }));

  const newPOSubtotal = newPO.items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0),
    0
  );
  const newPOTotal = newPOSubtotal + (Number(newPO.extraCosts) || 0);

  const createPurchaseOrder = () => {
    if (!newPO.vendorId) return;

    const vendor = mockVendors.find((v) => v.id === newPO.vendorId);
    const nextNumber = `Purchase Order #${purchaseOrders.length + 1}`;
    const po: PurchaseOrder = {
      id: cryptoId(),
      title: `Order for ${newPO.items[0]?.itemName || "New Items"}`,
      number: nextNumber,
      vendorId: vendor!.id,
      vendor: vendor!.name,
      status: "Draft",
      dueDate: newPO.dueDate || undefined,
      shippingAddress: newPO.shippingAddress,
      billingAddress: newPO.sameShipBill
        ? newPO.shippingAddress
        : newPO.billingAddress,
      notes: newPO.notes,
      items: newPO.items.map((i) => ({
        ...i,
        quantity: Number(i.quantity) || 0,
        unitCost: Number(i.unitCost) || 0,
      })),
      extraCosts: Number(newPO.extraCosts) || 0,
      createdBy: "Ashwini Chauhan",
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders((s) => [po, ...s]);
    setSelectedPOId(po.id);
    setCreatingPO(false);
    resetNewPO();
  };

  const updateStatus = (status: POStatus) => {
    if (!selectedPO) return;
    setPurchaseOrders((s) =>
      s.map((po) => (po.id === selectedPO.id ? { ...po, status } : po))
    );
  };

  const handleSaveSettings = (cols: typeof allColumns, size: number) => {
    setSelectedColumns(cols);
    setPageSize(size);
  };

  /* --------------------------------- UI ---------------------------------- */
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      {POHeaderComponent(viewMode, setViewMode, searchQuery, setSearchQuery, setCreatingPO, setShowSettings)}

      
      {viewMode === "table" ? (
        <div className="flex-1 min-h-0 overflow-auto p-2">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PurchaseOrdersTable
              orders={pagedOrders}
              columns={selectedColumns}
              pageSize={pageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left List */}
          <div className="w-96 mr-2 ml-3 border border-border flex flex-col min-h-0">
            {/* List Aggregator + Select button*/}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  All Purchase Orders: {filteredPOs.length}
                </span>
              </div>
            </div>

            {/* PO List */}
            <div className="flex-1 overflow-y-auto min-h-0 ">
              {/* <div className="space-y-3"> */}
              {filteredPOs.map((po) => {
                const vendor =
                  mockVendors.find((v) => v.id === po.vendorId)?.name ?? "-";
                return (
                  <Card
                    key={po.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPOId === po.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedPOId(po.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {po.vendor
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{po.number}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>{vendor}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Cost: {formatMoney(totals[po.id] ?? 0)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mt-2">
                            <StatusBadge status={po.status} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredPOs.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    No purchase orders found
                  </p>
                  <Button
                    variant="link"
                    className="text-primary p-0"
                    onClick={() => setCreatingPO(true)}
                  >
                    Create your first Purchase Order
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Details */}
          <div className="flex-1 bg-card mr-3 ml-2 border border-border min-h-0 flex flex-col border-border">
            {selectedPO ? (
              <div className="h-full flex flex-col min-h-0">
                {/* Header */}
                <div className="p-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-medium">
                        {selectedPO.number}
                      </h1>
                      <LinkIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50">
                        <Upload className="h-4 w-4" />
                        Send to Vendor
                      </Button>
                      <Button className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50">
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
                          <DropdownMenuItem
                            onClick={() => updateStatus("Approved")}
                          >
                            <Check className="h-4 w-4 mr-2" /> Mark as Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus("Sent")}
                          >
                            <Mail className="h-4 w-4 mr-2" /> Mark as Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus("Cancelled")}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Top Tabs (Details/Comments)—static for now */}
                  <div className="flex border-border">
                    <button
                      onClick={scrollToTop}
                      className={`flex-1 py-3 cursor-pointer text-center border-b-2 ${
                        activeTab === "details"
                          ? " text-orange-600 border-b border-orange-600"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={scrollToComments}
                      className={`flex-1 py-3 text-center cursor-pointer border-b-2 ${
                        activeTab === "comments"
                          ? " border-orange-600 border-b text-orange-600"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Comments &amp; History
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 z-50 ">
                  {/* Details row */}
                  <div ref={topRef}>
                    <div className="grid grid-cols-2 gap-6">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Status
                            </div>
                            <StatusBadge status={selectedPO.status} />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Due Date
                            </div>
                            <div className="font-medium">
                              {selectedPO.dueDate
                                ? new Date(
                                    selectedPO.dueDate
                                  ).toLocaleDateString()
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          Vendor
                        </div>
                        <div className="flex items-center gap-2">
                          <VendorPill vendorId={selectedPO.vendorId} />
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Order Items</h3>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr className="text-left">
                              <th className="p-3">Item Name</th>
                              <th className="p-3">Part Number</th>
                              <th className="p-3">Units Ordered</th>
                              <th className="p-3">Units Received</th>
                              <th className="p-3">Unit Cost</th>
                              <th className="p-3">Cost of Units Ordered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPO.items.map((it) => (
                              <tr key={it.id} className="border-t">
                                <td className="p-3">{it.itemName}</td>
                                <td className="p-3">{it.partNumber || "-"}</td>
                                <td className="p-3">{it.quantity}</td>
                                <td className="p-3">0</td>
                                <td className="p-3">
                                  {formatMoney(it.unitCost)}
                                </td>
                                <td className="p-3">
                                  {formatMoney(it.unitCost * it.quantity)}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t">
                              <td
                                colSpan={5}
                                className="p-3 text-right font-medium"
                              >
                                Subtotal
                              </td>
                              <td className="p-3">
                                {formatMoney(
                                  selectedPO.items.reduce(
                                    (a, i) => a + i.unitCost * i.quantity,
                                    0
                                  )
                                )}
                              </td>
                            </tr>
                            <tr className="border-t">
                              <td
                                colSpan={5}
                                className="p-3 text-right font-medium"
                              >
                                Taxes &amp; Costs
                              </td>
                              <td className="p-3">
                                {formatMoney(selectedPO.extraCosts ?? 0)}
                              </td>
                            </tr>
                            <tr className="border-t bg-muted/30">
                              <td
                                colSpan={5}
                                className="p-3 text-right font-semibold"
                              >
                                Total
                              </td>
                              <td className="p-3 font-semibold">
                                {formatMoney(
                                  selectedPO.items.reduce(
                                    (a, i) => a + i.unitCost * i.quantity,
                                    0
                                  ) + (selectedPO.extraCosts ?? 0)
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-2">
                          Shipping Info
                        </div>
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>{addressToLine(selectedPO.shippingAddress)}</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-2">
                          Billing Info
                        </div>
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>{addressToLine(selectedPO.billingAddress)}</div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Comments box (visual only) */}
                  <div ref={commentsRef}>
                    <div>
                      <h3 className="font-medium mb-3">
                        Comments &amp; History
                      </h3>
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-2">
                         {
                          comment.length === 0 ? "No Comments Found" : ""
                         }
                        </div>
                        {/* <div className="border rounded-md h-24 bg-muted/30" /> */}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Comment
                      showCommentBox={showCommentBox}
                      comment={comment}
                      handleSend={handleSend}
                      setShowCommentBox={setShowCommentBox}
                      setComment={setComment}
                    />
                  </div>
                </div>

                {/* Footer (fixed at bottom of right pane) */}
                <div className="p-6 border-t flex justify-end flex-none">
                  <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                    <Upload className="h-4 w-4" />
                    Fulfill
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Select a purchase order to view details
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or create a new one to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Purchase Order Modal (custom lightweight) */}
      <NewPOFormDialog
        open={creatingPO}
        onOpenChange={setCreatingPO}
        newPO={newPO}
        setNewPO={setNewPO}
        newPOSubtotal={newPOSubtotal}
        newPOTotal={newPOTotal}
        addNewPOItemRow={addNewPOItemRow}
        removePOItemRow={removePOItemRow}
        updateItemField={updateItemField}
        createPurchaseOrder={() => {
          createPurchaseOrder();
          setCreatingPO(false); // close after create
        }}
        onCancel={() => setCreatingPO(false)}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          allColumns={allColumns}
          selectedColumns={selectedColumns}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialPageSize={pageSize}
        />
      )}
    </div>
  );
}

/* --------------------------------- Bits ---------------------------------- */
function StatusBadge({ status }: { status: POStatus }) {
  const map: Record<POStatus, string> = {
    Draft: "bg-gray-50 text-gray-700 border-gray-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Sent: "bg-orange-50 text-orange-700 border-orange-200",
    Received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}

function VendorPill({ vendorId }: { vendorId: string }) {
  const vendor = mockVendors.find((v) => v.id === vendorId);
  if (!vendor) return <span>-</span>;
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
        {vendor.name.slice(0, 1)}
      </div>
      <div className="leading-tight">
        <div className="font-medium">{vendor.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {vendor.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {vendor.email}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {vendor.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {vendor.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
