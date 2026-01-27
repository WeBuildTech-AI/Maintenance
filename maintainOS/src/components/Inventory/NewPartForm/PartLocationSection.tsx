"use client";
import React from "react";
import type { NewItem } from "../inventory.types";
// ✅ Replace with Shared DynamicSelect
import { DynamicSelect, type SelectOption } from "../../common/DynamicSelect";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchLocationsName } from "../../../store/locations/locations.thunks";
import { LocationFormDialog } from "./LocationFormDialog";

export function PartLocationSection({
  newItem,
  setNewItem,
}: {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [locationOptions, setLocationOptions] = React.useState<SelectOption[]>([]);
  const [loadingLocations, setLoadingLocations] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // 🆕 Hold the selected label locally so it appears even before API loads
  const [selectedLocationName, setSelectedLocationName] = React.useState<string>("");

  const fetchLocations = React.useCallback(async () => {
    if (loadingLocations) {
      console.log("⚠️ Already loading locations...");
      return;
    }
    console.log("📡 Fetching Locations...");
    setLoadingLocations(true);
    try {
      const res = await dispatch(fetchLocationsName()).unwrap() as any;
      console.log("🧾 Raw API Response (fetchLocationsName):", res);

      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res?.data)) data = res.data;
      else if (Array.isArray(res?.results)) data = res.results;
      else if (Array.isArray(res?.items)) data = res.items;
      else if (Array.isArray(res?.rows)) data = res.rows;
      else console.warn("⚠️ Unknown response structure. Full response:", res);

      const options = data.map((loc: any, i: any) => ({
        id: String(loc.id ?? loc.location_id ?? i),
        name: loc.name ?? loc.location_name ?? `Unnamed (${i + 1})`,
      }));

      console.log("✅ Final Parsed Options (to render):", options);
      setLocationOptions(options);

      // ✅ After loading, sync label if we already had a selection
      if (newItem.locationId) {
        const matched = options.find((opt: SelectOption) => String(opt.id) === String(newItem.locationId));
        if (matched) setSelectedLocationName(matched.name);
      }
    } catch (error) {
      console.error("❌ Failed to fetch locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  }, [dispatch, loadingLocations, newItem.locationId]);

  // ✅ Pre-fill from edit mode data
  React.useEffect(() => {
    if ((newItem as any).locations?.length > 0 && !selectedLocationName) {
      const loc = (newItem as any).locations[0];
      setSelectedLocationName(loc.locationName || loc.name || "");
    }
  }, [(newItem as any).locations, selectedLocationName]);

  const handleSelectLocation = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    console.log("📍 Selected Location IDs:", ids);
    setNewItem((s) => ({ ...s, locationId: ids[0] || "" }));

    // update visible label
    const matched = locationOptions.find((opt) => opt.id === ids[0]);
    if (matched) setSelectedLocationName(matched.name);
  };

  // ✅ Ensure we show selected label even before API loads
  const mergedOptions = React.useMemo(() => {
    if (!newItem.locationId || locationOptions.some((o) => o.id === newItem.locationId)) {
      return locationOptions;
    }
    return [
      { id: String(newItem.locationId), name: selectedLocationName || "Selected (Pending)" },
      ...locationOptions,
    ];
  }, [locationOptions, newItem.locationId, selectedLocationName]);

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
          <label
            style={{
              fontSize: "14px",
              color: "#111827",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Locations
          </label>
          <div style={{ height: "40px", display: "flex" }}>
            <div style={{ flex: 1 }}>
              <DynamicSelect
                options={mergedOptions} // 🟢 merged ensures label visible before API
                value={newItem.locationId ?? ""}
                onSelect={handleSelectLocation}
                onFetch={fetchLocations}
                loading={loadingLocations}
                placeholder={selectedLocationName || "Select Location"} // 🟢 show label
                ctaText="Add New Location"
                onCtaClick={() => console.log("Add Location")}
                name="part_location"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                limitOptions={3}

              />
            </div>
          </div>
        </div>

        {/* Area */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <label
            style={{
              fontSize: "14px",
              color: "#111827",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
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
          <label
            style={{
              fontSize: "14px",
              color: "#111827",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Units in Stock
          </label>
          <input
            type="number"
            value={newItem.unitsInStock || ""}
            onChange={(e) => setNewItem((s) => ({ ...s, unitsInStock: Number(e.target.value) }))}
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
          <label
            style={{
              fontSize: "14px",
              color: "#111827",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
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

      {/* Add Location Modal */}
      <div>
        <LocationFormDialog newItem={newItem} setNewItem={setNewItem} />
      </div>
    </div>
  );
}
