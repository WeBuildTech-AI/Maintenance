import { Search, X, Info } from "lucide-react";
import { useState } from "react";

interface Asset {
    id: string;
    name: string;
    icon?: string;
}

interface AddAssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (selected: Asset[]) => void;
    assets: Asset[];
}

export default function AddAssetsModal({
    isOpen,
    onClose,
    onAdd,
    assets,
}: AddAssetsModalProps) {
    const [search, setSearch] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

    if (!isOpen) return null; // ✅ parent controls open/close

    const toggleAsset = (asset: Asset) => {
        setSelectedAssets((prev) =>
            prev.some((a) => a.id === asset.id)
                ? prev.filter((a) => a.id !== asset.id)
                : [...prev, asset]
        );
    };

    const handleAdd = () => {
        onAdd(selectedAssets);
        setSelectedAssets([]);
        onClose(); // ✅ close after add
    };

    const filteredAssets = assets.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
        >
            <div
                className="bg-white rounded-lg shadow-2xl flex flex-col"
                style={{ width: "960px", height: "480px" }}
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900">Add Assets</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-6 pb-4 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search"
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none text-gray-700"
                        />
                    </div>

                    {/* Info Banner */}
                    <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            Sub-work orders will be created for each asset.{" "}
                            <span className="text-blue-500 font-medium cursor-pointer hover:underline">
                                Learn More
                            </span>
                        </div>
                    </div>
                </div>

                {/* Assets List */}
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </div>
                                <span className="text-base font-medium text-gray-900">
                                    {asset.name}
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={selectedAssets.some((a) => a.id === asset.id)}
                                onChange={() => toggleAsset(asset)}
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                        {selectedAssets.length === 0
                            ? "No assets selected"
                            : `${selectedAssets.length} asset${selectedAssets.length > 1 ? "s" : ""
                            } selected`}
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="text-blue-500 font-semibold text-sm hover:text-blue-600 px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={selectedAssets.length === 0}
                            style={{
                                padding: "8px 24px",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: selectedAssets.length === 0 ? "not-allowed" : "pointer",
                                backgroundColor: selectedAssets.length === 0 ? "#D1D5DB" : "#3B82F6",
                                color: selectedAssets.length === 0 ? "#6B7280" : "#FFFFFF",
                            }}
                            className="px-6 py-2"
                        >
                            Add Assets
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
