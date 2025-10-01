import { useState } from "react";
import { Search, Info } from "lucide-react";

export default function AssetsPanel({ setPanel }: { setPanel: (p: any) => void }) {
  const [search, setSearch] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<{ id: number; name: string }[]>([]);
  const assets = [
    { id: 1, name: "Generator" },
    { id: 2, name: "Pump" },
    { id: 3, name: "AC Unit" },
    { id: 4, name: "Boiler" },
  ];
  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const toggleAsset = (asset: { id: number; name: string }) => {
    setSelectedAssets((prev) =>
      prev.some((a) => a.id === asset.id)
        ? prev.filter((a) => a.id !== asset.id)
        : [...prev, asset]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Info Banner */}
        <div className="mt-4 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
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
                <span className="text-blue-500 font-bold">{asset.name.charAt(0)}</span>
              </div>
              <span className="text-base font-medium text-gray-900">{asset.name}</span>
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
            : `${selectedAssets.length} asset${selectedAssets.length > 1 ? "s" : ""} selected`}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => setPanel("form")}
            className="text-blue-500 font-semibold text-sm hover:text-blue-600 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log("Added assets:", selectedAssets);
              setPanel("form");
            }}
            disabled={selectedAssets.length === 0}
            className={`px-6 py-2 rounded-md text-sm font-semibold ${
              selectedAssets.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Add Assets
          </button>
        </div>
      </div>
    </div>
  );
}
