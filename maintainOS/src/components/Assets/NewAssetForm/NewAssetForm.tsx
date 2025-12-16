"use client";

import { useEffect, useRef, useState } from "react";
import { Package } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { AssetNameInput } from "./fields/AssetNameInput";
import { PicturesUpload } from "./fields/PicturesUpload";
import { FilesUpload } from "./fields/FilesUpload";
import { LocationDropdown } from "./dropdowns/LocationDropdown";
import { CriticalityDropdown } from "./dropdowns/CriticalityDropdown";
import { DescriptionField } from "./fields/DescriptionField";
import { YearInput } from "./fields/YearInput";
import { ManufacturerDropdown } from "./dropdowns/ManufacturerDropdown";
import { ModelField } from "./dropdowns/ModelField";
import { SerialNumberInput } from "./fields/SerialNumberInput";
import { TeamsDropdown } from "./dropdowns/TeamsDropdown";
import { QrCodeInput } from "./fields/QrCodeInput";
import { AssetTypesDropdown } from "./dropdowns/AssetTypesDropdown";
import { VendorsDropdown } from "./dropdowns/VendorsDropdown";
import { PartsDropdown } from "./dropdowns/PartsDropdown";
import { ParentAssetDropdown } from "./dropdowns/ParentAssetDropdown";
import { FooterActions } from "./FooterActions";

import {
  createAsset,
  updateAsset,
  type CreateAssetData,
} from "../../../store/assets";
import type { AppDispatch, RootState } from "../../../store";

type SelectableItem = {
  id: number | string;
  name: string;
};

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
  const user = useSelector((state: RootState) => state.auth.user);

  // States
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<number | string>("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [criticality, setCriticality] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SelectableItem | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<SelectableItem | null>(null);
  const [selectedVendorId, setSelectedvendorId] = useState<SelectableItem | null>(null);
  const [selectedTeamInCharge, setSelectedTeamInCharge] = useState<SelectableItem[]>([]);
  const [selectedAssetTypeIds, setSelectedAssetTypeIds] = useState<number[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectableItem[]>([]);
  const [selectedParentAssets, setSelectedParentAssets] = useState<SelectableItem | null>(null);

  // Dropdown open states
  const [locationOpen, setLocationOpen] = useState(false);
  const [teamOpen, setTeamsOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [partOpen, setPartOpen] = useState(false);
  const [parentAssetOpen, setParentAssetOpen] = useState(false);

  // Refs
  const LocationRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const parentAssetRef = useRef<HTMLDivElement>(null);

  // Load data if editing
  useEffect(() => {
    if (isEdit && assetData) {
      setAssetName(assetData.name || "");
      setDescription(assetData.description || "");
      setYear(assetData.year || "");
      setModel(assetData.model || "");
      setSerialNumber(assetData.serialNumber || "");
      setQrCode(assetData.qrCode || "");
      setCriticality(assetData.criticality || "");
      setSelectedLocation(assetData.location ? { id: assetData.location.id, name: assetData.location.name } : null);
      setSelectedManufacturer(assetData.manufacturer ? { id: assetData.manufacturer.id, name: assetData.manufacturer.name } : null);
    }
  }, [isEdit, assetData]);

  const handleCreate = async () => {
    if (!assetName) {
      toast.error("Asset Name is required");
      return;
    }

    const payload: CreateAssetData = {
      name: assetName,
      description,
      year: Number(year),
      model,
      serialNumber,
      qrCode,
      criticality,
      locationId: selectedLocation?.id as string,
      // ✅ Fixed: Changed to manufacturerId
      manufacturerId: selectedManufacturer?.id as string,
      vendorId: selectedVendorId?.id as string,
      teamsInCharge: selectedTeamInCharge.map(t => t.id),
      partIds: selectedParts.map(p => p.id),
      assetTypeIds: selectedAssetTypeIds,
      parentAssetId: selectedParentAssets?.id as string,
    };

    try {
      if (isEdit && assetData?.id) {
        const updated = await dispatch(updateAsset({ id: assetData.id, data: payload })).unwrap();
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
      toast.error(error || "Failed to save asset");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Asset" : "Create New Asset"}
        </h2>
        
        <AssetNameInput assetName={assetName} setAssetName={setAssetName} />
        <PicturesUpload />
        <FilesUpload />
        
        <LocationDropdown 
          locationOpen={locationOpen}
          setLocationOpen={setLocationOpen}
          LocationRef={LocationRef}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
        
        <CriticalityDropdown criticality={criticality} setCriticality={setCriticality} />
        <DescriptionField description={description} setDescription={setDescription} />
        <YearInput year={year} setYear={setYear} />
        
        <ManufacturerDropdown 
           label="Manufacturer"
           value={selectedManufacturer}
           onChange={setSelectedManufacturer}
        />
        
        <ModelField model={model} setModel={setModel} />
        
        <SerialNumberInput serialNumber={serialNumber} setSerialNumber={setSerialNumber} />
        
        <TeamsDropdown 
           teamOpen={teamOpen}
           setteamsOpen={setTeamsOpen}
           teamRef={teamRef}
           selectTeamInCharge={selectedTeamInCharge}
           setSelectTeamInCharge={setSelectedTeamInCharge}
        />
        
        <QrCodeInput qrCode={qrCode} setQrCode={setQrCode} />
        
        <AssetTypesDropdown 
           label="Asset Types"
           value={selectedAssetTypeIds}
           onChange={setSelectedAssetTypeIds}
        />
        
        <VendorsDropdown 
           vendorOpen={vendorOpen}
           setVendorOpen={setVendorOpen}
           vendorRef={vendorRef}
           selectedVendorId={selectedVendorId}
           setSelectedvendorId={setSelectedvendorId}
        />
        
        <PartsDropdown 
           partOpen={partOpen}
           setPartOpen={setPartOpen}
           partRef={partRef}
           selectedParts={selectedParts}
           setSelectedParts={setSelectedParts}
        />
        
        <ParentAssetDropdown 
           parentAssetOpen={parentAssetOpen}
           setParentAssetOpen={setParentAssetOpen}
           parentAssetRef={parentAssetRef}
           selectedParentAssets={selectedParentAssets}
           setSelectedParentAssets={setSelectedParentAssets}
        />
      </div>

      <FooterActions onCreate={handleCreate} onCancel={onCancel} isEdit={isEdit} />
    </div>
  );
}