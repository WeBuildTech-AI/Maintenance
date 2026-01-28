"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LibDynamicSelect, {
  type LibSelectOption,
} from "./components/LibDynamicSelect";
import { useProcedureBuilder } from "./ProcedureBuilderContext";
// import { ProcedureSettingsState } from "./types"; // Unused
// import { fetchFilterData } from "../../utils/filterDataFetcher"; // REMOVED
import { fetchFilterData } from "../../../store/procedures/procedures.thunks";
import type { RootState } from "../../../store";

/**
 * ProcedureSettings.tsx
 * - Fixed: Automatically hydrates dropdown options if values exist (Edit Mode Fix)
 */

export default function ProcedureSettings() {
  const dispatch = useDispatch<any>();
  const { settings, setSettings } = useProcedureBuilder();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Gets cached filter data from Redux
  const filterData = useSelector((state: RootState) => state.procedures.filterData);
  const isLoading = !filterData;

  // Fetch all filter data on mount
  useEffect(() => {
    dispatch(fetchFilterData());
  }, [dispatch]);

  // Derive options from Redux state
  const categoryOptions = useMemo<LibSelectOption[]>(() =>
    (filterData?.categories || []).map(c => ({ id: c.id, label: c.name })),
    [filterData]);

  const assetOptions = useMemo<LibSelectOption[]>(() =>
    (filterData?.assets || []).map(a => ({ id: a.id, label: a.name })),
    [filterData]);

  const locationOptions = useMemo<LibSelectOption[]>(() =>
    (filterData?.locations || []).map(l => ({ id: l.id, label: l.name })),
    [filterData]);

  const teamOptions = useMemo<LibSelectOption[]>(() =>
    (filterData?.teams || []).map(t => ({ id: t.id, label: t.name })),
    [filterData]);

  // Removed manual loadOptions and useEffects for hydration as options are now always available from Redux

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((p) => ({
      ...p,
      visibility: e.target.value as "private" | "public",
    }));
  };

  // Styles (Unchanged)
  const pageStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    background: "#fff",
    padding: 40,
    minHeight: "100vh",
    boxSizing: "border-box",
  };
  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 960,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    padding: 24,
    boxSizing: "border-box",
  };
  const stackStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    maxWidth: 960,
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 8,
  };
  const sectionHint: React.CSSProperties = {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 18,
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 8,
  };
  const radioCardInner: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };
  const radioRow: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    padding: 12,
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    cursor: "pointer",
  };
  const radioTextBlock: React.CSSProperties = { marginLeft: 12 };
  const radioTitle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  };
  const radioDesc: React.CSSProperties = {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 1.4,
  };

  return (
    <div style={pageStyle}>
      <div style={stackStyle}>
        {/* Card 1 - Tag your procedure */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Tag your procedure</div>
          <div style={sectionHint}>
            Add tags to this procedure so you can easily find it on your Library
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>Categories</label>
              <LibDynamicSelect
                options={categoryOptions}
                value={settings.categories}
                onChange={(v) =>
                  setSettings((p) => ({ ...p, categories: v as string[] }))
                }
                fetchOptions={() => { }} // No-op
                loading={isLoading}
                placeholder="Start typing..."
                name="lib-categories"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={true}
                ctaText="Create category"
                onCtaClick={() => alert("Create category")}
              />
            </div>

            <div>
              <label style={labelStyle}>Assets</label>
              <LibDynamicSelect
                options={assetOptions}
                value={settings.assets}
                onChange={(v) =>
                  setSettings((p) => ({ ...p, assets: v as string[] }))
                }
                fetchOptions={() => { }} // No-op
                loading={isLoading}
                placeholder="Start typing..."
                name="lib-assets"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={true}
              />
            </div>

            <div>
              <label style={labelStyle}>Locations</label>
              <LibDynamicSelect
                options={locationOptions}
                value={settings.locations}
                onChange={(v) =>
                  setSettings((p) => ({ ...p, locations: v as string[] }))
                }
                fetchOptions={() => { }} // No-op
                loading={isLoading}
                placeholder="Start typing..."
                name="lib-locations"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={true}
              />
            </div>
          </div>
        </div>

        {/* Card 2 - Teams in Charge */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Teams in Charge</div>
          <div style={sectionHint}>
            Manage who is responsible for this procedure
          </div>

          <div>
            <label style={labelStyle}>Select team</label>
            <LibDynamicSelect
              options={teamOptions}
              value={settings.teamsInCharge}
              onChange={(v) =>
                setSettings((p) => ({ ...p, teamsInCharge: v as string[] }))
              }
              fetchOptions={() => { }} // No-op
              loading={isLoading}
              name="lib-teams"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              isMulti={true}
              ctaText="Create new team"
              onCtaClick={() => alert("Create new team")}
              placeholder="Start typing..."
            />
          </div>
        </div>

        {/* Card 3 - Procedure Visibility */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Procedure Visibility</div>

          <div style={radioCardInner}>
            <label style={radioRow}>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={settings.visibility === "private"}
                onChange={handleVisibilityChange}
                style={{ marginTop: 6 }}
              />
              <div style={radioTextBlock}>
                <div style={radioTitle}>Keep Private</div>
                <div style={radioDesc}>
                  This Procedure will only be visible to your teammates at
                  webuildtech.
                </div>
              </div>
            </label>

            <label style={radioRow}>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={settings.visibility === "public"}
                onChange={handleVisibilityChange}
                style={{ marginTop: 6 }}
              />
              <div style={radioTextBlock}>
                <div style={radioTitle}>Make Public</div>
                <div style={radioDesc}>
                  Publish this Procedure to the Procedure Hub for everyone in the
                  MaintainOS Community to see.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}