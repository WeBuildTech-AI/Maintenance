"use client";

export function AddressAndDescription() {
  return (
    <>
      {/* Address */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">Address</label>
        <input
          type="text"
          placeholder="Enter address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">Description</label>
        <textarea
          placeholder="Add a description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
    </>
  );
}
