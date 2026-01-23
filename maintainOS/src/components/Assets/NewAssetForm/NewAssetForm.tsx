"use client";

import { useEffect, useState, useMemo } from "react";
import { Package } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { AssetNameInput } from "./fields/AssetNameInput";
import { PicturesUpload } from "./fields/PicturesUpload";
import { FilesUpload } from "./fields/FilesUpload";
import { DescriptionField } from "./fields/DescriptionField";
import { YearInput } from "./fields/YearInput";
import { SerialNumberInput } from "./fields/SerialNumberInput";
import { QrCodeInput } from "./fields/QrCodeInput";
import { FooterActions } from "./FooterActions";
import { DynamicSelect, type SelectOption } from "../../common/DynamicSelect";
import { useNavigate } from "react-router-dom";

// Import services
import {
  assetService,
  createAsset,
  fetchFilterData, // ✅ Import fetchFilterData
} from "../../../store/assets";

import type { AppDispatch, RootState } from "../../../store";

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

  // ✅ Access cached filter data from Redux
  const { filterData } = useSelector((state: RootState) => state.assets);

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

  // ✅ FETCH DATA ON MOUNT
  useEffect(() => {
    dispatch(fetchFilterData());
  }, [dispatch]);

  // ✅ PREPARE OPTIONS FROM REDUX
  const locationOptions = useMemo(() => filterData?.locations.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);
  const manufacturerOptions = useMemo(() => filterData?.manufacturers.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);
  const vendorOptions = useMemo(() => filterData?.vendors.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);
  const teamOptions = useMemo(() => filterData?.teams.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);
  const assetTypeOptions = useMemo(() => filterData?.assetTypes.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);
  const partOptions = useMemo(() => filterData?.parts.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);
  const parentAssetOptions = useMemo(() => filterData?.assets.map(i => ({ id: toId(i.id), name: i.name })) || [], [filterData]);


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

      if (assetData.location) setLocationId(toId(assetData.location.id));
      if (assetData.manufacturer) setManufacturerId(toId(assetData.manufacturer.id));
      if (assetData.vendor) setVendorId(toId(assetData.vendor.id));
      if (assetData.parentAsset) setParentAssetId(toId(assetData.parentAsset.id));

      // Arrays
      if (Array.isArray(assetData.teamsInCharge)) {
        setTeamIds(assetData.teamsInCharge.map((t: any) => toId(t.id)));
      }
      if (Array.isArray(assetData.parts)) {
        setPartIds(assetData.parts.map((p: any) => toId(p.id)));
      }
      if (Array.isArray(assetData.assetTypes)) {
        setAssetTypeIds(assetData.assetTypes.map((t: any) => toId(t.id)));
      } else if (assetData.assetTypeIds) {
        setAssetTypeIds(assetData.assetTypeIds.map(toId));
      }
    }
  }, [isEdit, assetData]);

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
      // fetchAssetsData();
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Location"
            onCtaClick={() => navigate("/locations")}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Manufacturer"
            onCtaClick={() => toast("Create Manufacturer Logic")}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Team"
            onCtaClick={() => navigate("/teams/create")}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Vendor"
            onCtaClick={() => navigate("/vendor")}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            ctaText="+ Create Part"
            onCtaClick={() => navigate("/inventory")}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            // ✅ No onFetch needed
            onFetch={() => { }}
            loading={false}
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