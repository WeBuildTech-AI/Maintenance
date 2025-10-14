import { useState } from "react";
import { X, Camera, ChevronDown } from "lucide-react";

interface RecordReadingModalProps {
  modalRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  //   onConfirm: (readingData: { value: string; date: string }) => void;
}

export default function RecordReadingModal({
  //   onConfirm,
  modalRef,
  onClose,
}: RecordReadingModalProps) {
  const [meterValue, setMeterValue] = useState("");
  const [unit, setUnit] = useState("Kilometers");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const units = ["Kilometers", "Meters", "Miles", "Liters", "Cubic Meters"];

  const handleSubmit = () => {
    console.log("Submitting:", { meterValue, unit });
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl w-130 max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Meter Reading</h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Submit New Meter Value
          </label>

          <div className="relative flex items-center border-2 border-blue-500 rounded-md overflow-hidden mb-6">
            <input
              type="number"
              placeholder="Last Reading: 23 Kilometers"
              value={meterValue}
              onChange={(e) => setMeterValue(e.target.value)}
              className="flex-1 px-3 py-2 outline-none text-gray-700 placeholder-gray-400"
            />

            {/* Unit Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 border-l border-gray-300"
              >
                {unit}
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {showUnitDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {units.map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setUnit(u);
                        setShowUnitDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Pictures/Files */}
          <div className="border-2 border-dashed border-orange-600 rounded-md p-6 flex flex-col items-center justify-center bg-blue-50 bg-opacity-30">
            <div className="mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera size={24} className="text-orange-600" />
              </div>
            </div>
            <button className="text-orange-600 font-medium text-sm">
              Add Pictures/Files
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 cursor-pointer text-orange-600 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-orange-600 cursor-pointer text-black rounded-md hover:bg-gray-400 font-medium transition-colors disabled:opacity-50"
            disabled={!meterValue}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
