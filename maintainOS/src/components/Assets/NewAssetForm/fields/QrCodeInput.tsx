import { useState } from "react";

export function QrCodeInput() {
  const [qrCodeValue, setQrCodeValue] = useState("");

  return (
    <div className="mt-4">
      <label className="mb-2 block text-sm font-medium text-gray-900">
        QR Code/Barcode
      </label>
      <input
        type="text"
        value={qrCodeValue}
        onChange={(e) => setQrCodeValue(e.target.value)}
        placeholder="Enter or scan code"
        className="w-full h-12 px-4 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
      />
      <div className="mt-2">
        <span className="text-gray-900 text-sm">or </span>
        <span className="text-orange-600 text-sm cursor-pointer hover:underline">
          Generate Code
        </span>
      </div>
    </div>
  );
}
