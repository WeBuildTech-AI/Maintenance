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

  const selectedLocations = newItem.locationIds ?? [];

  const fetchLocations = React.useCallback(async () => {
    if (loadingLocations) {
      console.log("⚠️ Already loading locations...");
      return;
    }
    console.log("📡 Fetching Locations...");
    setLoadingLocations(true);
    try {
      const res = await dispatch(fetchLocationsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      console.log("🧾 Raw API Response (fetchLocationsName):", res);

      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res?.data)) data = res.data;
      else if (Array.isArray(res?.results)) data = res.results;
      else if (Array.isArray(res?.items)) data = res.items;
      else if (Array.isArray(res?.rows)) data = res.rows;
      else {
        console.warn("⚠️ Unknown response structure. Full response:", res);
      }

      const options = data.map((loc: any, i) => ({
        id: String(loc.id ?? loc.location_id ?? i),
        name: loc.name ?? loc.location_name ?? `Unnamed (${i + 1})`,
      }));

      console.log("✅ Final Parsed Options (to render):", options);
      setLocationOptions(options);
    } catch (error) {
      console.error("❌ Failed to fetch locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  }, [dispatch, loadingLocations]);

  const handleSelectLocation = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    console.log("📍 Selected Location IDs:", ids);
    setNewItem((s) => ({ ...s, locationIds: ids }));
  };

  React.useEffect(() => {
    console.log("🔁 Location Options Updated:", locationOptions);
  }, [locationOptions]);

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
            Locations
          </label>
          <div style={{ height: "40px", display: "flex" }}>
            <div style={{ flex: 1 }}>
              <PartDynamicSelect
                options={locationOptions}
                value={newItem.locationId ?? ""}
                onSelect={(val) => setNewItem((s) => ({ ...s, locationId: val }))}
                onFetch={fetchLocations}
                loading={loadingLocations}
                placeholder="Select Location"
                ctaText="Add New Location"
                onCtaClick={() => console.log("Add Location")}
                name="part_location"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={false} // SINGLE
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
            onChange={(e) => setNewItem((s) => ({ ...s, unitInStock: Number(e.target.value) }))}
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
            onChange={(e) => setNewItem((s) => ({ ...s, minInStock: Number(e.target.value) }))}
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
