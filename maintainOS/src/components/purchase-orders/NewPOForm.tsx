import {
  Calendar,
  DollarSign,
  Paperclip,
  Plus,
  Trash2,
  Percent,
  User,
  X,
  Search,
  Check,
  IndianRupee,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatMoney } from "./helpers";
import { type NewPOFormProps, type Vendor } from "./po.types";
import { useState, useRef, useEffect } from "react";
import { vendorService } from "../../store/vendors";
import { partService } from "../../store/parts";
import { purchaseOrderService } from "../../store/purchaseOrders";

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Helper for Avatar Initials ---
const getInitials = (name: string) => {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// --- Helper for Avatar Colors ---
const getRandomAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  const index = (name?.length || 0) % colors.length;
  return colors[index];
};

export function NewPOForm(props: NewPOFormProps) {
  const {
    newPO,
    setNewPO,
    newPOSubtotal,
    addNewPOItemRow,
    removePOItemRow,
    updateItemField,
    isCreating,
    apiError,
    attachedFiles,
    fileInputRef,
    handleFileAttachClick,
    handleFileChange,
    removeAttachedFile,
    showCustomPoInput,
    setShowCustomPoInput,
  } = props;

  // --- Vendor State ---
  // ✅ FIX 1: Initialize vendors with the current vendor object if available (Edit Mode Fix)
  const [vendors, setVendors] = useState<Vendor[]>(
    (newPO as any).vendor ? [(newPO as any).vendor] : []
  );
  
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [hasFetchedVendors, setHasFetchedVendors] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [isVendorSearchFocused, setIsVendorSearchFocused] = useState(false);

  // ✅ FIX 2: Fallback logic for finding selected vendor
  const selectedVendor = 
    vendors.find((v) => v.id === newPO.vendorId) || (newPO as any).vendor;

  // --- Contact Logic State ---
  // ✅ FIX 3: Initialize contacts state from the mapped prop passed during Edit Mode
  const [vendorContacts, setVendorContacts] = useState<any[]>(
    (newPO as any).initialVendorContacts || []
  );
  
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Form Data for New Contact
  const [newContactData, setNewContactData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });

  // --- Parts & Address States ---
  const [parts, setPart] = useState<any[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [hasFetchedParts, setHasFetchedParts] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [isAddressSearchFocused, setIsAddressSearchFocused] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [addressApiError, setAddressApiError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    stateProvince: "",
    ZIP: "",
    country: "IN",
  });

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

  const [newBillingAddress, setNewBillingAddress] = useState({
    street: "",
    city: "",
    stateProvince: "",
    ZIP: "",
    country: "IN",
  });

  // --- Fetching Functions ---
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

  const fetchPart = async () => {
    setIsLoadingParts(true);
    try {
      const partData = await partService.fetchParts();
      setPart(partData);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    } finally {
      setIsLoadingParts(false);
      setHasFetchedParts(true);
    }
  };

  const handleVendorDropdownOpen = (isOpen: boolean) => {
    if (isOpen && !hasFetchedVendors) fetchVendors();
    if (isOpen && !hasFetchedParts) fetchPart();
  };

  const handlePartDropdownOpen = () => {
    if (!hasFetchedParts) fetchPart();
  };

  // --- PO Number Handlers ---
  const handleUseAutoPo = () => {
    setShowCustomPoInput(false);
    setNewPO((s) => ({ ...s, poNumber: "" }));
  };

  const handleUseCustomPo = () => {
    setShowCustomPoInput(true);
  };

  // ----------------------------------------------------------
  // --- CONTACT LOGIC: Multi-select & ID Payload Handling ---
  // ----------------------------------------------------------

  // 1. Fetch Contacts on Click
  const handleVendorContactClick = async () => {
    if (!selectedVendor) return;
    if (showContactForm) setShowContactForm(false);

    if (isContactDropdownOpen) {
      setIsContactDropdownOpen(false);
      return;
    }

    setIsContactLoading(true);
    try {
      const res = await vendorService.fetchVendorContact(selectedVendor.id);
      let contactsArray: any[] = [];

      if (Array.isArray(res)) {
        contactsArray = res;
      } else if (res && Array.isArray(res.data)) {
        contactsArray = res.data;
      } else if (res && Array.isArray(res.contacts)) {
        contactsArray = res.contacts;
      }

      setVendorContacts(contactsArray);

      // Decide: Show List or Form?
      if (contactsArray.length > 0) {
        setIsContactDropdownOpen(true);
        setShowContactForm(false);
      } else {
        setIsContactDropdownOpen(false);
        setShowContactForm(true);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setShowContactForm(true);
    } finally {
      setIsContactLoading(false);
    }
  };

  // 2. Toggle Selection (Multi-select)
  // FIXED: This only updates the ID list, does NOT touch text inputs
  const toggleContactSelection = (contact: any) => {
    setNewPO((prev) => {
      const currentIds = (prev as any).vendorContactIds || [];
      const isSelected = currentIds.includes(contact.id);

      let updatedIds;
      if (isSelected) {
        // Remove ID
        updatedIds = currentIds.filter((id: string) => id !== contact.id);
      } else {
        // Add ID
        updatedIds = [...currentIds, contact.id];
      }

      return {
        ...prev,
        vendorContactIds: updatedIds, // Only update IDs
      };
    });
  };

  // 3. Remove Contact Chip
  const removeSelectedContact = (contactId: string) => {
    setNewPO((prev) => ({
      ...prev,
      vendorContactIds: ((prev as any).vendorContactIds || []).filter(
        (id: string) => id !== contactId
      ),
    }));
  };

  // 4. Save New Contact
  const handleSaveNewContact = async () => {
    if (!selectedVendor) return;
    setIsSavingContact(true);

    try {
      const payload = {
        vendorId: selectedVendor.id,
        fullName: newContactData.name,
        role: newContactData.role,
        email: newContactData.email,
        phoneNumber: newContactData.phone,
        phoneExtension: "+91",
        contactColor: getRandomAvatarColor(newContactData.name)
          .replace("bg-", "")
          .replace("-500", ""),
      };

      const savedContact = await vendorService.createVendorContact(
        selectedVendor.id,
        payload
      );

      // Add to local list so it appears in dropdown
      setVendorContacts((prev) => [savedContact, ...prev]);

      // Automatically select this new contact's ID
      toggleContactSelection(savedContact);

      // Reset form
      setShowContactForm(false);
      setNewContactData({ name: "", role: "", email: "", phone: "" });
    } catch (error) {
      console.error("Failed to save contact", error);
    } finally {
      setIsSavingContact(false);
    }
  };

  // --- Address Handlers ---
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

  const handleAddressDropdownOpen = () => {
    if (!hasFetchedAddresses) fetchAddresses();
  };

  const handleSelectAddress = (address: any) => {
    setAddressSearchQuery(address.name || address.street);
    setIsAddressSearchFocused(false);
    setNewPO((currentState) => {
      const newState = {
        ...currentState,
        shippingAddressId: address.id,
        shippingAddress: address,
      };
      if (currentState.sameShipBill) {
        newState.billingAddressId = address.id;
        newState.billingAddress = address;
      }
      return newState;
    });
  };

  const handleAddNewAddress = async () => {
    setIsCreatingAddress(true);
    setAddressApiError(null);
    try {
      const createdAddress = await purchaseOrderService.createAddressOrder({
        ...newAddress,
      });
      setShippingAddresses((prev) => [createdAddress, ...prev]);
      handleSelectAddress(createdAddress);
      setShowNewAddressForm(false);
      setNewAddress({
        street: "",
        city: "",
        stateProvince: "",
        ZIP: "",
        country: "IN",
      });
    } catch (error: any) {
      setAddressApiError(error.message || "Failed to create address");
    } finally {
      setIsCreatingAddress(false);
    }
  };

  const fetchBillingAddresses = async () => {
    setIsLoadingBillingAddresses(true);
    try {
      const res = await purchaseOrderService.fetchAdressess();
      setBillingAddresses(res);
    } catch (error) {
      console.error("Failed to fetch billing addresses:", error);
    } finally {
      setIsLoadingBillingAddresses(false);
      setHasFetchedBillingAddresses(true);
    }
  };

  const handleBillingAddressDropdownOpen = () => {
    if (!hasFetchedBillingAddresses) fetchBillingAddresses();
  };

  const handleSelectBillingAddress = (address: any) => {
    setBillingAddressSearchQuery(address.name || address.street);
    setIsBillingAddressSearchFocused(false);
    setNewPO((currentState) => ({
      ...currentState,
      billingAddressId: address.id,
      billingAddress: address,
    }));
  };

  const handleAddNewBillingAddress = async () => {
    setIsCreatingBillingAddress(true);
    setBillingAddressApiError(null);
    try {
      const createdAddress = await purchaseOrderService.createAddressOrder({
        ...newBillingAddress,
      });
      setBillingAddresses((prev) => [createdAddress, ...prev]);
      handleSelectBillingAddress(createdAddress);
      setShowNewBillingAddressForm(false);
      setNewBillingAddress({
        street: "",
        city: "",
        stateProvince: "",
        ZIP: "",
        country: "IN",
      });
    } catch (error: any) {
      setBillingAddressApiError(error.message || "Failed to create address");
    } finally {
      setIsCreatingBillingAddress(false);
    }
  };

  // --- Tax Calculation ---
  const calculateTotalExtras = () => {
    const taxLines = (newPO as any).taxLines || [];
    return taxLines.reduce((acc: number, item: any) => {
      const val = Number(item.value) || 0;
      if (item.type === "percentage") {
        return acc + (newPOSubtotal * val) / 100;
      }
      return acc + val;
    }, 0);
  };

  const finalCalculatedTotal = newPOSubtotal + calculateTotalExtras();

  const handleAddTaxLine = () => {
    const newTaxLine = {
      id: generateId(),
      label: "",
      value: 0,
      type: "percentage",
      isTaxable: true,
    };
    setNewPO((prev) => ({
      ...prev,
      // @ts-ignore
      taxLines: [...(prev.taxLines || []), newTaxLine],
    }));
  };

  const handleRemoveTaxLine = (id: string) => {
    setNewPO((prev) => ({
      ...prev,
      // @ts-ignore
      taxLines: (prev.taxLines || []).filter((t: any) => t.id !== id),
    }));
  };

  const handleUpdateTaxLine = (id: string, field: string, value: any) => {
    setNewPO((prev) => ({
      ...prev,
      // @ts-ignore
      taxLines: (prev.taxLines || []).map((t: any) => {
        if (t.id === id) {
          return { ...t, [field]: value };
        }
        return t;
      }),
    }));
  };

  // --- RENDER ---
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div>
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
                  className="h-9 text-sm bg-white border border-border"
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
            <div className="text-base font-medium mb-4 mt-4 ">Vendor</div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* 1. VENDOR SELECTED STATE */}
              {newPO.vendorId && selectedVendor ? (
                <div className="flex flex-col gap-2">
                  {/* Selected Vendor Badge */}
                  <div className="flex items-center z-50 justify-between h-9 px-3 py-2 text-sm border rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {selectedVendor.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{selectedVendor.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-auto p-1 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setNewPO((s) => ({
                          ...s,
                          vendorId: "",
                          vendorContactIds: [],
                          contactName: "", // Clears manual input (optional, can remove)
                          phoneOrMail: "", // Clears manual input (optional, can remove)
                        }));
                        setVendorSearchQuery("");
                        setShowContactForm(false);
                        setIsContactDropdownOpen(false);
                        setVendorContacts([]);
                      }}
                    >
                      &times;
                    </Button>
                  </div>

                  {/* 2. SELECTED CONTACTS CHIPS */}
                  <div className="flex flex-wrap gap-2 mb-1">
                    {((newPO as any).vendorContactIds || []).map(
                      (selectedId: string) => {
                        const contactDetails = vendorContacts.find(
                          (c) => c.id === selectedId
                        );
                        if (!contactDetails) return null;

                        return (
                          <div
                            key={selectedId}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 animate-in fade-in zoom-in duration-200"
                          >
                            <div
                              // className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0"
                              style={{
                                backgroundColor: contactDetails.contactColor
                                  ? contactDetails.contactColor
                                  : undefined,
                              }}
                              {...(!contactDetails.contactColor
                                ? {
                                    className: `w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0 ${getRandomAvatarColor(
                                      contactDetails.fullName
                                    )}`,
                                  }
                                : {})}
                            >
                              {getInitials(contactDetails.fullName)}
                            </div>
                            <span>{contactDetails.fullName}</span>
                            <button
                              onClick={() => removeSelectedContact(selectedId)}
                              className="hover:text-blue-900 rounded-full hover:bg-blue-200 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* --- SMART CONTACT SELECTION --- */}

                  {/* A. Create New Contact Form */}
                  {showContactForm ? (
                    <div className="border rounded-lg p-4 mt-2 bg-white space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold">
                          Add New Contact
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowContactForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">
                            Full Name
                          </label>
                          <Input
                            placeholder="e.g. John Smith"
                            className="h-9 text-sm"
                            value={newContactData.name}
                            onChange={(e) =>
                              setNewContactData((s) => ({
                                ...s,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Role</label>
                          <Input
                            placeholder="e.g. Accounting"
                            className="h-9 text-sm"
                            value={newContactData.role}
                            onChange={(e) =>
                              setNewContactData((s) => ({
                                ...s,
                                role: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Email</label>
                          <Input
                            placeholder="e.g. john@example.com"
                            className="h-9 text-sm"
                            value={newContactData.email}
                            onChange={(e) =>
                              setNewContactData((s) => ({
                                ...s,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">
                            Phone Number
                          </label>
                          <Input
                            placeholder="e.g. 415-555-0123"
                            className="h-9 text-sm"
                            value={newContactData.phone}
                            onChange={(e) =>
                              setNewContactData((s) => ({
                                ...s,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                          disabled={!newContactData.name || isSavingContact}
                          onClick={handleSaveNewContact}
                        >
                          {isSavingContact ? "Saving..." : "Save Contact"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* B. Link Trigger + Searchable Dropdown */
                    <div className="relative w-full">
                      {/* Link Trigger */}
                      <button
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none"
                        onClick={handleVendorContactClick}
                        disabled={isContactLoading}
                      >
                        {!((newPO as any).vendorContactIds?.length > 0) &&
                          !isContactLoading && <Plus className="h-4 w-4" />}
                        <span>
                          {isContactLoading
                            ? "Loading contacts..."
                            : "Select Vendor Contact"}
                        </span>
                      </button>

                      {/* Searchable Dropdown */}
                      {isContactDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] z-50 bg-white border rounded-lg shadow-lg overflow-hidden max-h-80 flex flex-col">
                          {/* Search Bar */}
                          <div className="flex items-center border-b px-3 py-2 bg-white sticky top-0 z-10">
                            <Search className="h-4 w-4 text-muted-foreground mr-2" />
                            <input
                              className="flex-1 text-sm outline-none placeholder:text-muted-foreground"
                              placeholder="Start typing..."
                              value={contactSearchQuery}
                              onChange={(e) =>
                                setContactSearchQuery(e.target.value)
                              }
                              autoFocus
                            />
                            <button
                              onClick={() => setIsContactDropdownOpen(false)}
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-black" />
                            </button>
                          </div>

                          {/* List */}
                          <div className="flex-1 overflow-y-auto">
                            {vendorContacts.length === 0 && (
                              <div className="p-3 text-sm text-muted-foreground text-center">
                                No contacts found.
                              </div>
                            )}
                            {vendorContacts
                              .filter((c: any) =>
                                c?.fullName
                                  ?.toLowerCase()
                                  .includes(contactSearchQuery.toLowerCase())
                              )
                              .map((contact: any) => {
                                const isSelected = (
                                  (newPO as any).vendorContactIds || []
                                ).includes(contact.id);

                                return (
                                  <div
                                    key={contact.id}
                                    className={`flex items-center z-50 px-4 py-3 cursor-pointer border-b last:border-0 ${
                                      isSelected
                                        ? "bg-blue-50"
                                        : "hover:bg-muted"
                                    }`}
                                    onClick={() =>
                                      toggleContactSelection(contact)
                                    }
                                  >
                                    {/* Avatar */}
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shrink-0`}
                                      style={{
                                        backgroundColor: contact.contactColor
                                          ? contact.contactColor
                                          : undefined,
                                      }}
                                      {...(!contact.contactColor
                                        ? {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0 ${getRandomAvatarColor(
                                              contact.fullName
                                            )}`,
                                          }
                                        : {})}
                                    >
                                      {getInitials(contact.fullName)}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {contact.fullName}{" "}
                                        <span className="text-muted-foreground font-normal">
                                          - {contact.role || "No Role"}
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {contact.email || contact.phoneNumber}
                                      </div>
                                    </div>

                                    {/* Checkmark */}
                                    {isSelected && (
                                      <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                  </div>
                                );
                              })}

                            {/* Add New Contact Button */}
                            <div
                              className="p-3 text-sm text-blue-600 font-medium hover:bg-blue-50 cursor-pointer text-center border-t bg-gray-50 sticky bottom-0"
                              onClick={() => {
                                setIsContactDropdownOpen(false);
                                setShowContactForm(true);
                              }}
                            >
                              + Add New Contact
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* 2. VENDOR SEARCH INPUT (Default) */
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
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg overflow-y-auto"style={{ maxHeight: `${3 * 36}px` }}>
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

            {/* Order Items Table */}
            <div className="text-base font-medium mb-3">Order Items</div>
            <div className="overflow border rounded-lg">
              {/* ... (Table code remains the same) ... */}
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

                    const filteredParts = parts.filter((p) =>
                      p.name.toLowerCase().includes(it.itemName.toLowerCase())
                    );

                    return (
                      <tr key={it.id} className="border-t">
                        <td className="p-3 relative">
                          <Input
                            className="h-9 text-sm bg-white border-orange-600"
                            placeholder="Start typing or select..."
                            value={it.itemName}
                            onChange={(e) => {
                              const newItemName = e.target.value;
                              updateItemField(it.id, "itemName", newItemName);
                              if (newItemName === "") {
                                updateItemField(it.id, "partNumber", "");
                                updateItemField(it.id, "unitCost", 0);
                                updateItemField(it.id, "partId", null);
                              }
                            }}
                            onFocus={() => {
                              handlePartDropdownOpen();
                              setFocusedItemId(it.id);
                            }}
                            onBlur={() => {
                              setTimeout(() => setFocusedItemId(null), 150);
                            }}
                          />
                          {focusedItemId === it.id && (
                            <div className="absolute z-50 w-[95%] mt-1 bg-background border rounded-md shadow-lg overflow-y-auto" style={{ maxHeight: `${3 * 48}px` }}>
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
                                    key={part.id}
                                    className="p-2 z-50 text-sm hover:bg-muted cursor-pointer"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      updateItemField(
                                        it.id,
                                        "itemName",
                                        part.name
                                      );
                                      updateItemField(it.id, "partId", part.id);
                                      updateItemField(
                                        it.id,
                                        "partNumber",
                                        part.partNumber || ""
                                      );
                                      updateItemField(
                                        it.id,
                                        "unitCost",
                                        part.unitCost || 0
                                      );
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
                              ₹
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

            {/* Taxes & Costs Section */}
            <div className="flex flex-col items-end mt-4 space-y-3">
              {((newPO as any).taxLines || []).map((tax: any) => (
                <div
                  key={tax.id}
                  className="flex flex-col items-end w-full md:w-auto"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Input
                      className="h-9 text-sm w-48 bg-white border-orange-600"
                      placeholder="Tax / Cost Label"
                      value={tax.label}
                      onChange={(e) =>
                        handleUpdateTaxLine(tax.id, "label", e.target.value)
                      }
                    />
                    <div className="flex items-center h-9 border border-orange-600 rounded-md bg-white overflow-hidden">
                      <Input
                        className="h-full border-0 rounded-none bg-white w-24 text-sm px-2"
                        type="number"
                        min={0}
                        step="0.01"
                        value={tax.value}
                        onChange={(e) =>
                          handleUpdateTaxLine(tax.id, "value", e.target.value)
                        }
                        placeholder="0"
                      />
                      <div className="flex h-full border-l border-orange-200">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTaxLine(tax.id, "type", "fixed")
                          }
                          className={`px-2 h-full flex items-center justify-center text-xs font-medium transition-colors ${
                            tax.type === "fixed"
                              ? "bg-orange-600 text-white"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          <IndianRupee className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTaxLine(tax.id, "type", "percentage")
                          }
                          className={`px-2 h-full flex items-center justify-center text-xs font-medium transition-colors ${
                            tax.type === "percentage"
                              ? "bg-orange-600 text-white"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          <Percent className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-orange-600 hover:text-red-600 hover:bg-transparent"
                      onClick={() => handleRemoveTaxLine(tax.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full justify-start md:justify-start md:pl-1">
                    <input
                      type="checkbox"
                      checked={tax.isTaxable}
                      onChange={(e) =>
                        handleUpdateTaxLine(
                          tax.id,
                          "isTaxable",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      id={`taxable-${tax.id}`}
                    />
                    <label
                      htmlFor={`taxable-${tax.id}`}
                      className="text-sm text-gray-700"
                    >
                      Taxable
                    </label>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end w-full gap-6">
                <button
                  className="text-sm text-orange-600 font-medium hover:underline"
                  onClick={handleAddTaxLine}
                >
                  + Add Taxes &amp; Costs
                </button>

                <div className="text-sm">
                  <span className="text-muted-foreground mr-2">Total</span>
                  <span className="font-semibold text-lg">
                    {formatMoney(finalCalculatedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Information Section */}
          <section>
            <div className="text-base font-medium mb-4">
              Shipping Information
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              {newPO.shippingAddressId && !showNewAddressForm ? (
                <div className="flex items-center justify-between h-9 px-3 py-2 text-sm border rounded-md bg-muted/50">
                  <span>
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
                        shippingAddressId: null,
                      }));
                      setAddressSearchQuery("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : showNewAddressForm ? (
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="text-sm font-medium">Create New Address</div>
                  <div className="flex gap-4">
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="Street Address (Line 1)"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress((s) => ({
                          ...s,
                          street: e.target.value,
                        }))
                      }
                    />
                    <Input
                      className="h-9 text-sm bg-white border-orange-600"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress((s) => ({
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
                      value={newAddress.stateProvince}
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
                                }}
                              >
                                {addr.name || addr.street} ({addr.city})
                              </div>
                            ))}
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
            </div>

            {/* Contact Details - Manual Entry (Separate from Vendor Selection) */}
            <div className="text-base font-medium mt-4">Contact</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
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
                  setNewPO((s) => ({ ...s, phoneOrMail: e.target.value }))
                }
              />
            </div>

            {/* Billing Address Checkbox */}
            <label className="flex items-center gap-2 text-sm select-none mt-2">
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
                      : { billingAddressId: null }),
                  }));
                }}
              />
              Use the same Shipping and Billing Address
            </label>

            {/* Manual Billing Address Form */}
            {!newPO.sameShipBill && (
              <>
                <div className="text-base font-medium mt-4">
                  Billing Address
                </div>
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
                          billingAddressId: null,
                        }));
                        setBillingAddressSearchQuery("");
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : showNewBillingAddressForm ? (
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="text-sm font-medium">
                      Create New Billing Address
                    </div>
                    {/* ... New Billing Address Form Fields (same as your code) ... */}
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
                        {isCreatingBillingAddress ? "Adding..." : "Add Address"}
                      </Button>
                    </div>
                  </div>
                ) : (
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
          </section>

          {/* Final Details (Due Date, Note, Files, Submit) */}
          <section>
            <div className="text-base font-medium mb-4 mt-4">Due Date</div>
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
                <div className="text-base font-medium mb-4">Note</div>
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
              {/* <div className="flex flex-wrap gap-2">
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
              </div> */}
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