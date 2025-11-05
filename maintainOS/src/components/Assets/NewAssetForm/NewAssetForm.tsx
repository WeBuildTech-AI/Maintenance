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
// import { ModelField } from "./fields/ModelField"; // <-- Import pehle se tha
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

// Interface (Aapke pichle code ke hisaab se update kar diya hai)
interface Asset {
  id: number | string;
  name: string;
  location: SelectableItem;
  criticality?: string;
  description?: string;
  year?: string | number;
  manufacturer?: SelectableItem; // <-- Yeh 'SelectableItem' hai
  model?: string;
  serialNumber?: string;
  teams?: SelectableItem[];
  qrCode?: string;
  assetTypes?: SelectableItem[];
  vendor?: SelectableItem;
  parts?: SelectableItem[];
  parentAsset?: SelectableItem;
}

interface NewAssetFormProps {
  isEdit?: boolean;
  assetData?: Asset | null;
  // accept any response from API to avoid type mismatch with store types
  onCreate: (newAsset: any) => void;
  onCancel?: () => void;
  fetchAssetsData: () => void;
}

export function NewAssetForm({
  isEdit = false,
  assetData,
  onCreate,
  onCancel,
  fetchAssetsData,
}: NewAssetFormProps) {
  const [assetName, setAssetName] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<SelectableItem | null>(null);
  const [criticality, setCriticality] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  
  // State ko 'SelectableItem | null' banaya
  const [selectedManufacture, setSelectedManufacture] =
    useState<SelectableItem | null>(null);
    
  const [selectedModel, setSelectedModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedTeamInCharge, setSelectedTeamInCharge] = useState<
    SelectableItem[]
  >([]);
  const [qrCode, setQrCode] = useState("");
  const [selectedAssetTypeIds, setSelectedAssetTypeIds] = useState<number[]>(
    []
  );
  const [selectedVendorId, setSelectedvendorId] =
    useState<SelectableItem | null>(null);
  const [selectedParts, setSelectedParts] = useState<SelectableItem[]>([]);
  const [selectedParentAssets, setSelectedParentAssets] =
    useState<SelectableItem | null>(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [partOpen, setPartOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [teamOpen, setTeamsOpen] = useState(false);
  const [parentAssetOpen, setParentAssetOpen] = useState(false);
  const [status] = useState("online");

  const LocationRef = useRef<HTMLDivElement | null>(null);
  const teamRef = useRef<HTMLDivElement | null>(null);
  const partRef = useRef<HTMLDivElement | null>(null);
  const vendorRef = useRef<HTMLDivElement | null>(null);
  const parentAssetRef = useRef<HTMLDivElement | null>(null);

  const [error, setError] = useState("");
  // navigation hook not needed here because dropdowns handle their own navigation
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isEdit && assetData) {
      setAssetName(assetData.name || "");
      setSelectedLocation(assetData.location || null);
      setCriticality(assetData.criticality || "");
      setDescription(assetData.description || "");
      
      // === FIX: Yeh lines missing thi ===
      // 'year' ko string mein convert kiya taaki input field mein aa sake
      setYear(String(assetData.year || "")); 
      setSelectedManufacture(assetData.manufacturer || null);
      setSelectedModel(assetData.model || ""); 
      // === END FIX ===

      setSerialNumber(assetData.serialNumber || "");
      setSelectedTeamInCharge(assetData.teams || []);
      setQrCode(assetData.qrCode || "");

      if (assetData.assetTypes) {
        const ids = assetData.assetTypes.map((type) => type.id as number);
        setSelectedAssetTypeIds(ids);
      } else {
        setSelectedAssetTypeIds([]);
      }

      setSelectedvendorId(assetData.vendor || null);
      setSelectedParts(assetData.parts || []);
      setSelectedParentAssets(assetData.parentAsset || null);
    }
  }, [isEdit, assetData]);

  const handleCreate = () => {
    if (!assetName.trim()) {
      setError("You need to provide an Asset Name");
      return;
    }
    setError("");

    const payload: Partial<CreateAssetData> = {
      // organizationId: user?.organizationId,
      name: assetName.trim(),
    };

    if (selectedLocation?.id) payload.locationId = selectedLocation.id;
    if (criticality) payload.criticality = criticality;
    if (description.trim()) payload.description = description;
    if (year) payload.year = year;
    
    // Ab 'manufacturerId' bhej rahe hain
    if (selectedManufacture?.id) {
      // Note: Key ka naam 'manufacturerId' maana hai, aap ise apne 'CreateAssetData' ke hisaab se badal lein
      payload.manufacturerId = selectedManufacture.id; 
    }
    
    if (selectedModel) payload.model = selectedModel;
    if (serialNumber.trim()) payload.serialNumber = serialNumber;
    if (qrCode.trim()) payload.qrCode = qrCode;

    if (selectedAssetTypeIds.length > 0) {
      payload.assetTypeIds = selectedAssetTypeIds; 
    }

    if (selectedVendorId?.id) payload.vendorId = selectedVendorId.id;

    if (selectedParentAssets?.id)
      payload.parentAssetId = selectedParentAssets.id;
    if (status) payload.status = status;

    if (selectedTeamInCharge?.length > 0) {
      payload.teamsInCharge = selectedTeamInCharge.map((team) => team.id);
    }

    if (selectedParts?.length > 0) {
      payload.partIds = selectedParts.map((part) => part.id);
    }

    console.log("Final Payload:", payload);

    if (isEdit && assetData?.id) {
      dispatch(updateAsset({ id: String(assetData.id), assetData: payload }))
        .unwrap()
        .then((res) => {
          toast.success("Successfully Updated the Asset");
          onCreate(res);
          fetchAssetsData();
        })
        .catch((err) => {
          const errorMessage = err.message || "Failed to update asset";
          // setError(errorMessage);
          toast.error(errorMessage);
        });
    } else {
      dispatch(createAsset(payload as CreateAssetData))
        .unwrap()
        .then((res) => {
          toast.success("Successfully Created the Asset");
          onCreate(res); // <-- FIX: Ise uncomment kar diya hai
          fetchAssetsData();
          // Reset form
          setAssetName("");
          setSelectedLocation(null);
          setCriticality("");
          setDescription("");
          setYear("");
          setSelectedManufacture(null); // <-- Reset to null
          setSelectedModel(""); // <-- Reset add kar diya
          setSerialNumber("");
          setSelectedTeamInCharge([]);
          setQrCode("");
          setSelectedAssetTypeIds([]); 
          setSelectedvendorId(null);
          setSelectedParts([]);
          setSelectedParentAssets(null);
        })
        .catch((err) => {
          const errorMessage = err.message || "Failed to create asset";
          // setError(errorMessage);
          toast.error(errorMessage);
        });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Asset" : "New Asset"}
        </h2>
      </div>
      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
        {/* Icon + Asset Name */}
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
            <Package className="h-5 w-5" />
          </div>
          <AssetNameInput
            assetName={assetName}
            setAssetName={setAssetName}
            error={error}
          />
        </div>

        {/* Sections */}
        <PicturesUpload />
        <FilesUpload />
        <LocationDropdown
          locationOpen={locationOpen}
          setLocationOpen={setLocationOpen}
          LocationRef={LocationRef}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
        <CriticalityDropdown
          setCriticality={setCriticality}
          criticality={criticality}
        />
        <DescriptionField
          description={description}
          setDescription={setDescription}
        />
        <YearInput year={year} setYear={setYear} />
        
        {/* === FIX: ManufacturerDropdown ko props pass kiye === */}
        <ManufacturerDropdown
          label="Manufacturer"
          value={selectedManufacture}
          onChange={setSelectedManufacture}
        />
        
        {/* === FIX: ModelField ko uncomment kiya aur props pass kiye === */}
        {/* <ModelField model={selectedModel} setModel={setSelectedModel} /> */}
        
        <SerialNumberInput
          serialNumber={serialNumber}
          setSerialNumber={setSerialNumber}
        />
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

      {/* Footer */}
      <FooterActions onCreate={handleCreate} onCancel={onCancel} />
    </div>
  );
}