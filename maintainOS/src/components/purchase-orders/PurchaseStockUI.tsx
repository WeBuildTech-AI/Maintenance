import React, { useState } from "react";
import { Settings, X, Loader2 } from "lucide-react";
import { purchaseOrderService } from "../../store/purchaseOrders/purchaseOrders.service";
import toast from "react-hot-toast";

type Props = {
  setFullFillModal: (v: boolean) => void;
  selectedPO?: any;
  fetchPurchaseOrder?: () => void;
};

interface ItemState {
  id: any;
  unitCost: number;
  unitsOrdered: number;
  previousReceived: number;
  receivingNow: number | "";
  location: string;
}

export default function PurchaseStockUI({
  setFullFillModal,
  selectedPO,
  fetchPurchaseOrder,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(selectedPO?.notes || "");

  const [itemsState, setItemsState] = useState<ItemState[]>(
    selectedPO?.orderItems?.map(
      (item: any): ItemState => ({
        id: item.id,
        unitCost: parseFloat(item.unitCost) || 0,
        unitsOrdered: item.unitsOrdered || 0,
        previousReceived: item.unitsReceived || 0,
        receivingNow: 0,
        location: "General",
      })
    ) || []
  );

  const handleChange = (index: number, field: keyof ItemState, value: any) => {
    setItemsState((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const totalReceivingCost = itemsState.reduce((sum, item) => {
    const qty = item.receivingNow === "" ? 0 : item.receivingNow;
    return sum + qty * item.unitCost;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const apiCalls = itemsState.map((itemState, index) => {
        const originalItem = selectedPO.orderItems[index];
        const receivingNow =
          itemState.receivingNow === "" ? 0 : itemState.receivingNow;
        const newTotalReceived = itemState.previousReceived + receivingNow;

        const updatedItemData = {
          partId: originalItem.part?.id || originalItem.partId,
          partNumber: originalItem.partNumber,
          unitCost: itemState.unitCost,
          unitsOrdered: itemState.unitsOrdered,
          unitsReceived: newTotalReceived,
          price: itemState.unitCost * itemState.unitsOrdered,
        } as any;

        return purchaseOrderService.updateItemOrder(
          selectedPO.id,
          itemState.id,
          updatedItemData
        );
      });

      await Promise.all(apiCalls);
      await purchaseOrderService.fullfillPurchaseOrder(selectedPO.id);

      toast.success("Purchase Order updated successfully");
      if (fetchPurchaseOrder) await fetchPurchaseOrder();
      setFullFillModal(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fulfill order.");
    } finally {
      setIsLoading(false);
    }
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
          width: "1000px", // Fixed wide width as per layout
          maxWidth: "95vw",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          maxHeight: "900px",
          overflow: "hidden",
        }}
      >
        {/* --- HEADER --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}
          >
            Partial Receipt for Purchase Order #{selectedPO?.poNumber}
          </h1>
          <button
            onClick={() => setFullFillModal(false)}
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

        {/* --- CONTENT AREA --- */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
            backgroundColor: "#fff",
          }}
        >
          {/* 1. Received Items Section */}
          <section style={{ marginBottom: "32px" }}>
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

            {selectedPO?.orderItems?.map((item: any, index: number) => {
              const state = itemsState[index];
              const receivingQty =
                state.receivingNow === "" ? 0 : state.receivingNow;
              const lineCost = receivingQty * state.unitCost;
              const orderCost = state.unitsOrdered * state.unitCost;

              return (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "24px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* Top Row: Item Info & Order Costs */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "24px",
                    }}
                  >
                    {/* Left: Info */}
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
                          {item.itemName || item.part?.name}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          ({item.partNumber || item.part?.partNumber})
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          {state.unitsOrdered} Units Ordered &nbsp;|&nbsp;{" "}
                          {state.previousReceived} Units Received
                        </div>
                      </div>
                    </div>

                    {/* Right: Order Costs */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#374151",
                          }}
                        >
                          Order Unit Cost
                        </span>
                        <div
                          style={{
                            backgroundColor: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            color: "#4b5563",
                            fontSize: "14px",
                            fontWeight: 500,
                            minWidth: "80px",
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(state.unitCost)}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        Order Cost{" "}
                        <span style={{ fontWeight: 500 }}>
                          {formatCurrency(orderCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      borderTop: "1px solid #f3f4f6",
                      marginBottom: "24px",
                    }}
                  ></div>

                  {/* Middle Row: Inputs */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "32px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#374151",
                          marginBottom: "6px",
                          textAlign: "right",
                        }}
                      >
                        Receiving Now
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={state.receivingNow}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "receivingNow",
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value)
                          )
                        }
                        // ✅ Replaced blue focus with orange focus
                        className="block rounded-md border border-gray-300 px-3 py-2 text-right text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-900"
                        style={{
                          display: "block",
                          width: "120px",
                          // borderRadius: "6px",
                          // border: "1px solid #d1d5db",
                          // padding: "8px 12px",
                          // textAlign: "right",
                          // fontSize: "14px",
                          // outline: "none",
                          // color: "#111827",
                        }}
                      />
                    </div>
                    <div style={{ textAlign: "right", minWidth: "80px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#374151",
                          marginBottom: "8px",
                        }}
                      >
                        Cost
                      </label>
                      <div style={{ fontSize: "14px", color: "#111827" }}>
                        {formatCurrency(lineCost)}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      borderTop: "1px solid #f3f4f6",
                      marginTop: "24px",
                      marginBottom: "16px",
                    }}
                  ></div>

                  {/* Bottom Row: Item Total */}
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
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Total received cost
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {formatCurrency(lineCost)}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 2. Summary Section */}
          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "16px",
              }}
            >
              Summary
            </h2>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#6b7280",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Item Name
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#6b7280",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Receiving Now
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#6b7280",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Unit Cost
                    </th>
                    <th
                      style={{
                        padding: "12px 24px",
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#6b7280",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      Total Cost
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "#fff" }}>
                  {selectedPO?.orderItems?.map((item: any, index: number) => {
                    const state = itemsState[index];
                    const qty =
                      state.receivingNow === "" ? 0 : state.receivingNow;
                    const total = qty * state.unitCost;

                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #f3f4f6" }}
                      >
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                              }}
                            >
                              <Settings size={16} color="#9ca3af" />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 500,
                                  color: "#111827",
                                  fontSize: "14px",
                                }}
                              >
                                {item.itemName}
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                {item.partNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 24px",
                            color: "#4b5563",
                            fontSize: "14px",
                          }}
                        >
                          {qty}
                        </td>
                        <td
                          style={{
                            padding: "16px 24px",
                            textAlign: "right",
                            color: "#4b5563",
                            fontSize: "14px",
                          }}
                        >
                          {formatCurrency(state.unitCost)}
                        </td>
                        <td
                          style={{
                            padding: "16px 24px",
                            textAlign: "right",
                            fontWeight: 500,
                            color: "#111827",
                            fontSize: "14px",
                          }}
                        >
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total Row */}
                  <tr>
                    <td
                      style={{
                        padding: "24px 24px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    ></td>
                    <td
                      style={{
                        padding: "24px 24px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Total
                    </td>
                    <td style={{ padding: "24px 24px" }}></td>
                    <td
                      style={{
                        padding: "24px 24px",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#111827",
                        fontSize: "16px",
                      }}
                    >
                      {formatCurrency(totalReceivingCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Additional Notes Section */}
          <section>
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
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              // ✅ Replaced blue focus with orange focus
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
              placeholder="Enter any additional notes here..."
            />
          </section>
        </div>

        {/* --- FOOTER --- */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              maxWidth: "500px",
            }}
          >
            By fulfilling this Purchase Order we will update your parts
            Inventory with the Parts you have received.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setFullFillModal(false)}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                // ✅ Changed from blue (#2563eb) to orange (#ea580c)
                color: "#ea580c",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                // ✅ Changed from blue (#2563eb) to orange (#ea580c)
                backgroundColor: "#ea580c",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                padding: "10px 24px",
                borderRadius: "6px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}