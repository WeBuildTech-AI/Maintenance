"use client";

export function QrCodeSection() {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">QR Code/Barcode</label>
      <input
        type="text"
        placeholder="Enter or scan code"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">or</span>
        <button className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline">
          Generate Code
        </button>
      </div>
    </div>
  );
}
