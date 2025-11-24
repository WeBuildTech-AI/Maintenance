import { useState, useRef } from "react";
import { X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas"; 

interface SignatureRunnerProps {
  value: string | null;
  onChange: (val: string | null) => void;
}

export function SignatureRunner({ value, onChange }: SignatureRunnerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sigCanvas = useRef<any>({});

  const handleSave = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      onChange(dataURL);
      setIsModalOpen(false);
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full border-2 border-dashed border-gray-300 rounded-md mt-2 min-h-[120px] flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors relative overflow-hidden bg-white group"
      >
        {value ? (
          <img src={value} alt="Signature" className="max-h-[110px] object-contain p-2" />
        ) : (
          <span className="text-gray-400 italic group-hover:text-blue-500 transition-colors">Tap to sign</span>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[2147483647] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Sign below:</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="bg-gray-50 p-6 flex-1 min-h-[350px] flex items-center justify-center">
              <div className="bg-white shadow-sm border border-gray-200 w-full h-full rounded-lg overflow-hidden cursor-crosshair">
                <SignatureCanvas ref={sigCanvas} penColor="black" backgroundColor="white" canvasProps={{ className: "w-full h-[350px]" }} />
              </div>
            </div>
            <div className="flex justify-end items-center gap-4 px-6 py-4 border-t border-gray-100 bg-white">
              <button onClick={handleClear} className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors px-2">Clear</button>
              <button onClick={handleSave} className="bg-blue-600 text-white font-medium text-sm px-8 py-2.5 rounded-md hover:bg-blue-700 shadow-sm transition-all active:scale-95">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}