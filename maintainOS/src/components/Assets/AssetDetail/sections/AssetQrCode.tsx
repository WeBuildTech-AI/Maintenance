import QRCode from "react-qr-code";

export function AssetQrCode({ asset }: { asset: any }) {
  return (
    <>
      {asset.qrCode && (
        <div className="border-t">
          <h3 className="text-sm mt-4 font-medium text-gray-700">
            QR Code/Barcode
          </h3>
          {asset.qrCode && (
            <>
              <h4 className="text-sm mt-2 text-gray-700">{asset?.qrCode}</h4>
              <div className="mt-2 mb-3 flex justify-start">
                <div className="bg-white shadow-md rounded-lg p-2 w-fit border border-gray-200">
                  <div className="flex justify-center mb-1 ro">
                    <QRCode value={asset.qrCode} size={100} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
