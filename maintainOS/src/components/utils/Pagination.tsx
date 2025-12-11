export type PaginationProps = {
  startIndex: number;
  endIndex: number;
  totalItems: number;
  currentPage: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
};

export const Pagination = ({
  startIndex,
  endIndex,
  totalItems,
  currentPage,
  handlePrevPage,
  handleNextPage,
}: PaginationProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "8px 12px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          border: "1px solid #fbbf24",
          borderRadius: "999px",
          padding: "4px 12px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#374151",
        }}
      >
        <span>
          {startIndex + 1} – {endIndex} of {totalItems}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              background: "none",
              border: "none",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.3 : 1,
              padding: "2px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={handleNextPage}
            disabled={endIndex >= totalItems}
            style={{
              background: "none",
              border: "none",
              cursor: endIndex >= totalItems ? "not-allowed" : "pointer",
              opacity: endIndex >= totalItems ? 0.3 : 1,
              padding: "2px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
