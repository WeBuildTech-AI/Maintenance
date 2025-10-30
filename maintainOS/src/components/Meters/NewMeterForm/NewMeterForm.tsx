"use client";

import { useEffect, useState } from "react";
import { Upload, Lock, RefreshCcw, User } from "lucide-react";
import { SearchWithDropdown } from "../../Locations/SearchWithDropdown";
import { createMeter, meterService, updateMeter } from "../../../store/meters";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { assetService } from "../../../store/assets";
import { locationService } from "../../../store/locations";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";

interface NewMeterFormProps {
  onCreate: (data: any) => void;
  onCancel: (data: any) => void;
  editingMeter?: any; //  ye naya prop add karo
  editingMeter?: any; //  ye naya prop add karo
}

export function NewMeterForm({
  onCreate,
  onCancel,

  editingMeter,
}: NewMeterFormProps) {
  const [meterType, setMeterType] = useState<"manual" | "automated">("manual");
  const [meterName, setMeterName] = useState("");
  const [description, setDescription] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [asset, setAsset] = useState("");
  const [location, setLocation] = useState("");
  const [readingFrequencyValue, setReadingFrequencyValue] = useState("");
  const [readingFrequencyUnit, setReadingFrequencyUnit] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const [error, setError] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const [postMeterDataloading, setPostMeterDataLoading] = useState(false);
  const [getAssetData, setGetAssestData] = useState([]);
  const [getLocationData, setGetLocationData] = useState([]);
  const [measurementUnitOption, setMeasurementUnitOption] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const combinedValue = `${readingFrequencyValue} ${readingFrequencyUnit}`;

  const isEdit = !!editingMeter;
  useEffect(() => {
    if (editingMeter) {
      setMeterType(editingMeter.meterType || "manual");
      setMeterName(editingMeter.name || "");
      setDescription(editingMeter.description || "");
      setMeasurementUnit(editingMeter.unit || "");
      setAsset(editingMeter.assetId || "");
      setLocation(editingMeter.locationId || "");
      setReadingFrequencyValue(editingMeter.readingFrequency?.time || "");
      setReadingFrequencyUnit(
        editingMeter.readingFrequency?.interval || "none"
      );
    }
  }, [editingMeter]);

  // Split images/docs
  const splitFiles = (selectedFiles: File[]) => {
    const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const docTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const newImages = selectedFiles.filter((f) => imageTypes.includes(f.type));
    const newDocs = selectedFiles.filter((f) => docTypes.includes(f.type));
    if (newImages.length) setFiles((prev) => [...prev, ...newImages]);
    if (newDocs.length) setDocs((prev) => [...prev, ...newDocs]);
  };

  // File handling
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    splitFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    splitFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDoc = (index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // create New Meter Function

  const handleCreateMeter = async () => {
    // Yeh function ab async hai
    try {
      // --- Validation (Aapka validation logic aesa hi rahega) ---
      if (!meterName.trim()) {
        setError("You need to provide a Meter Name");
        return;
      }
      if (!measurementUnit || measurementUnit === "none") {
        setError("You need to select a Measurement Unit");
        return;
      }

      setError("");
      setPostMeterDataLoading(true);

      const formData = new FormData();

      // --- FormData Population (Ismein koi badlav nahi hai) ---
      // Mandatory Fields
      formData.append("organizationId", user.organizationId);
      formData.append("name", meterName);
      formData.append("measurementId", measurementUnit);
      formData.append("meterType", meterType);

      // Optional Fields
      if (description.trim()) formData.append("description", description);
      if (asset) formData.append("assetId", asset);
      if (location) formData.append("locationId", location);

      // Reading Frequency
      const freqUnit = readingFrequencyUnit;
      const freqValue = String(readingFrequencyValue || "").trim();
      if (freqUnit && freqUnit !== "none" && freqValue) {
        const readingFrequencyObj = {
          interval: freqUnit,
          time: freqValue,
        };
        formData.append(
          "readingFrequency",
          JSON.stringify(readingFrequencyObj)
        );
      }

      // --- Dispatch API (Yahan par main badlav kiya gaya hai) ---
      if (isEdit && editingMeter?.id) {
        // EDIT MODE
        await dispatch(
          updateMeter({ id: editingMeter.id, meterData: formData })
        ).unwrap();
        toast.success("Meter updated successfully");
      } else {
        // CREATE MODE: Agar isEdit false hai
        await dispatch(createMeter(formData)).unwrap();
        toast.success("Successfully added the Meter");
      }

      // Dono cases mein common success logic
      onCreate();
    } catch (err) {
      // Error handling ab ek hi jagah par hai
      console.error("❌ Meter save failed:", err);
      toast.error(err.message || "Meter save failed. Please try again.");
    } finally {
      // Loading state ko false set karna
      setPostMeterDataLoading(false);
    }
  };

  const handleGetAssetData = async () => {
    // Fetch only if the data is not already loaded
    if (getAssetData.length > 0) {
      return;
    }
    setLoading(true);
    try {
      const assetsRes = await assetService.fetchAssetsName();
      setGetAssestData(assetsRes || []);
    } catch (err) {
      console.error("Failed to fetch asset data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocationData = async () => {
    // Agar location ka data pehle se hai, toh API call nahi hogi.
    if (getLocationData.length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Yahan aap apni location fetch karne wali API call likhein
      const res = await locationService.fetchLocationsName();
      setGetLocationData(res || []);
    } catch (err) {
      console.error("Failed to fetch location data:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleGetMesurementUnit = async () => {
    // Agar location ka data pehle se hai, toh API call nahi hogi.
    if (measurementUnitOption.length > 0) {
      return;
    }
    setLoading(true);
    try {
      // Yahan aap apni location fetch karne wali API call likhein
      const MeasurementRes = await meterService.fetchMesurementUnit();
      // console.log(MeasurementRes);
      setMeasurementUnitOption(MeasurementRes);
    } catch (err) {
      console.error("Failed to fetch location data:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log(measurementUnitOption, "MeasurementUnit");

  const handleReset = () => {
    setMeterName("");
    setDescription("");
    setAsset("none");
    setLocation("none");
    setMeasurementUnit("none");
    setReadingFrequencyUnit("none");
    setReadingFrequencyValue("");
  };

  return (
    <div className="flex h-full mr-2 flex-col overflow-hidden border">
      {/* Header (fixed) */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Update Meter" : "New Meter"}
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Name row */}
        <div className="px-6 pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
              <button onClick={handleReset}>
                <RefreshCcw className="h-5 w-5" />
              </button>
            </div>

            <div className="w-full">
              <input
                type="text"
                placeholder="Enter Meter Name (Required)"
                value={meterName}
                onChange={(e) => setMeterName(e.target.value)}
                className="w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2 text-lg placeholder-gray-400 outline-none focus:border-blue-500"
              />
              {error && !meterName.trim() && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Meter Type */}
        <div className="px-6 pb-6 pt-6">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Meter Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMeterType("manual")}
              className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                meterType === "manual"
                  ? "border-orange-600 bg-white-50 text-orange-600 ring-1 ring-blue-500/20"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" />
              Manual
            </button>
            <button
              type="button"
              onClick={() => setMeterType("automated")}
              className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                meterType === "automated"
                  ? "border-orange-600 bg-white-50 text-orange-600 ring-1 ring-blue-500/20"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Lock className="h-4 w-4" />
              Automated
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            placeholder="Add a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[96px]  rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Divider */}
        <div className="mx-6 border-b" />

        {/* Measurement Unit (Required) */}
        <div className="px-6 pt-6 pb-2">
          <div className="w-full sm:max-w-md md:max-w-lg">
            {/* Label for accessibility */}
            <label
              htmlFor="measurement-unit-select"
              className="block text-sm font-medium text-gray-700"
            >
              Measurement Unit (Required)
            </label>

            {/* Dropdown */}
            <div className="relative mt-2">
              <select
                id="measurement-unit-select"
                name="measurementUnit"
                value={measurementUnit}
                onClick={handleGetMesurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)} // ✅ Passes ID value
                className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                style={{
                  height: "40px",
                  paddingRight: "2.5rem", // leaves room for arrow icon
                }}
              >
                {/* Default placeholder */}
                <option value="" disabled>
                  Select a unit...
                </option>

                {/* Loading & options */}
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  Array.isArray(measurementUnitOption) &&
                  measurementUnitOption.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Validation error */}
            {error && !measurementUnit && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* Asset & Location */}
        <div className="flex gap-6 px-6 pb-6 pt-6">
          {/* Asset */}
          <div className="flex-1">
            <label
              htmlFor="asset-select"
              className="block mb-1.5 text-sm font-medium text-gray-900"
            >
              Asset
            </label>

            <div className="relative w-full">
              <select
                id="asset-select"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                // JAISE HI USER CLICK KAREGA, YEH FUNCTION CALL HOGA
                onClick={handleGetAssetData}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select an Asset
                </option>

                {/* Loading state waise hi kaam karega jab API call hogi */}
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  getAssetData?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex-1">
            {/* Label ko behtar accessibility ke liye update kiya gaya hai */}
            <label
              htmlFor="location-select"
              className="block mb-1.5 text-sm font-medium text-gray-900"
            >
              Location
            </label>

            <div className="relative w-full">
              <select
                id="location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                // onClick event ko yahan select par lagaya gaya hai
                onClick={handleGetLocationData}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {/* Ek permanent, disabled placeholder */}
                <option value="" disabled>
                  Select a Location
                </option>

                {/* Loading state ko sahi tarike se handle kiya gaya hai */}
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  getLocationData?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-b" />

        {/* Reading Frequency */}
        <div style={{ padding: "24px" }}>
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Reading Frequency
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#374151" }}>Every</span>

            <input
              type="number"
              value={0 || readingFrequencyValue}
              onChange={(e) => setReadingFrequencyValue(Number(e.target.value))}
              style={{
                height: "40px",
                width: "70px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                backgroundColor: "#fff", // allow typing
                textAlign: "center",
                color: "#374151",
                fontSize: "14px",
              }}
            />

            <div style={{ position: "relative", width: "180px" }}>
              <select
                defaultValue="none"
                onChange={(e) => setReadingFrequencyUnit(e.target.value)}
                style={{
                  height: "40px",
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "0 32px 0 12px",
                  fontSize: "14px",
                  color: "#374151",
                  backgroundColor: "#fff",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                <option value="none">None</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>

              {/* Chevron icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "16px",
                  height: "16px",
                  color: "#4b5563",
                  pointerEvents: "none",
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-b mb-20" />

        {/* Additional Info (dropzone updated) */}
        <div className="px-6 pb-24 pt-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Additional Info
          </h3>

          {/* Image uploader */}
          {files.length === 0 ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="mb-20 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer"
              onClick={() => document.getElementById("fileInputMeter")?.click()}
            >
              <Upload className="mx-auto mb-2 h-6 w-6" />
              <p>Add or drag pictures</p>
              <input
                id="fileInputMeter"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mt-3">
              {/* Add More first */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border border-dashed rounded-md text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                onClick={() =>
                  document.getElementById("fileInputMeter")?.click()
                }
              >
                <Upload className="h-6 w-6 mb-2" />
                <p className="text-xs">Add more</p>
                <input
                  id="fileInputMeter"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              {files.map((file, i) => {
                const url = URL.createObjectURL(file);
                return (
                  <div
                    key={i}
                    className="relative w-32 h-32 rounded-md overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-white text-blue-600 rounded-full p-1 shadow"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Docs Preview */}
          {docs.length > 0 && (
            <div className="space-y-2 mt-3">
              {docs.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs rounded">
                      {file.name.split(".").pop()?.toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoc(i)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer (fixed) */}
      <div className="sticky bottom-0 mt-6 flex items-center jusitfy-end border-t bg-white px-6 py-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="h-10 rounded-md border px-4 text-sm font-medium text-orange-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleCreateMeter}
          style={{
            marginLeft: "auto",
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
          className="h-10 rounded-md bg-orange-600 text-sm font-medium text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {postMeterDataloading ? "Loading..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}
