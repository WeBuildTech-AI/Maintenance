"use client";

import { useState } from "react";
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

interface NewAssetFormProps {
  onCreate: () => void;
  onCancel?: () => void;
}

export function NewAssetForm({ onCreate, onCancel }: NewAssetFormProps) {
  const [assetName, setAssetName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!assetName.trim()) {
      setError("You need to provide an Asset Name");
      return;
    }
    setError("");
    onCreate();
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
          <AssetNameInput assetName={assetName} setAssetName={setAssetName} error={error} />
        </div>

        {/* Sections */}
        <PicturesUpload />
        <FilesUpload />
        <LocationDropdown />
        <CriticalityDropdown />
        <DescriptionField />
        <YearInput />
        <ManufacturerDropdown />
        <ModelField />
        <SerialNumberInput />
        <TeamsDropdown />
        <QrCodeInput />
        <AssetTypesDropdown />
        <VendorsDropdown />
        <PartsDropdown />
        <ParentAssetDropdown />
      </div>

      {/* Footer */}
      <FooterActions onCreate={handleCreate} onCancel={onCancel} />
    </div>
  );
}
