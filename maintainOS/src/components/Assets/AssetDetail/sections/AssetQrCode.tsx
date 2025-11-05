import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

export function AssetQrCode({ asset }: { asset: any }) {
  // ✅ Build full QR value for scanning
  const qrValue = asset?.qrCode ? `asset/${asset.qrCode}` : "";

  // ✅ Extract only the part after "/"
  const displayValue = qrValue.split("/").pop() || "";

  // ✅ Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
    toast.success("QR Code copied!");
  };

  return (
    <>
      {qrValue && (
        <div className="border-t mt-4 pt-4">
          {/* Section Title */}
          <h3 className="text-sm font-medium text-gray-700">
            QR Code / Barcode
          </h3>

          {/* Display QR code text */}
          <div className="flex items-center gap-2 mt-2">
            <h4 className="text-sm text-gray-700">{displayValue}</h4>
            <button
              // variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-600 hover:text-gray-800"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>

          {/* QR Code Box */}
          <div className="mt-4 mb-3 flex justify-start">
            <div className="bg-white shadow-md rounded-lg p-2 w-fit border border-gray-200">
              <div className="flex justify-center mb-1">
                <QRCode value={qrValue} size={100} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
