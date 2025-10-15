"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { fetchTeamsName } from "../../../store/teams/teams.thunks";
import { fetchVendorName } from "../../../store/vendors/vendors.thunks";
import { PartDynamicSelect, type PartSelectOption } from "./PartDynamicSelect";

export function PartVendorsSection({
  newItem,
  setNewItem,
}: {
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const [assetOptions, setAssetOptions] = useState<PartSelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<PartSelectOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<PartSelectOption[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const hasFetchedAssets = useRef(false);
  const hasFetchedTeams = useRef(false);
  const hasFetchedVendors = useRef(false);

  // -------------------- NORMALIZER --------------------
  const normalizeResponse = (res: any, label: string) => {
    console.log(`🧾 Raw ${label} response:`, res);
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.results)) return res.results;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.rows)) return res.rows;
    console.warn(`⚠️ Unexpected ${label} response`, res);
    return [];
  };

  // -------------------- FETCH HANDLERS --------------------
  const handleFetchAssets = useCallback(async () => {
    if (loadingAssets || hasFetchedAssets.current) return;
    setLoadingAssets(true);
    try {
      const res = await dispatch(fetchAssetsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const data = normalizeResponse(res, "Assets");
      setAssetOptions(
        data.map((a: any) => ({ id: String(a.id), name: a.name || "Unnamed Asset" }))
      );
      hasFetchedAssets.current = true;
    } catch (err) {
      console.error("❌ Failed to fetch assets:", err);
    } finally {
      setLoadingAssets(false);
    }
  }, [dispatch, loadingAssets]);

  const handleFetchTeams = useCallback(async () => {
    if (loadingTeams || hasFetchedTeams.current) return;
    setLoadingTeams(true);
    try {
      const res = await dispatch(fetchTeamsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const data = normalizeResponse(res, "Teams");
      setTeamOptions(
        data.map((t: any) => ({ id: String(t.id), name: t.name || "Unnamed Team" }))
      );
      hasFetchedTeams.current = true;
    } catch (err) {
      console.error("❌ Failed to fetch teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  }, [dispatch, loadingTeams]);

  const handleFetchVendors = useCallback(async () => {
    if (loadingVendors || hasFetchedVendors.current) return;
    setLoadingVendors(true);
    try {
      const res = await dispatch(fetchVendorName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const data = normalizeResponse(res, "Vendors");
      setVendorOptions(
        data.map((v: any) => ({ id: String(v.id), name: v.name || "Unnamed Vendor" }))
      );
      hasFetchedVendors.current = true;
    } catch (err) {
      console.error("❌ Failed to fetch vendors:", err);
    } finally {
      setLoadingVendors(false);
    }
  }, [dispatch, loadingVendors]);

  useEffect(() => {
    handleFetchAssets();
    handleFetchTeams();
    handleFetchVendors();
  }, [handleFetchAssets, handleFetchTeams, handleFetchVendors]);

  // -------------------- SELECT HANDLERS --------------------
  const handleAssetSelect = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    console.log("🟣 Assets selected:", ids);
    setNewItem((s) => ({ ...s, assetIds: ids }));
  };

  const handleTeamSelect = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    console.log("🟣 Teams selected:", ids);
    // ✅ FIXED KEY: match NewPartForm logic
    setNewItem((s) => ({ ...s, teamsInCharge: ids }));
  };

  const handleVendorSelect = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    console.log("🟣 Vendors selected:", ids);
    setNewItem((s) => ({ ...s, vendorIds: ids }));
  };

  // -------------------- RENDER --------------------
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "25px" }}>
      {/* ASSETS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
          Assets
        </label>
        <PartDynamicSelect
          options={assetOptions}
          value={newItem.assetIds ?? []}
          onSelect={handleAssetSelect}
          onFetch={handleFetchAssets}
          loading={loadingAssets}
          placeholder="Select Assets"
          name="assets"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Asset"
          onCtaClick={() => console.log("🟢 Open Add Asset Modal")}
          isMulti={true}
        />
      </div>

      {/* TEAMS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
          Teams in Charge
        </label>
        <PartDynamicSelect
          options={teamOptions}
          value={newItem.teamsInCharge ?? []} // ✅ match correct key
          onSelect={handleTeamSelect}
          onFetch={handleFetchTeams}
          loading={loadingTeams}
          placeholder="Select Teams"
          name="teams"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Team"
          onCtaClick={() => console.log("🟢 Open Add Team Modal")}
          isMulti={true}
        />
      </div>

      {/* VENDORS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
          Vendors
        </label>
        <PartDynamicSelect
          options={vendorOptions}
          value={newItem.vendorIds ?? []}
          onSelect={handleVendorSelect}
          onFetch={handleFetchVendors}
          loading={loadingVendors}
          placeholder="Select Vendors"
          name="vendors"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Vendor"
          onCtaClick={() => console.log("🟢 Open Add Vendor Modal")}
          isMulti={true}
        />
      </div>
    </section>
  );
}
