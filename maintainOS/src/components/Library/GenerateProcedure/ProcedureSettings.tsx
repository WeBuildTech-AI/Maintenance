"use client";

import React, { useState } from "react";
import LibDynamicSelect, {
  type LibSelectOption,
} from "./components/LibDynamicSelect";
import { useProcedureBuilder } from "./ProcedureBuilderContext"; // <-- 1. CONTEXT KO IMPORT KAREIN
import { ProcedureSettingsState } from "./types"; // <-- 2. TYPE KO IMPORT KAREIN (Best practice)

/**
 * ProcedureSettings.tsx
 * - Inline CSS only
 * - Each main section is in its own card
 * - (FIXED) Now fully controlled by ProcedureBuilderContext
 */

export default function ProcedureSettings() {
  // --- 3. LOCAL STATE (settings, categoryValue, etc.) HATA DIYA GAYA HAI ---
  const { settings, setSettings } = useProcedureBuilder(); // <-- 4. CONTEXT SE STATE LEIN
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Mock data (Yeh aisi hi rahegi)
  const categories: LibSelectOption[] = [
    { id: "c1", label: "Electrical" },
    { id: "c2", label: "Mechanical" },
    { id: "c3", label: "HVAC" },
  ];
  const assets: LibSelectOption[] = [
    { id: "a1", label: "Generator A" },
    { id: "a2", label: "Pump #2" },
  ];
  const locations: LibSelectOption[] = [
    { id: "l1", label: "Building 1" },
    { id: "l2", label: "Roof" },
  ];
  const teams: LibSelectOption[] = [
    { id: "t1", label: "Maintenance" },
    { id: "t2", label: "Operations" },
    { id: "t3", label: "Facilities" },
  ];

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // <-- 5. AB YEH DIRECT CONTEXT KO UPDATE KAREGA ---
    setSettings((p) => ({
      ...p,
      visibility: e.target.value as "private" | "public",
    }));
  };

  // --- Baaki saare styles (pageStyle, cardStyle, etc.) same rahenge ---
  // Page layout styles
  const pageStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    background: "#F8FAFC",
    padding: 40,
    minHeight: "100vh",
    boxSizing: "border-box",
  };

  // Shared card style
  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 960,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    padding: 24,
    boxSizing: "border-box",
  };

  // Spacing between stacked cards
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
                options={categories}
                value={settings.categories} // <-- 6. CONTEXT SE VALUE READ KAREIN
                onChange={(v) =>
                  setSettings((p) => ({ ...p, categories: v as string[] }))
                } // <-- 7. CONTEXT MEIN VALUE SET KAREIN
                fetchOptions={() => {}}
                loading={false}
                placeholder="Start typing..."
                name="lib-categories"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={true} // <-- 8. YEH MULTI HONA CHAHIYE (aapke type ke hisaab se)
                ctaText="Create category"
                onCtaClick={() => alert("Create category")}
              />
            </div>

            <div>
              <label style={labelStyle}>Assets</label>
              <LibDynamicSelect
                options={assets}
                value={settings.assets} // <-- 6. CONTEXT SE VALUE READ KAREIN
                onChange={(v) =>
                  setSettings((p) => ({ ...p, assets: v as string[] }))
                } // <-- 7. CONTEXT MEIN VALUE SET KAREIN
                fetchOptions={() => {}}
                loading={false}
                placeholder="Start typing..."
                name="lib-assets"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={true} // <-- 8. YEH MULTI HONA CHAHIYE
              />
            </div>

            <div>
              <label style={labelStyle}>Locations</label>
              <LibDynamicSelect
                options={locations}
                value={settings.locations} // <-- 6. CONTEXT SE VALUE READ KAREIN
                onChange={(v) =>
                  setSettings((p) => ({ ...p, locations: v as string[] }))
                } // <-- 7. CONTEXT MEIN VALUE SET KAREIN
                fetchOptions={() => {}}
                loading={false}
                placeholder="Start typing..."
                name="lib-locations"
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                isMulti={true} // <-- 8. YEH MULTI HONA CHAHIYE
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
              options={teams}
              value={settings.teamsInCharge} // <-- 6. CONTEXT SE VALUE READ KAREIN
              onChange={(v) =>
                setSettings((p) => ({ ...p, teamsInCharge: v as string[] }))
              } // <-- 7. CONTEXT MEIN VALUE SET KAREIN
              fetchOptions={() => {}}
              loading={false}
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
                checked={settings.visibility === "private"} // <-- 6. CONTEXT SE VALUE READ KAREIN
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
                checked={settings.visibility === "public"} // <-- 6. CONTEXT SE VALUE READ KAREIN
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