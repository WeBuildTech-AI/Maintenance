import {
  Calendar,
  ChevronDown,
  DollarSign,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatMoney } from "./helpers";
import { mockVendors, type NewPOFormProps, type Vendor } from "./po.types";
import { useState } from "react";
import { vendorService } from "../../store/vendors";

// --- Mock data for saved addresses ---
type Address = {
  id: string;
  name: string; // e.g., "Main Warehouse" or "Office"
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactName: string;
  contactEmailOrPhone: string;
};

const mockAddresses: Address[] = [
  {
    id: "addr_1",
    name: "Main Warehouse",
    line1: "123 Industrial Way",
    city: "Freighton",
    state: "CA",
    postalCode: "90210",
    country: "USA",
    contactName: "Warehouse Reception",
    contactEmailOrPhone: "warehouse@example.com",
  },
  {
    id: "addr_2",
    name: "Head Office",
    line1: "456 Corporate Blvd",
    city: "Businesston",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    contactName: "Main Office",
    contactEmailOrPhone: "555-123-4567",
  },
];
// ---------------------------------------------

export function NewPOForm(props: NewPOFormProps) {
  const {
    newPO,
    setNewPO,
    newPOSubtotal,
    newPOTotal,
    addNewPOItemRow,
    removePOItemRow,
    updateItemField,
    createPurchaseOrder, // This prop is now used by the "Create" button
    onCancel,
  } = props;

  // --- Vendor State ---
  const [showCustomPoInput, setShowCustomPoInput] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [hasFetchedVendors, setHasFetchedVendors] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [isVendorSearchFocused, setIsVendorSearchFocused] = useState(false);

  // --- Address State ---
  const [savedAddresses] = useState<Address[]>(mockAddresses); // Using mock data
  const [selectedShippingAddressId, setSelectedShippingAddressId] =
    useState("new");
  const [selectedBillingAddressId, setSelectedBillingAddressId] =
    useState("new");

  // --- NEW: Search/Focus state for addresses ---
  const [shippingSearchQuery, setShippingSearchQuery] = useState("");
  const [isShippingSearchFocused, setIsShippingSearchFocused] = useState(false);
  const [billingSearchQuery, setBillingSearchQuery] = useState("");
  const [isBillingSearchFocused, setIsBillingSearchFocused] = useState(false);

  // --- Vendor Fetch Logic ---
  const fetchVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const vendorData = await vendorService.fetchVendorName();
      setVendors(vendorData);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setIsLoadingVendors(false);
      setHasFetchedVendors(true);
    }
  };

  const handleVendorDropdownOpen = (isOpen: boolean) => {
    if (isOpen && !hasFetchedVendors) {
      fetchVendors();
    }
  };

  // --- PO Number Logic ---
  const handleUseAutoPo = () => {
    setShowCustomPoInput(false);
    setNewPO((s) => ({ ...s, poNumber: "" }));
  };

  const handleUseCustomPo = () => {
    setShowCustomPoInput(true);
  };

  // --- Address Handlers ---
  const handleShippingAddressSelect = (address: Address | "new") => {
    if (address === "new") {
      setSelectedShippingAddressId("new");
      // Clear the form fields
      setNewPO((s) => ({
        ...s,
        contactName: "",
        contactEmailOrPhone: "",
        shippingAddress: {
          line1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      }));
      setShippingSearchQuery("");
    } else {
      setSelectedShippingAddressId(address.id);
      // Populate the form fields from the saved address
      setNewPO((s) => ({
        ...s,
        contactName: address.contactName,
        contactEmailOrPhone: address.contactEmailOrPhone,
        shippingAddress: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        // Also update billing if 'sameShipBill' is checked
        ...(s.sameShipBill
          ? {
              billingAddress: {
                line1: address.line1,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
              },
            }
          : {}),
      }));
      setShippingSearchQuery(address.name); // Show selected name in input
    }
    setIsShippingSearchFocused(false); // Hide dropdown
  };

  const handleBillingAddressSelect = (address: Address | "new") => {
    if (address === "new") {
      setSelectedBillingAddressId("new");
      setNewPO((s) => ({
        ...s,
        billingAddress: {
          line1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      }));
      setBillingSearchQuery("");
    } else {
      setSelectedBillingAddressId(address.id);
      // Populate the billing fields
      setNewPO((s) => ({
        ...s,
        billingAddress: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
      }));
      setBillingSearchQuery(address.name); // Show selected name in input
    }
    setIsBillingSearchFocused(false); // Hide dropdown
  };

  // Helper to filter saved addresses based on search query
  const filteredShippingAddresses = savedAddresses.filter(
    (a) =>
      a.name.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
      a.line1.toLowerCase().includes(shippingSearchQuery.toLowerCase())
  );

  const filteredBillingAddresses = savedAddresses.filter(
    (a) =>
      a.name.toLowerCase().includes(billingSearchQuery.toLowerCase()) ||
      a.line1.toLowerCase().includes(billingSearchQuery.toLowerCase())
  );

  // --- RENDER ---
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable Form Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] p-6 space-y-10">
          {/* PO Number Section */}
          <section>
            <div className="text-base font-medium mb-4">
              Purchase Order Number
            </div>
            {showCustomPoInput ? (
              <div>
                <Input
                  type="text"
                  value={newPO.poNumber || ""}
                  onChange={(e) =>
                    setNewPO((s) => ({ ...s, poNumber: e.target.value }))
                  }
                  placeholder="Enter Purchase Order Number"
                  className="h-9 bg-white border-orange-600 text-sm"
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  or{" "}
                  <button
                    onClick={handleUseAutoPo}
                    className="text-orange-600 hover:underline focus:outline-none"
                  >
                    Use Autogenerated PO Number
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm p-3 border rounded-lg bg-muted/30">
                <span className="text-muted-foreground">
                  PO Number will be generated automatically.
                </span>
                <Button
                  variant="link"
                  className="text-orange-600 h-auto p-0"
                  onClick={handleUseCustomPo}
                >
                  Enter Custom PO Number
                </Button>
              </div>
            )}
          </section>

          {/* Vendor Section */}
          <section>
            <div className="text-base font-medium mt-4 mb-4">Vendor</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {newPO.vendorId &&
              vendors.find((v) => v.id === newPO.vendorId) ? (
                // --- A) VIEW WHEN VENDOR IS SELECTED ---
                <div className="flex items-center justify-between h-9 px-3 py-2 text-sm border rounded-md bg-muted/50">
                  <span>
                    {vendors.find((v) => v.id === newPO.vendorId)?.name}
                  </span>
                  <Button
                    variant="ghost"
                    className="h-auto p-1 text-orange-600 hover:text-orange-700"
                    onClick={() => {
                      setNewPO((s) => ({ ...s, vendorId: "" }));
                      setVendorSearchQuery("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                // --- B) VIEW FOR SEARCHING A VENDOR ---
                <div className="relative">
                  <Input
                    placeholder="Search and select a vendor..."
                    className="h-9 text-sm bg-white border-orange-600"
                    value={vendorSearchQuery}
                    onFocus={() => {
                      setIsVendorSearchFocused(true);
                      handleVendorDropdownOpen(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsVendorSearchFocused(false), 150);
                    }}
                    onChange={(e) => setVendorSearchQuery(e.target.value)}
                  />
                  {isVendorSearchFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingVendors ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        vendors
                          .filter((v) =>
                            v.name
                              .toLowerCase()
                              .includes(vendorSearchQuery.toLowerCase())
                          )
                          .map((v) => (
                            <div
                              key={v.id}
                              className="p-2 text-sm hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setNewPO((s) => ({ ...s, vendorId: v.id }));
                                setVendorSearchQuery(v.name);
                                setIsVendorSearchFocused(false);
                              }}
                            >
                              {v.name}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Order Items Section */}
          <section>
            <div className="text-base font-medium mb-3">Order Items</div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 w-[38%]">Item Name</th>
                    <th className="p-3 w-[20%]">Part Number</th>
                    <th className="p-3 w-[14%]">Units Ordered</th>
                    <th className="p-3 w-[14%]">Unit Cost</th>
                    <th className="p-3 w-[14%]">Price</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {newPO.items.map((it) => {
                    const price =
                      (Number(it.quantity) || 0) * (Number(it.unitCost) || 0);
                    return (
                      <tr key={it.id} className="border-t">
                        <td className="p-3">
                          <Input
                            className="h-9 text-sm bg-white border-orange-600"
                            placeholder="Start typing…"
                            value={it.itemName}
                            onChange={(e) =>
                              updateItemField(it.id, "itemName", e.target.value)
                            }
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            className="h-9 text-sm bg-white border-orange-600"
                            placeholder="e.g. #12345"
                            value={it.partNumber ?? ""}
                            onChange={(e) =>
                              updateItemField(
                                it.id,
                                "partNumber",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            className="h-9 text-sm bg-white border-orange-600"
                            type="number"
                            min={0}
                            value={it.quantity}
                            onChange={(e) =>
                              updateItemField(
                                it.id,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">
                              $
                            </span>
                            <Input
                              className="h-9 text-sm bg-white border-orange-600"
                              type="number"
                              min={0}
                              step="0.01"
                              value={it.unitCost}
                              onChange={(e) =>
                                updateItemField(
                                  it.id,
                                  "unitCost",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <Input
                            className="bg-white border-orange-600 text-right"
                            value={formatMoney(price)}
                            readOnly
                          />
                        </td>
                        <td className="p-3">
                          {newPO.items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePOItemRow(it.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t">
                    <td colSpan={6}>
                      <div className="flex items-center justify-between p-3">
                        <Button
                          variant="link"
                          className="gap-2"
                          onClick={addNewPOItemRow}
                        >
                          <Plus className="h-4 w-4" /> Add Item
                        </Button>
                        <div className="text-sm mr-2">
                          <span className="text-muted-foreground mr-2">
                            Subtotal
                          </span>
                          <span className="font-medium">
                            {formatMoney(newPOSubtotal)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-6 mt-4">
              <button
                className="text-sm text-orange-600"
                onClick={() =>
                  setNewPO((s) => ({
                    ...s,
                    extraCosts: Number(s.extraCosts) || 0,
                  }))
                }
              >
                + Add Taxes &amp; Costs
              </button>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  className="h-9 text-sm w-28 bg-white border-orange-600"
                  type="number"
                  min={0}
                  step="0.01"
                  value={newPO.extraCosts}
                  onChange={(e) =>
                    setNewPO((s) => ({
                      ...s,
                      extraCosts: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">Total</span>
                <span className="font-semibold">{formatMoney(newPOTotal)}</span>
              </div>
            </div>
          </section>

          {/* --- Shipping Information Section (MODIFIED) --- */}
          <section>
            <div className="text-base font-medium mb-4">
              Shipping Information
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* --- NEW: Search Input for Shipping --- */}
              <div className="relative">
                <Input
                  placeholder="Search saved addresses or create new..."
                  className="h-9 text-sm bg-white border-orange-600"
                  value={shippingSearchQuery}
                  onFocus={() => setIsShippingSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsShippingSearchFocused(false), 150);
                  }}
                  onChange={(e) => setShippingSearchQuery(e.target.value)}
                />
                {isShippingSearchFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div
                      onClick={() => handleShippingAddressSelect("new")}
                      className="p-2 text-sm hover:bg-muted cursor-pointer text-orange-600 font-medium"
                    >
                      + Create New Address
                    </div>
                    {filteredShippingAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleShippingAddressSelect(addr)}
                        className="p-2 text-sm hover:bg-muted cursor-pointer"
                      >
                        {addr.name}
                        <div className="text-xs text-muted-foreground">
                          {addr.line1}, {addr.city}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- Fields only show if "Create New" is selected --- */}
              {selectedShippingAddressId === "new" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="Contact name"
                      value={newPO.contactName}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s,
                          contactName: e.target.value,
                        }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="Email or Phone Number"
                      value={newPO.contactEmailOrPhone}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s,
                          contactEmailOrPhone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Input
                    className="h-9 text-sm bg-white border-orange-600"
                    placeholder="Shipping Address (Street)"
                    value={newPO.shippingAddress.line1}
                    onChange={(e) =>
                      setNewPO((s) => ({
                        ...s,
                        shippingAddress: {
                          ...s.shippingAddress,
                          line1: e.target.value,
                        },
                        ...(s.sameShipBill
                          ? {
                              billingAddress: {
                                ...s.billingAddress,
                                line1: e.target.value,
                              },
                            }
                          : {}),
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="City"
                      value={newPO.shippingAddress.city}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s,
                          shippingAddress: {
                            ...s.shippingAddress,
                            city: e.target.value,
                          },
                          ...(s.sameShipBill
                            ? {
                                billingAddress: {
                                  ...s.billingAddress,
                                  city: e.target.value,
                                },
                              }
                            : {}),
                        }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="State"
                      value={newPO.shippingAddress.state}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s,
                          shippingAddress: {
                            ...s.shippingAddress,
                            state: e.target.value,
                          },
                          ...(s.sameShipBill
                            ? {
                                billingAddress: {
                                  ...s.billingAddress,
                                  state: e.target.value,
                                },
                              }
                            : {}),
                        }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="PIN"
                      value={newPO.shippingAddress.postalCode}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s,
                          shippingAddress: {
                            ...s.shippingAddress,
                            postalCode: e.target.value,
                          },
                          ...(s.sameShipBill
                            ? {
                                billingAddress: {
                                  ...s.billingAddress,
                                  postalCode: e.target.value,
                                },
                              }
                            : {}),
                        }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="Country"
                      value={newPO.shippingAddress.country}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s,
                          shippingAddress: {
                            ...s.shippingAddress,
                            country: e.target.value,
                          },
                          ...(s.sameShipBill
                            ? {
                                billingAddress: {
                                  ...s.billingAddress,
                                  country: e.target.value,
                                },
                              }
                            : {}),
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>

            {/* "Same as Shipping" Checkbox */}
            <label className="flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                checked={newPO.sameShipBill}
                className="bg-white border-orange-600"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setNewPO((s) => ({
                    ...s,
                    sameShipBill: isChecked,
                    ...(isChecked
                      ? { billingAddress: { ...s.shippingAddress } }
                      : {}),
                  }));
                  // If checking, also sync the selected ID
                  if (isChecked) {
                    setSelectedBillingAddressId(selectedShippingAddressId);
                    setBillingSearchQuery(shippingSearchQuery);
                  }
                }}
              />
              Use the same Shipping and Billing Address
            </label>

            {/* --- Billing Information Section (MODIFIED) --- */}
            {!newPO.sameShipBill && (
              <div className="mt-6">
                <div className="text-base font-medium mb-4">
                  Billing Information
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {/* --- NEW: Search Input for Billing --- */}
                  <div className="relative">
                    <Input
                      placeholder="Search saved addresses or create new..."
                      className="h-9 text-sm bg-white border-orange-600"
                      value={billingSearchQuery}
                      onFocus={() => setIsBillingSearchFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsBillingSearchFocused(false), 150);
                      }}
                      onChange={(e) => setBillingSearchQuery(e.target.value)}
                    />
                    {isBillingSearchFocused && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div
                          onClick={() => handleBillingAddressSelect("new")}
                          className="p-2 text-sm hover:bg-muted cursor-pointer text-orange-600 font-medium"
                        >
                          + Create New Address
                        </div>
                        {filteredBillingAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => handleBillingAddressSelect(addr)}
                            className="p-2 text-sm hover:bg-muted cursor-pointer"
                          >
                            {addr.name}
                            <div className="text-xs text-muted-foreground">
                              {addr.line1}, {addr.city}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* --- Fields only show if "Create New" is selected --- */}
                  {selectedBillingAddressId === "new" && (
                    <>
                      <Input
                        className="h-9 text-sm bg-white border-orange-600"
                        placeholder="Billing Address (Street)"
                        value={newPO.billingAddress.line1}
                        onChange={(e) =>
                          setNewPO((s) => ({
                            ...s,
                            billingAddress: {
                              ...s.billingAddress,
                              line1: e.target.value,
                            },
                          }))
                        }
                      />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="City"
                          value={newPO.billingAddress.city}
                          onChange={(e) =>
                            setNewPO((s) => ({
                              ...s,
                              billingAddress: {
                                ...s.billingAddress,
                                city: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="State"
                          value={newPO.billingAddress.state}
                          onChange={(e) =>
                            setNewPO((s) => ({
                              ...s,
                              billingAddress: {
                                ...s.billingAddress,
                                state: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="PIN"
                          value={newPO.billingAddress.postalCode}
                          onChange={(e) =>
                            setNewPO((s) => ({
                              ...s,
                              billingAddress: {
                                ...s.billingAddress,
                                postalCode: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="Country"
                          value={newPO.billingAddress.country}
                          onChange={(e) =>
                            setNewPO((s) => ({
                              ...s,
                              billingAddress: {
                                ...s.billingAddress,
                                country: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Details Section */}
          <section>
            <div className="text-base font-medium mb-4">Details</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Calendar className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9 h-9 text-sm bg-white border-orange-600"
                  type="date"
                  value={newPO.dueDate}
                  onChange={(e) =>
                    setNewPO((s) => ({ ...s, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  className="h-9 text-sm bg-white border-orange-600"
                  placeholder="Add notes"
                  value={newPO.notes}
                  onChange={(e) =>
                    setNewPO((s) => ({ ...s, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <Button className="gap-2 h-9 text-orange-600">
                <Paperclip className="h-4 w-4" />
                Attach files
              </Button>
            </div>
          </section>

          {/* END of content container */}
        </div>
      </div>

      {/* --- Sticky Footer for Form Submission (UNCOMMENTED) --- */}
      {/* <div className="p-4 border-t bg-background sticky bottom-0">
        <div className="mx-auto w-full max-w-[820px] flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={createPurchaseOrder} // Calls the prop to send data
            className="bg-orange-600 hover:bg-orange-700 text-white" // Added text-white
          >
            Create Purchase Order
          </Button>
        </div>
      </div> */}
    </div>
  );
}