"use client";

import React, { useState, useCallback, useEffect } from "react"; // ✅ Added useEffect
import LibDynamicSelect, {
  type LibSelectOption,
} from "./components/LibDynamicSelect";
import { useProcedureBuilder } from "./ProcedureBuilderContext"; 
import { ProcedureSettingsState } from "./types"; 
import { fetchFilterData } from "../../utils/filterDataFetcher";

/**
 * ProcedureSettings.tsx
 * - Fixed: Automatically hydrates dropdown options if values exist (Edit Mode Fix)
 */

export default function ProcedureSettings() {
  const { settings, setSettings } = useProcedureBuilder(); 
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<LibSelectOption[]>([]);
  const [assetOptions, setAssetOptions] = useState<LibSelectOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<LibSelectOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<LibSelectOption[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  
  // --- Data Fetcher ---
  const loadOptions = useCallback(async (filterType: string) => {
    const key = filterType.toLowerCase();
    
    if (key === 'categories') setLoadingCategories(true);
    if (key === 'assets') setLoadingAssets(true);
    if (key === 'locations') setLoadingLocations(true);
    if (key === 'team members') setLoadingTeams(true);

    try {
      const result = await fetchFilterData(key);
      
      // Map to { id, label }
      const options = Array.isArray(result.data) 
        ? result.data.map((item: any) => ({
            id: item.id,
            label: item.name || item.title || item.fullName || "Unknown",
          }))
        : [];

      if (key === 'categories') setCategoryOptions(options);
      if (key === 'assets') setAssetOptions(options);
      if (key === 'locations') setLocationOptions(options);
      if (key === 'team members') setTeamOptions(options);

    } catch (error) {
      console.error(`Failed to load ${filterType}:`, error);
    } finally {
      if (key === 'categories') setLoadingCategories(false);
      if (key === 'assets') setLoadingAssets(false);
      if (key === 'locations') setLoadingLocations(false);
      if (key === 'team members') setLoadingTeams(false);
    }
  }, []); 

  // =========================================================
  // ✅ HYDRATION FIX: Auto-fetch options if values exist
  // =========================================================

  // 1. Categories
  useEffect(() => {
    if (settings.categories.length > 0 && categoryOptions.length === 0 && !loadingCategories) {
      loadOptions('categories');
    }
  }, [settings.categories, categoryOptions.length, loadingCategories, loadOptions]);

  // 2. Assets
  useEffect(() => {
    if (settings.assets.length > 0 && assetOptions.length === 0 && !loadingAssets) {
      loadOptions('assets');
    }
  }, [settings.assets, assetOptions.length, loadingAssets, loadOptions]);

  // 3. Locations
  useEffect(() => {
    if (settings.locations.length > 0 && locationOptions.length === 0 && !loadingLocations) {
      loadOptions('locations');
    }
  }, [settings.locations, locationOptions.length, loadingLocations, loadOptions]);

  // 4. Teams
  useEffect(() => {
    if (settings.teamsInCharge.length > 0 && teamOptions.length === 0 && !loadingTeams) {
      loadOptions('team members');
    }
  }, [settings.teamsInCharge, teamOptions.length, loadingTeams, loadOptions]);

  // =========================================================

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
                fetchOptions={() => loadOptions('categories')}
                loading={loadingCategories}
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
                fetchOptions={() => loadOptions('assets')}
                loading={loadingAssets}
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
                fetchOptions={() => loadOptions('locations')}
                loading={loadingLocations}
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
              fetchOptions={() => loadOptions('team members')}
              loading={loadingTeams}
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