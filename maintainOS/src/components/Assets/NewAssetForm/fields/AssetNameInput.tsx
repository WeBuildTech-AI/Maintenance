interface AssetNameInputProps {
  assetName: string;
  setAssetName: (val: string) => void;
  error?: string;
}

export function AssetNameInput({ assetName, setAssetName, error }: AssetNameInputProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        value={assetName}
        onChange={(e) => setAssetName(e.target.value)}
        placeholder="Enter Asset Name (Required)"
        className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
