import { useMemo, useState, useEffect, type SetStateAction } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  Plus,
  Settings,
  PanelTop,
  Table,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { VendorSidebar } from "./VendorSidebar";
import { VendorDetails } from "./VendorDetails";
import { VendorTable } from "./VendorTable";
import { VendorForm } from "./VendorForm";
import { mockVendors, type Vendor } from "./vendors.types";
import POFilterBar from "../purchase-orders/POFilterBar";
import { VendorHeaderComponent } from "./VendorHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { vendorService } from "../../store/vendors";

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(
    mockVendors[0]?.id ?? ""
  );
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await vendorService.fetchVendors(10, 1, 0);
        setVendors(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const query = searchQuery.toLowerCase();
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        vendor.services.some((s) => s.toLowerCase().includes(query))
    );
  }, [vendors, searchQuery]);

  useEffect(() => {
    if (filteredVendors.length === 0) return;
    if (!filteredVendors.some((v) => v.id === selectedVendorId)) {
      setSelectedVendorId(filteredVendors[0].id);
    }
  }, [filteredVendors, selectedVendorId]);

  const selectedVendor =
    filteredVendors.find((v) => v.id === selectedVendorId) ??
    filteredVendors[0];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {VendorHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setIsCreatingVendor,
        setShowSettings
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden bg-muted/20">
        {viewMode === "panel" ? (
          <>
            <VendorSidebar
              vendors={filteredVendors}
              selectedVendorId={selectedVendorId}
              setSelectedVendorId={setSelectedVendorId}
              loading={loading}
            />
            <section className="flex-1 overflow-auto">
              {isCreatingVendor ? (
                <VendorForm
                  setVendors={setVendors}
                  setSelectedVendorId={setSelectedVendorId}
                  onCancel={() => setIsCreatingVendor(false)}
                />
              ) : selectedVendor ? // <VendorDetails
              //   vendor={selectedVendor}
              //   setVendors={setVendors}
              // />
              null : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Select a vendor to view details.
                </div>
              )}
            </section>
          </>
        ) : (
          <VendorTable
            vendors={filteredVendors}
            selectedVendorId={selectedVendorId}
          />
        )}
      </div>
    </div>
  );
}
