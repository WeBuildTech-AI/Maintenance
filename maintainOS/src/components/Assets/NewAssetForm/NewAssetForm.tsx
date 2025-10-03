"use client";

import { useRef, useState } from "react";
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
import { createAsset, type CreateAssetData } from "../../../store/assets";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";

interface NewAssetFormProps {
  onCreate: () => void;
  onCancel?: () => void;
}

export function NewAssetForm({ onCreate, onCancel }: NewAssetFormProps) {
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

  const LocationRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const parentAssetRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const handleCreate = () => {
    if (!assetName.trim()) {
      setError("You need to provide an Asset Name");
      return;
    }

    const payload: CreateAssetData = {
      organizationId: user?.organizationId,
      name: assetName,
      locationId: selectedLocation.id, // from dropdown
      criticality: criticality,
      description: description,
      year: year,
      manufacturer: selectedManufacture,
      model: selectedModel,
      serialNumber: serialNumber,
      teamsInCharge: selectedTeamInCharge,
      qrCode: qrCode,
      // assetTypeId: selectedAssetType,
      vendorId: selectedVendorId.id,
      partIds: [selectedParts.id],
      parentAssetId: selectedParentAssets.id,
    };

    // Dispatch the thunk
    dispatch(createAsset(payload))
      .unwrap()
      .then((res) => {
        console.log(res, "response");
        setAssetName("");
        setSelectedLocation("");
        setCriticality("");
        setDescription("");
        setYear("");
        setSelectedManufacture("");
        setSelectedModel("");
        setSerialNumber("");
        setSelectedTeamInCharge([]);
        setQrCode("");
        setSelectedAssetType("");
        setSelectedvendorId("");
        setSelectedParts([]);
        setSelectedParentAssets("");
      })
      .catch((err) => {
        setError(err || "Failed to create asset");
      });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
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
