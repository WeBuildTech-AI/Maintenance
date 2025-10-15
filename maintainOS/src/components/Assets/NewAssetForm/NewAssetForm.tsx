"use client";

import { useEffect, useRef, useState } from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// ✅ Define a reusable type for objects with id and name
type SelectableItem = {
  id: number | string;
  name: string;
};

// This interface seems correct based on your usage
interface Asset {
  id: number | string;
  name: string;
  location: SelectableItem;
  criticality?: string;
  description?: string;
  year?: string | number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  teams?: SelectableItem[];
  qrCode?: string;
  assetType?: string;
  vendor?: SelectableItem;
  parts?: SelectableItem[];
  parentAsset?: SelectableItem;
}

interface NewAssetFormProps {
  isEdit?: boolean;
  assetData?: Asset | null;
  onCreate: (newAsset: Asset) => void;
  onCancel?: () => void;
}

export function NewAssetForm({
  isEdit = false,
  assetData,
  onCreate,
  onCancel,
}: NewAssetFormProps) {
  const [assetName, setAssetName] = useState("");
  // ✅ Explicitly type your state for single-item selections
  const [selectedLocation, setSelectedLocation] =
    useState<SelectableItem | null>(null);
  const [criticality, setCriticality] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [selectedManufacture, setSelectedManufacture] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  // ✅ Explicitly type your state for multi-item selections
  const [selectedTeamInCharge, setSelectedTeamInCharge] = useState<
    SelectableItem[]
  >([]);
  const [qrCode, setQrCode] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");
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
  const [status, setStatus] = useState("online");

  const LocationRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const parentAssetRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isEdit && assetData) {
      setAssetName(assetData.name || "");
      // ✅ Ensure the data you set matches the state's type
      setSelectedLocation(assetData.location || null);
      setCriticality(assetData.criticality || "");
      setDescription(assetData.description || "");
      setSerialNumber(assetData.serialNumber || "");
      setSelectedTeamInCharge(assetData.teams || []);
      setQrCode(assetData.qrCode || "");
      setSelectedAssetType(assetData.assetType || "");
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
      organizationId: user?.organizationId,
      name: assetName.trim(),
    };

    if (selectedLocation?.id) payload.locationId = selectedLocation.id;
    if (criticality) payload.criticality = criticality;
    if (description.trim()) payload.description = description;
    if (year) payload.year = year;
    if (selectedManufacture) payload.manufacturer = selectedManufacture;
    if (selectedModel) payload.model = selectedModel;
    if (serialNumber.trim()) payload.serialNumber = serialNumber;
    if (qrCode.trim()) payload.qrCode = qrCode;
    if (selectedAssetType) payload.assetTypeId = selectedAssetType;
    if (selectedVendorId?.id) payload.vendorId = selectedVendorId.id;
    if (selectedParentAssets?.id)
      payload.parentAssetId = selectedParentAssets.id;
    if (status) payload.status = status;

    // ✅ This mapping will now work correctly because the state is properly typed
    if (selectedTeamInCharge?.length > 0) {
      payload.teamsInCharge = selectedTeamInCharge.map((team) => team.id);
    }

    if (selectedParts?.length > 0) {
      payload.partIds = selectedParts.map((part) => part.id);
    }

    console.log("Final Payload:", payload);

    if (isEdit && assetData?.id) {
      dispatch(updateAsset({ id: assetData.id, assetData: payload }))
        .unwrap()
        .then((res) => {
          toast.success("Successfully Updated the Asset");
          onCreate(res);
        })
        .catch((err) => {
          const errorMessage = err.message || "Failed to update asset";
          setError(errorMessage);
          toast.error(errorMessage);
        });
    } else {
      dispatch(createAsset(payload as CreateAssetData))
        .unwrap()
        .then((res) => {
          toast.success("Successfully Created the Asset");
          onCreate(res);

          // Reset form
          setAssetName("");
          setSelectedLocation(null);
          setCriticality("");
          setDescription("");
          setYear("");
          setSelectedManufacture("");
          setSelectedModel("");
          setSerialNumber("");
          setSelectedTeamInCharge([]);
          setQrCode("");
          setSelectedAssetType("");
          setSelectedvendorId(null);
          setSelectedParts([]);
          setSelectedParentAssets(null);
        })
        .catch((err) => {
          const errorMessage = err.message || "Failed to create asset";
          setError(errorMessage);
          toast.error(errorMessage);
        });
    }
  };

  console.log(selectedParts, "selectedPart");

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
          naviagte={navigate}
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
        <ManufacturerDropdown />
        {/* <ModelField /> */}
        <SerialNumberInput
          serialNumber={serialNumber}
          setSerialNumber={setSerialNumber}
        />
        <TeamsDropdown
          navigate={navigate}
          teamOpen={teamOpen}
          setteamsOpen={setTeamsOpen}
          teamRef={teamRef}
          selectTeamInCharge={selectedTeamInCharge}
          setSelectTeamInCharge={setSelectedTeamInCharge}
        />
        <QrCodeInput qrCode={qrCode} setQrCode={setQrCode} />
        <AssetTypesDropdown />
        <VendorsDropdown
          navigate={navigate}
          vendorOpen={vendorOpen}
          setVendorOpen={setVendorOpen}
          vendorRef={vendorRef}
          selectedVendorId={selectedVendorId}
          setSelectedvendorId={setSelectedvendorId}
        />
        <PartsDropdown
          navigate={navigate}
          partOpen={partOpen}
          setPartOpen={setPartOpen}
          partRef={partRef}
          selectedParts={selectedParts}
          setSelectedParts={setSelectedParts}
        />
        <ParentAssetDropdown
          navigate={navigate}
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
