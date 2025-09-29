export function SerialNumberInput({ serialNumber, setSerialNumber }) {
  return (
    <div className="mt-4">
      <h3 className="mb-4 text-base font-medium text-gray-900">
        Serial Number
      </h3>
      <div className="relative">
        <input
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          type="text"
          placeholder="Serial Number"
          className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
        />
      </div>
    </div>
  );
}
