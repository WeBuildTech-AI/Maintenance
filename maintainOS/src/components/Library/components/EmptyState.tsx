export default function EmptyState() {
  return (
    <div className="w-full rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center justify-center px-6 sm:px-10 md:px-16 py-16 md:py-20 text-center">
        {/* Illustration */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="130"
          height="130"
          viewBox="0 0 120 120"
          className="mb-8"
        >
          <g fill="none" stroke="#3B82F6" strokeWidth="2">
            <rect x="24" y="26" width="72" height="88" rx="8" fill="#EFF6FF" />
            <path d="M50 66l10 10 20-20" stroke="#2563EB" strokeWidth="5" />
            <rect
              x="68"
              y="16"
              width="36"
              height="28"
              rx="6"
              strokeDasharray="6 6"
              opacity="0.6"
            />
            <rect
              x="16"
              y="56"
              width="36"
              height="28"
              rx="6"
              strokeDasharray="6 6"
              opacity="0.6"
            />
          </g>
        </svg>

        {/* Copy */}
        <h2 className="mb-3 text-2xl md:text-3xl font-semibold text-gray-900">
          Start adding Procedures to{" "}
          <span className="text-blue-600">webuildtech</span> on{" "}
          <span className="text-blue-600">MaintainOS</span>
        </h2>

        <p className="mx-auto max-w-2xl text-base md:text-lg leading-relaxed text-gray-600">
          Press{" "}
          <span className="font-medium text-blue-600">
            + New Procedure Template
          </span>{" "}
          button above to add your first Procedure and share it with your
          organization!
        </p>
      </div>
    </div>
  );
}