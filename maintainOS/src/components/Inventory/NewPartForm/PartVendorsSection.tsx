"use client";

import React, { useCallback, useEffect, useState } from "react";
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

  // -------------------- FETCH HANDLERS --------------------
  const handleFetchAssets = useCallback(async () => {
    if (loadingAssets || assetOptions.length > 0) return;
    setLoadingAssets(true);
    try {
      const res = await dispatch(fetchAssetsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const options = res.data.map((a: any) => ({ id: a.id, name: a.name }));
      setAssetOptions(options);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoadingAssets(false);
    }
  }, [dispatch, loadingAssets, assetOptions.length]);

  const handleFetchTeams = useCallback(async () => {
    if (loadingTeams || teamOptions.length > 0) return;
    setLoadingTeams(true);
    try {
      const res = await dispatch(fetchTeamsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const options = res.data.map((t: any) => ({ id: t.id, name: t.name }));
      setTeamOptions(options);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  }, [dispatch, loadingTeams, teamOptions.length]);

  const handleFetchVendors = useCallback(async () => {
    if (loadingVendors || vendorOptions.length > 0) return;
    setLoadingVendors(true);
    try {
      const res = await dispatch(fetchVendorName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const options = res.data.map((v: any) => ({ id: v.id, name: v.name }));
      setVendorOptions(options);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    } finally {
      setLoadingVendors(false);
    }
  }, [dispatch, loadingVendors, vendorOptions.length]);

  // -------------------- AUTO-FETCH FOR PRESELECTED VALUES --------------------
  useEffect(() => {
    if (newItem.assetId) handleFetchAssets();
    if (newItem.teamId) handleFetchTeams();
    if (newItem.vendorId) handleFetchVendors();
  }, [newItem.assetId, newItem.teamId, newItem.vendorId, handleFetchAssets, handleFetchTeams, handleFetchVendors]);

  // -------------------- SELECT HANDLERS --------------------
  const handleAssetSelect = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setNewItem((s) => ({ ...s, assetId: id }));
  };

  const handleTeamSelect = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setNewItem((s) => ({ ...s, teamId: id }));
  };

  const handleVendorSelect = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setNewItem((s) => ({ ...s, vendorId: id }));
  };

  // -------------------- RENDER --------------------
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "25px" }}>
      {/* ASSETS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>Assets</label>
        <PartDynamicSelect
          options={assetOptions}
          value={newItem.assetId ?? ""}
          onSelect={handleAssetSelect}
          onFetch={handleFetchAssets}
          loading={loadingAssets}
          placeholder="Select Asset"
          name="assets"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Asset"
          onCtaClick={() => console.log("Open Add Asset Modal")}
        />
      </div>

      {/* TEAMS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>Teams in Charge</label>
        <PartDynamicSelect
          options={teamOptions}
          value={newItem.teamId ?? ""}
          onSelect={handleTeamSelect}
          onFetch={handleFetchTeams}
          loading={loadingTeams}
          placeholder="Select Team"
          name="teams"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Team"
          onCtaClick={() => console.log("Open Add Team Modal")}
        />
      </div>

      {/* VENDORS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>Vendors</label>
        <PartDynamicSelect
          options={vendorOptions}
          value={newItem.vendorId ?? ""}
          onSelect={handleVendorSelect}
          onFetch={handleFetchVendors}
          loading={loadingVendors}
          placeholder="Select Vendor"
          name="vendors"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Vendor"
          onCtaClick={() => console.log("Open Add Vendor Modal")}
        />
      </div>
    </section>
  );
}
