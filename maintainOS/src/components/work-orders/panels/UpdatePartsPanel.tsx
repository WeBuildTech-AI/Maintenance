"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect"; // ✅ adjust path if needed

export default function UpdatePartsPanel({ onCancel }: any) {
    const [selectedPart, setSelectedPart] = useState<string>("");
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFetchParts = async () => {
        setLoading(true);
        setTimeout(() => {
            setPartOptions([
                { id: "p1", name: "Bolt" },
                { id: "p2", name: "Screw" },
            ]);
            setLoading(false);
        }, 600);
    };

    const handleSave = () => {
        console.log("✅ Selected part:", selectedPart);
        onCancel();
    };

    return (
        <div
            className="flex flex-col bg-white shadow-sm border-gray-200 rounded-md"
            style={{ height: "calc(100vh - 135px)" }}
        >
            {/* ✅ Fixed Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b bg-white sticky top-0 z-20">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h2 className="font-medium text-gray-900">Update Parts Used</h2>
                <div />
            </div>

            {/* ✅ Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                <div className="flex flex-col gap-2 mt-6"> {/* 🔹 Added top margin here */}
                    <label className="text-sm font-medium text-gray-900">Parts</label>

                    <DynamicSelect
                        options={partOptions}
                        value={selectedPart}
                        onSelect={(val) => setSelectedPart(val as string)}
                        onFetch={handleFetchParts}
                        loading={loading}
                        name="part-select"
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        ctaText="Add new part"
                        onCtaClick={() => alert("Open part creation modal")}
                    />
                </div>
            </div>

            {/* ✅ Fixed Footer — unchanged */}
            <div className="flex-none border-t p-4 flex justify-end bg-white sticky bottom-0 z-20 gap-3">
                <button
                    onClick={onCancel}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                >
                    Save Parts
                </button>
            </div>
        </div>
    );
}
