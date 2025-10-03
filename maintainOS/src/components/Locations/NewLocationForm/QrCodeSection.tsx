"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export function QrCodeSection({ qrCode, setQrCode }) {
  const [inputdisable, setInputDisable] = useState(false);
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-900">
        QR Code/Barcode
      </label>
      <input
        value={inputdisable ? "Barcode will be Generated" : qrCode}
        disabled={inputdisable}
        onChange={(e) => setQrCode(e.target.value)}
        type="text"
        placeholder="Enter or scan code"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">or</span>

        {inputdisable ? (
          <button
            className="text-sm text-orange-600 hover:text-orange-700 cursor-pointer underline"
            onClick={() => {
              setInputDisable(false);
              setQrCode("");
            }} // enable input
          >
            Input Manually
          </button>
        ) : (
          <button
            className="text-sm text-orange-600 hover:text-orange-700 cursor-pointer underline"
            onClick={() => {
              setQrCode(Math.random().toString(36).slice(2, 10)); // generate
              setInputDisable(true);
              // disable input
            }}
          >
            Generate Code
          </button>
        )}
      </div>

      {qrCode && (
        <div className="mt-6 flex justify-start">
          <div className="bg-white shadow-md rounded-lg p-2 w-fit border border-gray-200">
            <div className="flex justify-center mb-1 ro">
              <QRCode value={qrCode} size={120} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
