import { Calendar, DollarSign, Paperclip, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
// Select not used in this component
import { formatMoney } from "./helpers";
import { type NewPOFormProps, type Vendor } from "./po.types.tsx"; // <-- Vendor type (explicit .tsx types file)
import { useState } from "react";
import { vendorService } from "../../store/vendors";
import { partService } from "../../store/parts";
import { purchaseOrderService } from "../../store/purchaseOrders";
// id util not used here
// !! NOTE: Maan rahe hain ki aap 'addressService' bana lenge
// import { addressService } from "../../store/addressService";

export function NewPOForm(props: NewPOFormProps) {
  const {
    newPO,
    setNewPO,
    newPOSubtotal,
    newPOTotal,
    addNewPOItemRow,
    removePOItemRow,
    updateItemField,
    // --- NEW PROPS ADDED ---
    isCreating,
    apiError,
    attachedFiles,
    fileInputRef,
    handleFileAttachClick,
    handleFileChange,
    removeAttachedFile,
    // --- END NEW PROPS ---
  } = props;

  // --- Form-specific State ---
  const [showCustomPoInput, setShowCustomPoInput] = useState(false);

  // --- Vendor State ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [hasFetchedVendors, setHasFetchedVendors] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [isVendorSearchFocused, setIsVendorSearchFocused] = useState(false);

  // --- Parts State ---
  const [parts, setPart] = useState<any[]>([]); // 'any' ko specific PartType se badal sakte hain
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [hasFetchedParts, setHasFetchedParts] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // --- NEW: Shipping Address State ---
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]); // 'any' ko apne Address type se badlein
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [isAddressSearchFocused, setIsAddressSearchFocused] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [addressApiError, setAddressApiError] = useState<string | null>(null);

  // State for the new shipping address form fields
  const [newAddress, setNewAddress] = useState({
    street: "", // Street
    city: "",
    stateProvince: "",
    ZIP: "", // PIN code
    country: "IN", // Default
  });

  // --- NEW: Billing Address State --- // <-- NEW SECTION
  const [billingAddresses, setBillingAddresses] = useState<any[]>([]);
  const [isLoadingBillingAddresses, setIsLoadingBillingAddresses] =
    useState(false);
  const [hasFetchedBillingAddresses, setHasFetchedBillingAddresses] =
    useState(false);
  const [billingAddressSearchQuery, setBillingAddressSearchQuery] =
    useState("");
  const [isBillingAddressSearchFocused, setIsBillingAddressSearchFocused] =
    useState(false);
  const [showNewBillingAddressForm, setShowNewBillingAddressForm] =
    useState(false);
  const [isCreatingBillingAddress, setIsCreatingBillingAddress] =
    useState(false);
  const [billingAddressApiError, setBillingAddressApiError] = useState<
    string | null
  >(null);

  // State for the new billing address form fields
  const [newBillingAddress, setNewBillingAddress] = useState({
    street: "",
    city: "",
    stateProvince: "",
    ZIP: "",
    country: "IN",
  });

  // --- Vendor Fetching ---
  const fetchVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const vendorData = await vendorService.fetchVendorName();
      setVendors(vendorData);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setIsLoadingVendors(false);
      setHasFetchedVendors(true); // <-- CHANGED (Aapne pehle fetch par true nahi kiya tha)
    }
  };

  // --- Part Fetching ---
  const fetchPart = async () => {
    setIsLoadingParts(true);
    try {
      const partData = await partService.fetchParts();
      setPart(partData);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    } finally {
      setIsLoadingParts(false);
      setHasFetchedParts(true); // <-- CHANGED (Aapne pehle fetch par true nahi kiya tha)
    }
  };

  // --- Dropdown Open Handlers ---
  const handleVendorDropdownOpen = (isOpen: boolean) => {
    if (isOpen && !hasFetchedVendors) {
      fetchVendors();
    }
    // Saath mein parts bhi fetch kar lete hain agar nahi hue hain
    if (isOpen && !hasFetchedParts) {
      fetchPart();
    }
  };

  const handlePartDropdownOpen = () => {
    if (!hasFetchedParts) {
      fetchPart();
    }
  };

  // --- PO Number Toggle ---
  const handleUseAutoPo = () => {
    setShowCustomPoInput(false);
    setNewPO((s) => ({ ...s, poNumber: "" }));
  };

  const handleUseCustomPo = () => {
    setShowCustomPoInput(true);
  };

  // --- NEW: Shipping Address Functions ---

  // 1. Fetch shipping addresses from API
  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await purchaseOrderService.fetchAdressess();
      setShippingAddresses(res);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
      setHasFetchedAddresses(true);
    }
  };

  // 2. Dropdown khulne par fetch karein
  const handleAddressDropdownOpen = () => {
    if (!hasFetchedAddresses) {
      fetchAddresses();
    }
  }; // 3. Jab user list se shipping address select kare

  const handleSelectAddress = (address: any) => {
    setAddressSearchQuery(address.name || address.street); // Input mein naam dikhayein
    setIsAddressSearchFocused(false);

    setNewPO((currentState) => {
      // 1. Pehle naya state object banayein shipping details ke saath
      const newState = {
        ...currentState,
        shippingAddressId: address.id, // Selected ID ko state mein save karein
        shippingAddress: address, // Poora object bhi save karein
      };

      if (currentState.sameShipBill) {
        // 3. Agar ticked hai, toh billing address ko bhi shipping address se update karein
        newState.billingAddressId = address.id;
        newState.billingAddress = address;
      }

      // 4. Final updated state return karein
      return newState;
    });
  };

  // 4. Jab user "Create New Address" button par click kare
  const handleAddNewAddress = async () => {
    setIsCreatingAddress(true);
    setAddressApiError(null);
    try {
      // API expects CreateAddressData: { purchaseOrderId, address }
      const createdAddress = await purchaseOrderService.createAddressOrder({
        purchaseOrderId: "", // creating an address before PO exists; API requires a string so pass empty
        address: {
          line1: newAddress.street,
          city: newAddress.city,
          state: newAddress.stateProvince,
          postalCode: newAddress.ZIP,
          country: newAddress.country,
        },
        type: "shipping",
      } as any);

      console.log("New Address Created:", createdAddress);

      setShippingAddresses((prev) => [createdAddress, ...prev]);
      handleSelectAddress(createdAddress); // <-- Newly created address ko select karein
      setShowNewAddressForm(false);
      setNewAddress({
        street: "",
        city: "",
        stateProvince: "",
        ZIP: "",
        country: "IN",
      }); // Form reset karein
    } catch (error: any) {
      console.error("Failed to create address:", error);
      setAddressApiError(error.message || "Failed to create address");
    } finally {
      setIsCreatingAddress(false);
    }
  };

  // --- NEW: Billing Address Functions --- // <-- NEW SECTION

  // 1. Fetch billing addresses from API
  const fetchBillingAddresses = async () => {
    setIsLoadingBillingAddresses(true);
    try {
      // Maan rahe hain ki billing ke liye bhi same service use hogi
      const res = await purchaseOrderService.fetchAdressess();
      setBillingAddresses(res);
    } catch (error) {
      console.error("Failed to fetch billing addresses:", error);
    } finally {
      setIsLoadingBillingAddresses(false);
      setHasFetchedBillingAddresses(true);
    }
  };

  // 2. Dropdown khulne par fetch karein
  const handleBillingAddressDropdownOpen = () => {
    if (!hasFetchedBillingAddresses) {
      fetchBillingAddresses();
    }
  };

  // 3. Jab user list se billing address select kare
  const handleSelectBillingAddress = (address: any) => {
    setBillingAddressSearchQuery(address.name || address.street);
    setIsBillingAddressSearchFocused(false);
    setNewPO((currentState) => ({
      ...currentState,
      billingAddressId: address.id, // Selected ID ko state mein save karein
      billingAddress: address, // Poora object bhi save karein
    }));
  };

  // 4. Jab user "Create New Billing Address" button par click kare
  const handleAddNewBillingAddress = async () => {
    setIsCreatingBillingAddress(true);
    setBillingAddressApiError(null);
    try {
      const createdAddress = await purchaseOrderService.createAddressOrder({
        purchaseOrderId: "",
        address: {
          line1: newBillingAddress.street,
          city: newBillingAddress.city,
          state: newBillingAddress.stateProvince,
          postalCode: newBillingAddress.ZIP,
          country: newBillingAddress.country,
        },
        type: "billing",
      } as any);

      console.log("New Billing Address Created:", createdAddress);

      setBillingAddresses((prev) => [createdAddress, ...prev]);
      handleSelectBillingAddress(createdAddress); // Newly created address ko select karein
      setShowNewBillingAddressForm(false);
      setNewBillingAddress({
        street: "",
        city: "",
        stateProvince: "",
        ZIP: "",
        country: "IN",
      }); // Form reset karein
    } catch (error: any) {
      console.error("Failed to create billing address:", error);
      setBillingAddressApiError(error.message || "Failed to create address");
    } finally {
      setIsCreatingBillingAddress(false);
    }
  };

  // --- JSX RENDER ---
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div>
        <div className="mx-auto w-full max-w-[820px] p-6 space-y-10">
          {/* PO Number Section */}
          <section>
            {/* ... (PO Number ka code same hai) ... */}
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
                  className="h-9 text-sm"
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
            {/* ... (Vendor ka code same hai) ... */}
            <div className="text-base font-medium mb-4 mt-4 ">Vendor</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {newPO.vendorId &&
              vendors.find((v) => v.id === newPO.vendorId) ? (
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
                    <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                              onMouseDown={(e) => {
                                e.preventDefault();
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
            {/* ... (Order Items ka code same hai) ... */}
            <div className="text-base font-medium mb-3">Order Items</div>
            <div className="overflow border rounded-lg">
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

                    // Filtered parts list
                    const filteredParts = parts.filter((p) =>
                      p.name.toLowerCase().includes(it.itemName.toLowerCase())
                    );

                    return (
                      <tr key={it.id} className="border-t">
                        <td className="p-3 relative">
                          {/* --- ITEM NAME INPUT (COMBOBOX) --- */}
                          <Input
                            className="h-9 text-sm bg-white border-orange-600"
                            placeholder="Start typing or select..."
                            value={it.itemName}
                            onChange={(e) => {
                              const newItemName = e.target.value;

                              // 1. Item name ko update karein
                              updateItemField(it.id, "itemName", newItemName);

                              // 2. Agar user ne input ko clear kar diya hai
                              if (newItemName === "") {
                                // 3. Toh Part Number, Unit Cost, aur partId ko reset karein
                                updateItemField(it.id, "partNumber", "");
                                updateItemField(it.id, "unitCost", 0);
                                updateItemField(it.id, "partId", null);
                              }
                            }}
                            onFocus={() => {
                              handlePartDropdownOpen(); // Data fetch karein
                              setFocusedItemId(it.id); // Is row ko focused set karein
                            }}
                            onBlur={() => {
                              // Thoda delay dein taaki click register ho sake
                              setTimeout(() => setFocusedItemId(null), 150);
                            }}
                          />

                          {/* --- DROPDOWN LOGIC --- */}
                          {focusedItemId === it.id && (
                            <div className="absolute z-50 w-[95%] mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {isLoadingParts ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  Loading...
                                </div>
                              ) : filteredParts.length === 0 && it.itemName ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No parts found.
                                </div>
                              ) : (
                                filteredParts.map((part) => (
                                  <div
                                    key={part.id} // Assume part ke paas ek unique 'id' hai
                                    className="p-2 z-50 text-sm hover:bg-muted cursor-pointer"
                                    onMouseDown={(e) => {
                                      e.preventDefault();

                                      // 1. INPUT MEIN NAAM DIKHAO
                                      updateItemField(
                                        it.id,
                                        "itemName",
                                        part.name
                                      );

                                      // 2. STATE MEIN 'partId' SAVE KARO
                                      updateItemField(it.id, "partId", part.id);

                                      // 3. Part number bhi update kar dein
                                      updateItemField(
                                        it.id,
                                        "partNumber",
                                        part.partNumber || ""
                                      );

                                      // 4. Unit Cost bhi update kar dein (apne 'part.cost' se badlein)
                                      updateItemField(
                                        it.id,
                                        "unitCost",
                                        part.unitCost || 0 // 'part.unitCost' ya 'part.cost' jo bhi aapke API se aata hai
                                      );

                                      // 5. Dropdown band kar dein
                                      setFocusedItemId(null);
                                    }}
                                  >
                                    {part.name}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
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

            {/* Totals Section */}
            {/* ... (Totals ka code same hai) ... */}
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

          {/* --- NEW Shipping Information Section --- */}
          <section>
            <div className="text-base font-medium mb-4">
              Shipping Information
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* --- Logic: Address dikhayein, ya search box, ya naya form --- */}

              {/* 1. Jab Address Selected Hai (aur naya form nahi khula) */}
              {newPO.shippingAddressId && !showNewAddressForm ? ( // <-- CHANGED: Check ID
                <div className="flex items-center justify-between h-9 px-3 py-2 text-sm border rounded-md bg-muted/50">
                  <span>
                    {/* <-- CHANGED: Find by ID or use stored object --> */}
                    {(
                      shippingAddresses.find(
                        (a) => a.id === newPO.shippingAddressId
                      ) || newPO.shippingAddress
                    )?.name ||
                      (
                        shippingAddresses.find(
                          (a) => a.id === newPO.shippingAddressId
                        ) || newPO.shippingAddress
                      )?.street}
                  </span>
                  <Button
                    variant="ghost"
                    className="h-auto p-1 text-orange-600 hover:text-orange-700"
                    onClick={() => {
                      setNewPO((s) => ({
                        ...s,
                        shippingAddressId: undefined,
                        // shippingAddress: {},
                      }));
                      setAddressSearchQuery("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : /* 2. Jab Naya Address Form Khula Hai */
              showNewAddressForm ? (
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="text-sm font-medium">Create New Address</div>
                  {/* New Address Form Fields */}
                  <div className="flex gap-4">
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="Street Address (Line 1)"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress((s) => ({ ...s, street: e.target.value }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress((s) => ({ ...s, city: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex md:grid-cols-2 gap-3">
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="State / Province"
                      value={newAddress.stateProvince} // <-- CHANGED: Was newAddress.state
                      onChange={(e) =>
                        setNewAddress((s) => ({
                          ...s,
                          stateProvince: e.target.value,
                        }))
                      }
                    />

                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="PIN Code"
                      value={newAddress.ZIP}
                      onChange={(e) =>
                        setNewAddress((s) => ({
                          ...s,
                          ZIP: e.target.value,
                        }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress((s) => ({
                          ...s,
                          country: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {addressApiError && (
                    <div className="text-sm text-red-600">
                      {addressApiError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowNewAddressForm(false)}
                      disabled={isCreatingAddress}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handleAddNewAddress}
                      disabled={
                        isCreatingAddress ||
                        !newAddress.street ||
                        !newAddress.city
                      }
                    >
                      {isCreatingAddress ? "Adding..." : "Add Address"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* 3. Jab Kuch Selected Nahi Hai (Search Combobox) */
                <div className="relative">
                  <Input
                    placeholder="Search shipping address..."
                    className="h-9 text-sm bg-white border-orange-600"
                    value={addressSearchQuery}
                    onFocus={() => {
                      setIsAddressSearchFocused(true);
                      handleAddressDropdownOpen();
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsAddressSearchFocused(false), 150);
                    }}
                    onChange={(e) => setAddressSearchQuery(e.target.value)}
                  />
                  {isAddressSearchFocused && (
                    <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingAddresses ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Loading addresses...
                        </div>
                      ) : (
                        <>
                          {shippingAddresses
                            .filter((addr) =>
                              (addr.name || addr.street)
                                .toLowerCase()
                                .includes(addressSearchQuery.toLowerCase())
                            )
                            .map((addr) => (
                              <div
                                key={addr.id}
                                className="p-2 text-sm hover:bg-muted cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectAddress(addr);
                                  // newPO.shippingAddressId(addr.id); // <-- REMOVED BUG
                                }}
                              >
                                {addr.name || addr.street} ({addr.city})
                              </div>
                            ))}

                          {/* --- Create New Address Button --- */}
                          <div
                            className="p-2 text-sm text-orange-600 font-medium hover:bg-muted cursor-pointer border-t"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setShowNewAddressForm(true);
                              setIsAddressSearchFocused(false);
                            }}
                          >
                            + Create New Address
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- Contact Details (Abhi bhi yahi rahenge) --- */}
              <div className="text-base font-medium mt-4">Contact</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  className="h-9 text-sm bg-white border-orange-600"
                  placeholder="Contact name"
                  value={newPO.contactName}
                  onChange={(e) =>
                    setNewPO((s) => ({ ...s, contactName: e.target.value }))
                  }
                />
                <Input
                  className="h-9 text-sm bg-white border-orange-600"
                  placeholder="Email or Phone Number"
                  value={newPO.phoneOrMail}
                  onChange={(e) =>
                    setNewPO((s) => ({
                      ...s,
                      phoneOrMail: e.target.value,
                    }))
                  }
                />
              </div>

              {/* --- Billing Address Checkbox --- */}
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
                              ? {
                                  billingAddressId: s.shippingAddressId,
                                  billingAddress: s.shippingAddress,
                                }
                              : {
                                  billingAddressId: undefined,
                                  // billingAddress: {},
                                }),
                          }));
                  }}
                />
                Use the same Shipping and Billing Address
              </label>

              {/* --- Manual Billing Address Form (Agar checkbox un-checked hai) --- */}
              {/* // <-- CHANGED: Poora block replace kar diya hai --> */}
              {!newPO.sameShipBill && (
                <>
                  <div className="text-base font-medium mt-4">
                    Billing Address
                  </div>
                  {/* --- Logic: Address dikhayein, ya search box, ya naya form --- */}

                  {/* 1. Jab Billing Address Selected Hai (aur naya form nahi khula) */}
                  {newPO.billingAddressId && !showNewBillingAddressForm ? (
                    <div className="flex items-center justify-between h-9 px-3 py-2 text-sm border rounded-md bg-muted/50">
                      <span>
                        {(
                          billingAddresses.find(
                            (a) => a.id === newPO.billingAddressId
                          ) || newPO.billingAddress
                        )?.name ||
                          (
                            billingAddresses.find(
                              (a) => a.id === newPO.billingAddressId
                            ) || newPO.billingAddress
                          )?.street}
                      </span>
                      <Button
                        variant="ghost"
                        className="h-auto p-1 text-orange-600 hover:text-orange-700"
                        onClick={() => {
                          setNewPO((s) => ({
                            ...s,
                            billingAddressId: undefined,
                            // billingAddress: {},
                          }));
                          setBillingAddressSearchQuery("");
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : /* 2. Jab Naya Billing Address Form Khula Hai */
                  showNewBillingAddressForm ? (
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="text-sm font-medium">
                        Create New Billing Address
                      </div>
                      {/* New Address Form Fields */}
                      <div className="flex gap-4">
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="Street Address (Line 1)"
                          value={newBillingAddress.street}
                          onChange={(e) =>
                            setNewBillingAddress((s) => ({
                              ...s,
                              street: e.target.value,
                            }))
                          }
                        />
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="City"
                          value={newBillingAddress.city}
                          onChange={(e) =>
                            setNewBillingAddress((s) => ({
                              ...s,
                              city: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex md:grid-cols-2 gap-3">
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="State / Province"
                          value={newBillingAddress.stateProvince}
                          onChange={(e) =>
                            setNewBillingAddress((s) => ({
                              ...s,
                              stateProvince: e.target.value,
                            }))
                          }
                        />
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="PIN Code"
                          value={newBillingAddress.ZIP}
                          onChange={(e) =>
                            setNewBillingAddress((s) => ({
                              ...s,
                              ZIP: e.target.value,
                            }))
                          }
                        />
                        <Input
                          className="h-9 text-sm bg-white border-orange-600"
                          placeholder="Country"
                          value={newBillingAddress.country}
                          onChange={(e) =>
                            setNewBillingAddress((s) => ({
                              ...s,
                              country: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {billingAddressApiError && (
                        <div className="text-sm text-red-600">
                          {billingAddressApiError}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => setShowNewBillingAddressForm(false)}
                          disabled={isCreatingBillingAddress}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={handleAddNewBillingAddress}
                          disabled={
                            isCreatingBillingAddress ||
                            !newBillingAddress.street ||
                            !newBillingAddress.city
                          }
                        >
                          {isCreatingBillingAddress
                            ? "Adding..."
                            : "Add Address"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* 3. Jab Kuch Selected Nahi Hai (Search Combobox) */
                    <div className="relative">
                      <Input
                        placeholder="Search billing address..."
                        className="h-9 text-sm bg-white border-orange-600"
                        value={billingAddressSearchQuery}
                        onFocus={() => {
                          setIsBillingAddressSearchFocused(true);
                          handleBillingAddressDropdownOpen();
                        }}
                        onBlur={() => {
                          setTimeout(
                            () => setIsBillingAddressSearchFocused(false),
                            150
                          );
                        }}
                        onChange={(e) =>
                          setBillingAddressSearchQuery(e.target.value)
                        }
                      />
                      {isBillingAddressSearchFocused && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {isLoadingBillingAddresses ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              Loading addresses...
                            </div>
                          ) : (
                            <>
                              {billingAddresses
                                .filter((addr) =>
                                  (addr.name || addr.street)
                                    .toLowerCase()
                                    .includes(
                                      billingAddressSearchQuery.toLowerCase()
                                    )
                                )
                                .map((addr) => (
                                  <div
                                    key={addr.id}
                                    className="p-2 text-sm hover:bg-muted cursor-pointer"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectBillingAddress(addr);
                                    }}
                                  >
                                    {addr.name || addr.street} ({addr.city})
                                  </div>
                                ))}

                              {/* --- Create New Address Button --- */}
                              <div
                                className="p-2 text-sm text-orange-600 font-medium hover:bg-muted cursor-pointer border-t"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setShowNewBillingAddressForm(true);
                                  setIsBillingAddressSearchFocused(false);
                                }}
                              >
                                + Create New Address
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
          {/* --- End of Shipping Information Section --- */}

          {/* Details & Submit Section */}
          <section>
            {/* ... (Details & Submit ka code same hai) ... */}
            <div className="text-base font-medium mb-4">Due Date</div>
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
                <div className="text-base font-medium mb-4">
                  Note
                </div>
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

            <div className="mt-4 space-y-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="link"
                className="gap-2 h-9 text-orange-600 p-0"
                onClick={handleFileAttachClick}
                disabled={isCreating}
              >
                <Paperclip className="h-4 w-4" />
                Attach files
              </Button>
              <div className="flex flex-wrap gap-2">
                {attachedFiles?.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-2 text-sm bg-muted rounded-full pl-3 pr-2 py-1"
                  >
                    <span>{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(file.name)}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isCreating}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {apiError && (
              <div className="text-sm text-red-600 mr-auto">
                Error: {apiError}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
