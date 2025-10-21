"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../../store";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { fetchTeamsName } from "../../../store/teams/teams.thunks";
import { fetchVendorName } from "../../../store/vendors/vendors.thunks";
import { PartDynamicSelect, type PartSelectOption } from "./PartDynamicSelect";

function PartVendorsSection({
  newItem,
  setNewItem,
}: {
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // ---------- States ----------
  const [assetOptions, setAssetOptions] = useState<PartSelectOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<PartSelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<PartSelectOption[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 🆕 Local labels (instant prefill)
  const [selectedAssetNames, setSelectedAssetNames] = useState<string[]>([]);
  const [selectedTeamNames, setSelectedTeamNames] = useState<string[]>([]);
  const [selectedVendorNames, setSelectedVendorNames] = useState<string[]>([]);

  const hasFetchedAssets = useRef(false);
  const hasFetchedTeams = useRef(false);
  const hasFetchedVendors = useRef(false);

  // 🧩 normalize response
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

  // ---------------- Fetchers ----------------
  const fetchAssets = useCallback(async () => {
    if (loadingAssets || hasFetchedAssets.current) return;
    setLoadingAssets(true);
    try {
      const res = await dispatch(fetchAssetsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const data = normalizeResponse(res, "Assets");
      const options = data.map((a: any, i: number) => ({
        id: String(a.id ?? i),
        name: a.name ?? a.asset_name ?? `Asset ${i + 1}`,
      }));
      setAssetOptions(options);
      hasFetchedAssets.current = true;

      if (newItem.assetIds?.length) {
        const matched = newItem.assetIds
          .map((id: string) => options.find((opt) => opt.id === id)?.name)
          .filter(Boolean);
        setSelectedAssetNames(matched as string[]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch assets:", err);
    } finally {
      setLoadingAssets(false);
    }
  }, [dispatch, loadingAssets, newItem.assetIds]);

  const fetchTeams = useCallback(async () => {
    if (loadingTeams || hasFetchedTeams.current) return;
    setLoadingTeams(true);
    try {
      const res = await dispatch(fetchTeamsName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const data = normalizeResponse(res, "Teams");
      const options = data.map((t: any, i: number) => ({
        id: String(t.id ?? i),
        name: t.name ?? t.team_name ?? `Team ${i + 1}`,
      }));
      setTeamOptions(options);
      hasFetchedTeams.current = true;

      if (newItem.teamsInCharge?.length) {
        const matched = newItem.teamsInCharge
          .map((id: string) => options.find((opt) => opt.id === id)?.name)
          .filter(Boolean);
        setSelectedTeamNames(matched as string[]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  }, [dispatch, loadingTeams, newItem.teamsInCharge]);

  const fetchVendors = useCallback(async () => {
    if (loadingVendors || hasFetchedVendors.current) return;
    setLoadingVendors(true);
    try {
      const res = await dispatch(fetchVendorName({ limit: 1000, page: 1, offset: 0 })).unwrap();
      const data = normalizeResponse(res, "Vendors");
      const options = data.map((v: any, i: number) => ({
        id: String(v.id ?? i),
        name: v.name ?? v.vendor_name ?? `Vendor ${i + 1}`,
      }));
      setVendorOptions(options);
      hasFetchedVendors.current = true;

      if (newItem.vendorIds?.length) {
        const matched = newItem.vendorIds
          .map((id: string) => options.find((opt) => opt.id === id)?.name)
          .filter(Boolean);
        setSelectedVendorNames(matched as string[]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch vendors:", err);
    } finally {
      setLoadingVendors(false);
    }
  }, [dispatch, loadingVendors, newItem.vendorIds]);

  useEffect(() => {
    fetchAssets();
    fetchTeams();
    fetchVendors();
  }, [fetchAssets, fetchTeams, fetchVendors]);

  // ✅ Pre-fill from edit data (before API load)
  useEffect(() => {
    if (newItem.assets?.length && !selectedAssetNames.length) {
      setSelectedAssetNames(newItem.assets.map((a: any) => a.name || a.asset_name || ""));
    }
    if (newItem.teams?.length && !selectedTeamNames.length) {
      setSelectedTeamNames(newItem.teams.map((t: any) => t.name || t.team_name || ""));
    }
    if (newItem.vendors?.length && !selectedVendorNames.length) {
      setSelectedVendorNames(newItem.vendors.map((v: any) => v.name || v.vendor_name || ""));
    }
  }, [newItem, selectedAssetNames, selectedTeamNames, selectedVendorNames]);

  // ---------------- Selection handlers ----------------
  const handleAssetSelect = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    setNewItem((s) => ({ ...s, assetIds: ids }));
    const names = ids
      .map((id) => assetOptions.find((o) => o.id === id)?.name)
      .filter(Boolean);
    setSelectedAssetNames(names as string[]);
  };

  const handleTeamSelect = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    setNewItem((s) => ({ ...s, teamsInCharge: ids }));
    const names = ids
      .map((id) => teamOptions.find((o) => o.id === id)?.name)
      .filter(Boolean);
    setSelectedTeamNames(names as string[]);
  };

  const handleVendorSelect = (vals: string[] | string) => {
    const ids = Array.isArray(vals) ? vals : [vals];
    setNewItem((s) => ({ ...s, vendorIds: ids }));
    const names = ids
      .map((id) => vendorOptions.find((o) => o.id === id)?.name)
      .filter(Boolean);
    setSelectedVendorNames(names as string[]);
  };

  // ✅ Ensure dropdown always shows selected values (merged options)
  const mergedAssets = React.useMemo(() => {
    if (!newItem.assetIds?.length) return assetOptions;
    const selected = newItem.assetIds.map((id: string, i: number) => ({
      id,
      name:
        selectedAssetNames[i] ||
        assetOptions.find((o) => o.id === id)?.name ||
        "Selected (Pending)",
    }));
    return [
      ...selected.filter((s) => !assetOptions.some((o) => o.id === s.id)),
      ...assetOptions,
    ];
  }, [assetOptions, newItem.assetIds, selectedAssetNames]);

  const mergedTeams = React.useMemo(() => {
    if (!newItem.teamsInCharge?.length) return teamOptions;
    const selected = newItem.teamsInCharge.map((id: string, i: number) => ({
      id,
      name:
        selectedTeamNames[i] ||
        teamOptions.find((o) => o.id === id)?.name ||
        "Selected (Pending)",
    }));
    return [
      ...selected.filter((s) => !teamOptions.some((o) => o.id === s.id)),
      ...teamOptions,
    ];
  }, [teamOptions, newItem.teamsInCharge, selectedTeamNames]);

  const mergedVendors = React.useMemo(() => {
    if (!newItem.vendorIds?.length) return vendorOptions;
    const selected = newItem.vendorIds.map((id: string, i: number) => ({
      id,
      name:
        selectedVendorNames[i] ||
        vendorOptions.find((o) => o.id === id)?.name ||
        "Selected (Pending)",
    }));
    return [
      ...selected.filter((s) => !vendorOptions.some((o) => o.id === s.id)),
      ...vendorOptions,
    ];
  }, [vendorOptions, newItem.vendorIds, selectedVendorNames]);

  // ---------------- CTA Handlers ----------------
  const handleAddNewAsset = () => navigate("/assets/create");
  const handleAddNewTeam = () => navigate("/teams/create");
  const handleAddNewVendor = () => navigate("/vendors/create");

  // ---------------- Render ----------------
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginTop: "25px",
      }}
    >
      {/* Assets */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
          Assets
        </label>
        <PartDynamicSelect
          options={mergedAssets}
          value={newItem.assetIds ?? []}
          onSelect={handleAssetSelect}
          onFetch={fetchAssets}
          loading={loadingAssets}
          placeholder={
            selectedAssetNames.length
              ? selectedAssetNames.join(", ")
              : "Select Assets"
          }
          name="assets"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Asset"
          onCtaClick={handleAddNewAsset}
          isMulti={true}
        />
      </div>

      {/* Teams */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
          Teams in Charge
        </label>
        <PartDynamicSelect
          options={mergedTeams}
          value={newItem.teamsInCharge ?? []}
          onSelect={handleTeamSelect}
          onFetch={fetchTeams}
          loading={loadingTeams}
          placeholder={
            selectedTeamNames.length
              ? selectedTeamNames.join(", ")
              : "Select Teams"
          }
          name="teams"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Team"
          onCtaClick={handleAddNewTeam}
          isMulti={true}
        />
      </div>

      {/* Vendors */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
          Vendors
        </label>
        <PartDynamicSelect
          options={mergedVendors}
          value={newItem.vendorIds ?? []}
          onSelect={handleVendorSelect}
          onFetch={fetchVendors}
          loading={loadingVendors}
          placeholder={
            selectedVendorNames.length
              ? selectedVendorNames.join(", ")
              : "Select Vendors"
          }
          name="vendors"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          ctaText="+ Add New Vendor"
          onCtaClick={handleAddNewVendor}
          isMulti={true}
        />
      </div>
    </section>
  );
}

export default PartVendorsSection;
