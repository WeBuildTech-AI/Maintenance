import React, { useRef } from "react";
import { Settings, X, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  receiptData: any; // Data for the specific receipt
  poNumber: string;
};

export default function ReceiptModal({
  isOpen,
  onClose,
  receiptData,
  poNumber,
}: Props) {
  // 1. Ref for the content we want to capture
  const contentRef = useRef<HTMLDivElement>(null);

  // 2. React-to-print hook
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Receipt-PO-${poNumber}`,
  });

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "1000px",
          maxWidth: "95vw",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* --- HEADER --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            Partial Receipt for Purchase Order #{poNumber}
          </h1>

          {/* Actions: Download & Close */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => handlePrint()}
              title="Download PDF"
              style={{
                color: "#ea580c", // Orange color to match theme
                cursor: "pointer",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <Download size={20} />
              <span style={{ display: "none" }}>Download</span>{" "}
              {/* Optional text */}
            </button>

            {/* Vertical Divider */}
            <div
              style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb" }}
            ></div>

            <button
              onClick={onClose}
              style={{
                color: "#6b7280",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* --- CONTENT (Scrollable & Printable) --- */}
        {/* We attach the ref here so ONLY this part prints */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
            backgroundColor: "#fff",
          }}
        >
          {/* Print-Only Header (Hidden on screen, Visible in PDF) */}
          <div
            className="print-header"
            style={{ display: "none", marginBottom: "24px" }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Partial Receipt
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Purchase Order #{poNumber}
            </p>
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "#e5e7eb",
                marginTop: "16px",
              }}
            ></div>
          </div>

          {/* Received Items Section */}
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            Received items
          </h2>

          {receiptData?.items.map((item: any, index: number) => {
            const itemTotal = item.receivedQty * item.unitCost;
            const orderCost = item.unitsOrdered * item.unitCost;

            return (
              <div
                key={index}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "24px",
                  marginBottom: "24px",
                  pageBreakInside: "avoid", // Prevents cutting items in half in PDF
                }}
              >
                {/* Top Row: Item Info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    >
                      <Settings size={24} color="#9ca3af" />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#111827",
                          fontSize: "16px",
                        }}
                      >
                        {item.itemName}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        ({item.partNumber})
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        {item.unitsOrdered} Units Ordered &nbsp;|&nbsp;{" "}
                        {item.unitsReceived} Units Received
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "24px" }}>
                    <div style={{ fontSize: "14px", color: "#111827" }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        Order Unit Cost
                      </span>{" "}
                      {formatCurrency(item.unitCost)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#111827" }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        Order Cost
                      </span>{" "}
                      {formatCurrency(orderCost)}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    marginBottom: "16px",
                  }}
                ></div>

                {/* Received Stats */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "48px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "4px",
                      }}
                    >
                      Received
                    </div>
                    <div style={{ fontSize: "14px", color: "#111827" }}>
                      {item.receivedQty}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "4px",
                      }}
                    >
                      Cost
                    </div>
                    <div style={{ fontSize: "14px", color: "#111827" }}>
                      {formatCurrency(itemTotal)}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    marginBottom: "16px",
                  }}
                ></div>

                {/* Total Received Cost for Item */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    Total received cost
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total Receipt Cost Bar */}
          {/* Note: In production code, calculate total from receiptData.items again here if needed, 
              or pass it as prop. I'm inferring it from items loop or pre-calced. */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
              pageBreakInside: "avoid",
            }}
          >
            <span
              style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}
            >
              Total receipt cost
            </span>
            <span
              style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}
            >
              {formatCurrency(
                receiptData.items.reduce(
                  (acc: number, item: any) =>
                    acc + item.receivedQty * item.unitCost,
                  0
                )
              )}
            </span>
          </div>

          {/* Additional Notes */}
          <div style={{ pageBreakInside: "avoid" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Additional notes
            </h2>
            <div
              style={{
                width: "100%",
                minHeight: "100px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                padding: "12px",
                fontSize: "14px",
                color: "#374151",
                backgroundColor: "#fff",
              }}
            >
              {receiptData?.notes || "No notes provided."}
            </div>
          </div>
        </div>
      </div>

      {/* Style for Print Header Visibility */}
      <style>{`
        @media print {
          .print-header {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}