import React, { useState } from "react";
import { Settings, X, MapPin, ChevronDown } from "lucide-react";

type Props = {
  setFullFillModal: (v: boolean) => void;
  selectedPO?: any;
};

// Define a type for the state
interface ItemState {
  id: any;
  unitCost: number;
  unitsOrdered: number;
  unitsReceived: number;
  location: string;
}

export default function PurchaseStockUI({
  setFullFillModal,
  selectedPO,
}: Props) {
  // Initialize state for each order item dynamically
  const [itemsState, setItemsState] = useState<ItemState[]>(
    selectedPO?.orderItems?.map(
      (item: any): ItemState => ({
        id: item.id,
        unitCost: parseFloat(item.unitCost) || 0,
        unitsOrdered: item.unitsOrdered || 0,
        unitsReceived: 0, // Default to 0
        location: "General",
      })
    ) || []
  );

  // === UPDATED IMMUTABLE HANDLECHANGE FUNCTION ===
  const handleChange = (
    index: number,
    key: keyof ItemState, // Use keyof to ensure key is valid
    value: any
  ) => {
    setItemsState((prevState) =>
      // Map over the previous state to create a new array
      prevState.map((item, i) => {
        // If this is the item we want to update...
        if (i === index) {
          // ...return a new object with the updated value
          return {
            ...item,
            [key]: value,
          };
        }
        // Otherwise, return the item as-is
        return item;
      })
    );
  };
  // === END OF UPDATE ===

  // Calculate total ordered and total received
  const totalOrdered = itemsState.reduce(
    (sum, item) => sum + item.unitCost * item.unitsOrdered,
    0
  );
  const totalReceived = itemsState.reduce(
    (sum, item) => sum + item.unitCost * item.unitsReceived,
    0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      <div className="relative w-200 bg-white rounded-lg shadow-lg flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="bg-orange-600 flex items-center justify-center px-1 py-2 relative rounded-t-lg">
          <div className="text-black text-center font-medium">
            Purchase Order #{selectedPO?.id?.slice(0, 6) || "—"} - Approved
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-base font-normal mb-6">
            Please confirm or edit the items that you have received as well as
            the costs.
          </h2>

          {/* Map through order items */}
          {selectedPO?.orderItems?.map((item: any, index: number) => {
            // Get the state for this specific item
            const state = itemsState[index];
            
            // If state doesn't exist for some reason, don't render
            if (!state) return null; 

            const itemTotal = state.unitCost * state.unitsOrdered;

            return (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden mb-6"
              >
                {/* Item header */}
                <div className="px-6 py-4 flex items-start justify-between border-b bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded border">
                      <Settings size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {item.itemName || item.part?.name || "Unnamed Item"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Part #{item.partNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.unitsOrdered} Unit Ordered
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 mr-4">
                      <span className="text-sm text-gray-600">Unit Cost</span>
                      <div className="flex items-center border rounded px-3 py-1.5 bg-white">
                        <span className="text-sm text-gray-600">$</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={state.unitCost}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unitCost",
                              Math.max(0, parseFloat(e.target.value) || 0)
                            )
                          }
                          className="w-16 text-right text-sm outline-none ml-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Units Received
                      </span>
                      <div className="flex items-center border rounded px-3 py-1.5 bg-white">
                        <input
                          type="number"
                          min={0}
                          max={state.unitsOrdered}
                          step="1"
                          value={state.unitsReceived}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unitsReceived",
                              Math.max(0, parseInt(e.target.value || "0"))
                            )
                          }
                          className="w-16 text-right text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total Price</div>
                      <div className="font-semibold">
                        ${itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commented out Locations row */}
                {/* ... */}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-2 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 w-64 max-w-md">
              By fulfilling this Purchase Order we will update your parts
              Inventory with the Parts you have received.
            </p>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total received</div>
                <div className="font-semibold">${totalReceived.toFixed(2)}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600">Total ordered</div>
                <div className="font-semibold">${totalOrdered.toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFullFillModal(false)}
                  className="text-sm text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2 hover:bg-blue-700">
                  <span>✓</span>
                  <span>Confirm and Fulfill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}