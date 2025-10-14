import { ChevronLeft } from "lucide-react";
import React from "react";

export interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface EditUserProps {
  formData: FormData;
  setViewMode: (mode: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResend: () => void;
  handleUpdate: () => void;
  loading: boolean;
}

const EditUser: React.FC<EditUserProps> = ({
  formData,
  setViewMode,
  handleInputChange,
  handleResend,
  handleUpdate,
  loading,
}) => {
  return (
    <div className="flex-col border p-4 bg-white mb-3">
      <div className="max-w-4xl mx-auto bg-white">
        <div className="flex items-center gap-3 py-5 border-b border-gray-200">
          <button
            onClick={() => setViewMode("RecentActivity")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-normal text-gray-900">Edit Account</h1>
        </div>

        <div className="px-6 py-8">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full border-orange-600 border bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden"></div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-2 ">
                <div>
                  <label className="block text-sm font-normal text-gray-900 mb-2">
                    First Name{" "}
                    <span className="text-gray-500 font-normal">
                      (required)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    // ✨ FIX 5: Bind value to formData state
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-normal text-gray-900 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    // ✨ FIX 5: Bind value to formData state
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Phone Number{" "}
                <span className="text-gray-500 font-normal">(required)</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                // ✨ FIX 5: Bind value to formData state
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-orange-500 mb-2">
                Email{" "}
                <span className="text-gray-500 font-normal">(required)</span>
              </label>
              <input
                type="email"
                name="email"
                // ✨ FIX 5: Bind value to formData state
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border-2 border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-600"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-orange-500 text-sm font-normal">
                  Email is not verified
                </span>
                <span className="text-sm text-gray-600">
                  Verification email sent.{" "}
                  <button
                    onClick={handleResend}
                    className="text-blue-600 hover:text-blue-700 font-normal"
                  >
                    Resend
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 flex justify-end pt-2">
          <button
            onClick={handleUpdate}
            disabled={loading} // ✨ Bonus: Disable button while loading
            className="px-3 py-2 mt-2 text-sm bg-orange-600 text-white rounded-md font-normal hover:bg-orange-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
