import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ add

interface AddProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProcedureModal({ isOpen, onClose }: AddProcedureModalProps) {
  const navigate = useNavigate(); // ✅

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
    >
      <div
        className="w-[500px] max-w-5xl bg-white rounded-lg shadow-2xl flex flex-col"
        style={{ height: "90vh", maxHeight: "900px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Add Procedure</h2>
          </div>

          {/* ✅ Navigate on click */}
          <button
            onClick={() => {
              onClose(); // close modal
              navigate("/library"); // go to create page
            }}
            className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            <span className="text-xl font-light">+</span>
            <span>Create a New Procedure</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Search bar */}
          <div className="p-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Procedure Templates"
                className="w-full h-12 pl-10 pr-4 text-base border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 placeholder-gray-400 bg-white"
              />
            </div>
          </div>

          {/* Empty State Body */}
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-8 relative">
              <div
                className="absolute inset-0 rounded-2xl transform rotate-3"
                style={{
                  width: "160px",
                  height: "160px",
                  border: "2px dashed #93C5FD",
                  left: "-10px",
                  top: "-10px",
                }}
              ></div>
              <div
                className="relative bg-blue-100 rounded-2xl p-8 flex items-center justify-center"
                style={{ width: "140px", height: "140px" }}
              >
                <svg
                  className="w-20 h-20 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16h.01M8 12h.01"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-4 max-w-3xl">
              Start adding Procedures to webuildtech on MaintainX
            </h3>
            <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
              Press{" "}
              <span
                onClick={() => {
                  onClose();
                  navigate("/procedures/create"); // ✅ same navigation
                }}
                className="text-blue-500 font-medium cursor-pointer hover:underline"
              >
                + Create a New Procedure
              </span>{" "}
              button above to add your first Procedure and share it with your
              organization!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            disabled
            style={{
              padding: "12px 32px",
              borderRadius: "6px",
              backgroundColor: "#E5E7EB",
              color: "#9CA3AF",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "not-allowed",
              border: "none",
            }}
          >
            Add Procedure
          </button>
        </div>
      </div>
    </div>
  );
}
