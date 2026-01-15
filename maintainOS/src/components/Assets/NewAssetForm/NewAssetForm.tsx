"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { AssetNameInput } from "./fields/AssetNameInput";
import { PicturesUpload } from "./fields/PicturesUpload";
import { FilesUpload } from "./fields/FilesUpload";
import { DescriptionField } from "./fields/DescriptionField";
import { YearInput } from "./fields/YearInput";
import { SerialNumberInput } from "./fields/SerialNumberInput";
import { QrCodeInput } from "./fields/QrCodeInput";
import { FooterActions } from "./FooterActions";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import { useNavigate } from "react-router-dom";

// Import services
import {
  assetService,
  createAsset,
  type CreateAssetData,
} from "../../../store/assets";
import { locationService } from "../../../store/locations";
import { teamService } from "../../../store/teams";
import { vendorService } from "../../../store/vendors";
import { partService } from "../../../store/parts";

import type { AppDispatch } from "../../../store";

interface NewAssetFormProps {
  onCancel: () => void;
  onCreate: (asset: any) => void;
  isEdit?: boolean;
  assetData?: any;
  fetchAssetsData: () => void;
}

export function NewAssetForm({
  onCancel,
  onCreate,
  isEdit = false,
  assetData,
  fetchAssetsData,
}: NewAssetFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // --- Form State ---
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<number | string>("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [qrCode, setQrCode] = useState("");

  // --- Dynamic Select States (IDs as strings) ---
  const [criticality, setCriticality] = useState("");
  const [locationId, setLocationId] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [parentAssetId, setParentAssetId] = useState("");

  // Multi-select IDs
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [assetTypeIds, setAssetTypeIds] = useState<string[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);

  const [status, setStatus] = useState("online");

  // --- Dropdown Options State ---
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<SelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  const [assetTypeOptions, setAssetTypeOptions] = useState<SelectOption[]>([]);
  const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  const [parentAssetOptions, setParentAssetOptions] = useState<SelectOption[]>([]);

  // --- Loading States ---
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingAssetTypes, setLoadingAssetTypes] = useState(false);
  const [loadingParts, setLoadingParts] = useState(false);
  const [loadingParentAssets, setLoadingParentAssets] = useState(false);

  // --- Active Dropdown Control ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const criticalityOptions: SelectOption[] = [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
  ];

  // Helper to ensure ID is a string
  const toId = (val: any) => (val ? String(val) : "");

  // Helper to compare arrays (Order insensitive)
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  // --- Initialization (Edit Mode) ---
  useEffect(() => {
    if (isEdit && assetData) {
      setAssetName(assetData.name || "");
      setDescription(assetData.description || "");
      setYear(assetData.year || "");
      setModel(assetData.model || "");
      setSerialNumber(assetData.serialNumber || "");
      setQrCode(assetData.qrCode || "");
      setCriticality(assetData.criticality ? assetData.criticality.toLowerCase() : "");
      
      if (assetData.status) setStatus(assetData.status);

      if (assetData.location) {
        setLocationId(toId(assetData.location.id));
        setLocationOptions([{ id: toId(assetData.location.id), name: assetData.location.name }]);
      }
      if (assetData.manufacturer) {
        setManufacturerId(toId(assetData.manufacturer.id));
        setManufacturerOptions([{ id: toId(assetData.manufacturer.id), name: assetData.manufacturer.name }]);
      }
      if (assetData.vendor) {
        setVendorId(toId(assetData.vendor.id));
        setVendorOptions([{ id: toId(assetData.vendor.id), name: assetData.vendor.name }]);
      }
      if (assetData.parentAsset) {
        setParentAssetId(toId(assetData.parentAsset.id));
        setParentAssetOptions([{ id: toId(assetData.parentAsset.id), name: assetData.parentAsset.name }]);
      }

      // Arrays
      if (Array.isArray(assetData.teamsInCharge)) {
        setTeamIds(assetData.teamsInCharge.map((t: any) => toId(t.id)));
        setTeamOptions(assetData.teamsInCharge.map((t: any) => ({ id: toId(t.id), name: t.name })));
      }
      if (Array.isArray(assetData.parts)) {
        setPartIds(assetData.parts.map((p: any) => toId(p.id)));
        setPartOptions(assetData.parts.map((p: any) => ({ id: toId(p.id), name: p.name })));
      }
      if (Array.isArray(assetData.assetTypes)) {
         setAssetTypeIds(assetData.assetTypes.map((t: any) => toId(t.id)));
         setAssetTypeOptions(assetData.assetTypes.map((t: any) => ({ id: toId(t.id), name: t.name })));
      } else if (assetData.assetTypeIds) {
         setAssetTypeIds(assetData.assetTypeIds.map(toId));
      }
    }
  }, [isEdit, assetData]);

  // --- Fetch Handlers ---
  const handleFetchLocations = async () => {
    if (loadingLocations) return;
    setLoadingLocations(true);
    try {
      const res = await locationService.fetchLocationsName();
      setLocationOptions((res || []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingLocations(false); }
  };

  const handleFetchManufacturers = async () => {
    if (loadingManufacturers) return;
    setLoadingManufacturers(true);
    try {
      const res = await assetService.fetchAssetManufacturer();
      setManufacturerOptions((res || []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingManufacturers(false); }
  };

  const handleFetchVendors = async () => {
    if (loadingVendors) return;
    setLoadingVendors(true);
    try {
      const res = await vendorService.fetchVendorName();
      setVendorOptions((res || []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingVendors(false); }
  };

  const handleFetchTeams = async () => {
    if (loadingTeams) return;
    setLoadingTeams(true);
    try {
      const res = await teamService.fetchTeamsName();
      setTeamOptions((Array.isArray(res) ? res : []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingTeams(false); }
  };

  const handleFetchAssetTypes = async () => {
    if (loadingAssetTypes) return;
    setLoadingAssetTypes(true);
    try {
      const res = await assetService.fetchAssetType();
      setAssetTypeOptions((res || []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingAssetTypes(false); }
  };

  const handleFetchParts = async () => {
    if (loadingParts) return;
    setLoadingParts(true);
    try {
      const res = await partService.fetchPartsName();
      setPartOptions((res || []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingParts(false); }
  };

  const handleFetchParentAssets = async () => {
    if (loadingParentAssets) return;
    setLoadingParentAssets(true);
    try {
      const res = await assetService.fetchAssetsName();
      setParentAssetOptions((res || []).map((i: any) => ({ id: toId(i.id), name: i.name })));
    } catch (err) { console.error(err); } finally { setLoadingParentAssets(false); }
  };

  // ✅ CRITICAL HELPER: Converts empty string "" to null so backend clears the field
  const getNullableUUID = (val: string) => (val && val.trim() !== "" ? val : null);

  const handleCreate = async () => {
    if (!assetName) {
      toast.error("Asset Name is required");
      return;
    }

    let payload: any = {};

    if (isEdit && assetData) {
      // ------------------------------------------------
      // ✅ EDIT MODE: Compare and Send NULL if cleared
      // ------------------------------------------------
      
      if (assetName !== assetData.name) payload.name = assetName;
      if (description !== (assetData.description || "")) payload.description = description;
      if (Number(year) !== (assetData.year || 0)) payload.year = Number(year);
      if (model !== (assetData.model || "")) payload.model = model;
      if (serialNumber !== (assetData.serialNumber || "")) payload.serialNumber = serialNumber;
      if (qrCode !== (assetData.qrCode || "")) payload.qrCode = qrCode;
      
      const currentCrit = criticality ? criticality.toLowerCase() : "";
      const oldCrit = assetData.criticality ? assetData.criticality.toLowerCase() : "";
      if (currentCrit !== oldCrit) payload.criticality = criticality;

      // Status removed from Edit payload to prevent overwrites

      // ✅ FIX: Check if ID changed. If new ID is "" (empty), send null.
      const oldLocId = assetData.location?.id ? String(assetData.location.id) : "";
      if (locationId !== oldLocId) payload.locationId = getNullableUUID(locationId);

      const oldMfgId = assetData.manufacturer?.id ? String(assetData.manufacturer.id) : "";
      if (manufacturerId !== oldMfgId) payload.manufacturerId = getNullableUUID(manufacturerId);

      const oldVendorId = assetData.vendor?.id ? String(assetData.vendor.id) : "";
      if (vendorId !== oldVendorId) payload.vendorId = getNullableUUID(vendorId);

      const oldParentId = assetData.parentAsset?.id ? String(assetData.parentAsset.id) : "";
      if (parentAssetId !== oldParentId) payload.parentAssetId = getNullableUUID(parentAssetId);

      // Arrays: Always send current list (filtered for empty strings)
      const oldTeamIds = (assetData.teamsInCharge || []).map((t: any) => String(t.id));
      if (!arraysEqual(teamIds, oldTeamIds)) {
         payload.teamsInCharge = teamIds.filter((id) => id && id.trim() !== "");
      }

      const oldPartIds = (assetData.parts || []).map((p: any) => String(p.id));
      if (!arraysEqual(partIds, oldPartIds)) {
         payload.partIds = partIds.filter((id) => id && id.trim() !== "");
      }

      const oldTypeIds = (assetData.assetTypes || []).map((t: any) => String(t.id));
      if (!arraysEqual(assetTypeIds, oldTypeIds)) {
         payload.assetTypeIds = assetTypeIds.filter((id) => id && id.trim() !== "");
      }

      if (Object.keys(payload).length === 0) {
        toast("No changes detected");
        return;
      }

    } else {
      // ------------------------------------------------
      // ✅ CREATE MODE: Only send fields that have values (No Nulls)
      // ------------------------------------------------
      payload.name = assetName;
      payload.status = status; 

      if (description) payload.description = description;
      if (year) payload.year = Number(year);
      if (model) payload.model = model;
      if (serialNumber) payload.serialNumber = serialNumber;
      if (qrCode) payload.qrCode = qrCode;
      if (criticality) payload.criticality = criticality;

      // Only add IDs if they exist (This prevents sending "" or null for creation)
      if (locationId) payload.locationId = locationId;
      if (manufacturerId) payload.manufacturerId = manufacturerId;
      if (vendorId) payload.vendorId = vendorId;
      if (parentAssetId) payload.parentAssetId = parentAssetId;

      // Arrays
      const validTeamIds = teamIds.filter((id) => id && id.trim() !== "");
      if (validTeamIds.length > 0) payload.teamsInCharge = validTeamIds;

      const validPartIds = partIds.filter((id) => id && id.trim() !== "");
      if (validPartIds.length > 0) payload.partIds = validPartIds;

      const validAssetTypeIds = assetTypeIds.filter((id) => id && id.trim() !== "");
      if (validAssetTypeIds.length > 0) payload.assetTypeIds = validAssetTypeIds;
    }

    try {
      if (isEdit && assetData?.id) {
        const updated = await assetService.updateAsset(assetData.id, payload);
        toast.success("Asset updated successfully");
        onCreate(updated);
      } else {
        const created = await dispatch(createAsset(payload)).unwrap();
        toast.success("Asset created successfully");
        onCreate(created);
      }
      fetchAssetsData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save asset");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border">
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Asset" : "New Asset"}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
            <Package className="h-5 w-5" />
          </div>
          <AssetNameInput
            assetName={assetName}
            setAssetName={setAssetName}
          />
        </div>

        <PicturesUpload />
        <FilesUpload />

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Locations</h3>
          <DynamicSelect
            name="location"
            placeholder="Select Location"
            value={locationId}
            onSelect={(val) => setLocationId(val as string)}
            options={locationOptions}
            onFetch={handleFetchLocations}
            loading={loadingLocations}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Location"
            onCtaClick={() => navigate("/locations")}
          />
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Criticality</h3>
          <DynamicSelect
            name="criticality"
            placeholder="Select Criticality"
            value={criticality}
            onSelect={(val) => setCriticality(val as string)}
            options={criticalityOptions}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        <DescriptionField description={description} setDescription={setDescription} />
        <YearInput year={year} setYear={setYear} />

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Manufacturer</h3>
          <DynamicSelect
            name="manufacturer"
            placeholder="Select Manufacturer"
            value={manufacturerId}
            onSelect={(val) => setManufacturerId(val as string)}
            options={manufacturerOptions}
            onFetch={handleFetchManufacturers}
            loading={loadingManufacturers}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Manufacturer"
            onCtaClick={() => toast("Create Manufacturer Logic")}
          />
        </div>

        <SerialNumberInput serialNumber={serialNumber} setSerialNumber={setSerialNumber} />

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Teams</h3>
          <DynamicSelect
            name="teams"
            placeholder="Select Teams"
            value={teamIds}
            onSelect={(val) => setTeamIds(val as string[])}
            options={teamOptions}
            onFetch={handleFetchTeams}
            loading={loadingTeams}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Team"
            onCtaClick={() => navigate("/teams/create")}
          />
        </div>

        <QrCodeInput qrCode={qrCode} setQrCode={setQrCode} />

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Asset Types</h3>
          <DynamicSelect
            name="assetTypes"
            placeholder="Select Asset Types"
            value={assetTypeIds}
            onSelect={(val) => setAssetTypeIds(val as string[])}
            options={assetTypeOptions}
            onFetch={handleFetchAssetTypes}
            loading={loadingAssetTypes}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Vendor</h3>
          <DynamicSelect
            name="vendor"
            placeholder="Select Vendor"
            value={vendorId}
            onSelect={(val) => setVendorId(val as string)}
            options={vendorOptions}
            onFetch={handleFetchVendors}
            loading={loadingVendors}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Vendor"
            onCtaClick={() => navigate("/vendor")}
          />
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Parts</h3>
          <DynamicSelect
            name="parts"
            placeholder="Select Parts"
            value={partIds}
            onSelect={(val) => setPartIds(val as string[])}
            options={partOptions}
            onFetch={handleFetchParts}
            loading={loadingParts}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Part"
            onCtaClick={() => navigate("/inventory")}
          />
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-base font-medium text-gray-900">Parent Asset</h3>
          <DynamicSelect
            name="parentAsset"
            placeholder="Select Parent Asset"
            value={parentAssetId}
            onSelect={(val) => setParentAssetId(val as string)}
            options={parentAssetOptions}
            onFetch={handleFetchParentAssets}
            loading={loadingParentAssets}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>
      </div>

      <FooterActions
        onCreate={handleCreate}
        onCancel={onCancel}
        isEdit={isEdit}
      />
    </div>
  );
}