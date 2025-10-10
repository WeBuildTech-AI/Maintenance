"use client";

import React from "react";
import type { NewItem } from "../inventory.types";
import { PartDynamicSelect, type PartSelectOption } from "./PartDynamicSelect";
import { FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchLocationsName } from "../../../store/locations/locations.thunks";

export function PartLocationSection({
  newItem,
  setNewItem,
}: {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [locationOptions, setLocationOptions] = React.useState<PartSelectOption[]>([]);
  const [loadingLocations, setLoadingLocations] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const selectedLocation = newItem.locationId || "";

  const fetchLocations = React.useCallback(() => {
    if (loadingLocations || locationOptions.length > 0) return;
    setLoadingLocations(true);
    dispatch(fetchLocationsName({ limit: 1000, page: 1, offset: 0 }))
      .unwrap()
      .then((response) => {
        const options = response.data.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
        }));
        setLocationOptions(options);
      })
      .catch((err) => console.error("Failed to fetch locations:", err))
      .finally(() => setLoadingLocations(false));
  }, [dispatch, loadingLocations, locationOptions.length]);

  const handleSelectLocation = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setNewItem((s) => ({ ...s, locationId: id }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "25px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.2fr 1fr 1fr 1fr",
          gap: "16px",
          alignItems: "end",
          width: "100%",
        }}
      >
        {/* Location */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600, marginBottom: "6px" }}>
            Location
          </label>
          <div style={{ height: "40px", display: "flex" }}>
            <div style={{ flex: 1 }}>
              <PartDynamicSelect
                options={locationOptions}
                value={selectedLocation}
                onSelect={handleSelectLocation}
                onFetch={fetchLocations}
                loading={loadingLocations}
                placeholder="Select Location"
                ctaText="Add New Location"
                onCtaClick={() => console.log("Open Add Location modal")}
                name="part_location"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            </div>
          </div>
        </div>

        {/* Area */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600, marginBottom: "6px" }}>
            Area
          </label>
          <input
            type="text"
            placeholder="Enter area"
            value={newItem.area || ""}
            onChange={(e) => setNewItem((s) => ({ ...s, area: e.target.value }))}
            style={{
              height: "40px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "0 12px",
              fontSize: "14px",
              color: "#374151",
              backgroundColor: "#fff",
            }}
          />
        </div>

        {/* Units in Stock */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600, marginBottom: "6px" }}>
            Units in Stock
          </label>
          <input
            type="number"
            value={newItem.unitInStock || ""}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, unitInStock: Number(e.target.value) }))
            }
            style={{
              height: "40px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "0 12px",
              fontSize: "14px",
              color: "#374151",
              backgroundColor: "#fff",
              textAlign: "center",
            }}
          />
        </div>

        {/* Minimum in Stock */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600, marginBottom: "6px" }}>
            Minimum in Stock
          </label>
          <input
            type="number"
            value={newItem.minInStock || ""}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, minInStock: Number(e.target.value) }))
            }
            style={{
              height: "40px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "0 12px",
              fontSize: "14px",
              color: "#374151",
              backgroundColor: "#fff",
              textAlign: "center",
            }}
          />
        </div>
      </div>

      {/* Add location link */}
      <div>
        <button
          type="button"
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: 500,
            color: "#2563EB",
            opacity: 0.9,
            cursor: "not-allowed",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <span style={{ marginRight: "6px" }}>+ Add location</span>
          <FaLock style={{ width: "14px", height: "14px", opacity: 0.8 }} />
        </button>
      </div>
    </div>
  );
}
