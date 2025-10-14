"use client";

import { useEffect, useRef, useState } from "react";
import { Package } from "lucide-react";

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
import { useNavigate } from "react-router-dom";
import {
  createAsset,
  updateAsset,
  type CreateAssetData,
} from "../../../store/assets";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { stat } from "fs";

interface NewAssetFormProps {
  isEdit?: boolean; // To check if we are in edit mode
  assetData?: Asset | null;
  onCreate: (newAsset: Asset) => void;
  onCancel?: () => void;
}

interface Asset {
  id: number | string;
  name: string;
  location: {
    id: number | string;
    name: string;
  };
  criticality?: string;
  description?: string;
  year?: string | number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  teams?: Array<{ id: number | string; name: string }>;
  qrCode?: string;
  assetType?: string;
  vendor?: { id: number | string; name: string };
  parts?: Array<{ id: number | string; name: string }>;
  parentAsset?: { id: number | string; name: string };
  // Add other properties as needed
}

export function NewAssetForm({
  isEdit = false,
  assetData,
  onCreate,
  onCancel,
}: NewAssetFormProps) {
  const [assetName, setAssetName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [criticality, setCriticality] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [selectedManufacture, setSelectedManufacture] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedTeamInCharge, setSelectedTeamInCharge] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [selectedVendorId, setSelectedvendorId] = useState("");
  const [selectedParts, setSelectedParts] = useState([]);
  const [selectedParentAssets, setSelectedParentAssets] = useState("");
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
      setSelectedLocation(assetData.location || null);
      setCriticality(assetData.criticality || "");
      setDescription(assetData.description || "");
      setSerialNumber(assetData.serialNumber || "");
      setSelectedTeamInCharge(assetData.teams || []); // Adjust based on your data structure
      setQrCode(assetData.qrCode || "");
      setSelectedAssetType(assetData.assetType || "");
      setSelectedvendorId(assetData.vendor || null);
      setSelectedParts(assetData.parts || []);
    }
  }, [isEdit, assetData]);

  const handleCreate = () => {
    // 1. Basic validation for the required field
    if (!assetName.trim()) {
      setError("You need to provide an Asset Name");
      return;
    }

    // 2. Start building the payload with only the mandatory fields
    // Using 'Partial' tells TypeScript that we are building the object piece by piece.
    const payload: Partial<CreateAssetData> = {
      organizationId: user?.organizationId,
      name: assetName.trim(),
    };

    // 3. Conditionally add other fields to the payload ONLY if they have a value
    if (selectedLocation?.id) {
      payload.locationId = selectedLocation.id;
    }
    if (criticality) {
      payload.criticality = criticality;
    }
    if (description.trim()) {
      payload.description = description;
    }
    if (year) {
      // Assuming year is a string or number
      payload.year = year;
    }
    if (selectedManufacture) {
      payload.manufacturer = selectedManufacture;
    }
    if (selectedModel) {
      payload.model = selectedModel;
    }
    if (serialNumber.trim()) {
      payload.serialNumber = serialNumber;
    }
    if (selectedTeamInCharge?.length > 0) {
      payload.teamsInCharge = selectedTeamInCharge;
    }
    if (qrCode.trim()) {
      payload.qrCode = qrCode;
    }
    if (selectedAssetType) {
      payload.assetTypeId = selectedAssetType;
    }
    if (selectedVendorId?.id) {
      payload.vendorId = selectedVendorId.id;
    }
    // Correctly handle an array of parts by mapping over them
    if (selectedParts?.length > 0) {
      payload.partIds = selectedParts.map((part) => part.id);
    }
    if (selectedParentAssets?.id) {
      payload.parentAssetId = selectedParentAssets.id;
    }

    if (status) {
      payload.status = status;
    }

    if (isEdit && assetData?.id) {
      // We are editing: dispatch the update action
      dispatch(updateAsset({ id: assetData.id, assetData: payload }))
        .unwrap()
        .then((res) => {
          toast.success("Successfully Update the Asset");
          onCreate(res); // Call the success callback
        })
        .catch((err) => {
          setError(err || "Failed to update asset");
          toast.error(err || "Failed to update asset");
        });
    } else {
      dispatch(createAsset(payload as CreateAssetData)) // We cast it back to the full type here
        .unwrap()
        .then((res) => {
          toast.success("Successfully Create the Asset");
          onCreate(res);
          // Reset all form fields
          setAssetName("");
          setSelectedLocation(null); // Recommended to reset objects to null
          setCriticality("");
          setDescription("");
          setYear("");
          setSelectedManufacture("");
          setSelectedModel("");
          setSerialNumber("");
          setSelectedTeamInCharge([]);
          setQrCode("");
          setSelectedAssetType("");
          setSelectedvendorId(null); // Recommended to reset objects to null
          setSelectedParts([]);
          setSelectedParentAssets(null); // Recommended to reset objects to null
        })
        .catch((err) => {
          setError(err || "Failed to create asset");
          toast.error(err || "Failed to create asset");
        });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden  border">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">New Asset</h2>
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
