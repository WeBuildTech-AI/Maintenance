import React, { useState } from "react";
import { Settings, X, MapPin, ChevronDown, Loader2 } from "lucide-react";

// --- ADDED ---
// PLEASE UPDATE THIS PATH to point to your actual service file
import { purchaseOrderService } from "../../store/purchaseOrders/purchaseOrders.service";
// -----------

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
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  // State for API errors
  const [error, setError] = useState<string | null>(null);

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

  // === IMMUTABLE HANDLECHANGE FUNCTION ===
  const handleChange = (
    index: number,
    key: keyof ItemState, // Use keyof to ensure key is valid
    value: any
  ) => {
    setItemsState((prevState) =>
      prevState.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [key]: value,
          };
        }
        return item;
      })
    );
  };

  // Calculate total ordered and total received
  const totalOrdered = itemsState.reduce(
    (sum, item) => sum + item.unitCost * item.unitsOrdered,
    0
  );
  const totalReceived = itemsState.reduce(
    (sum, item) => sum + item.unitCost * item.unitsReceived,
    0
  );

  // === UPDATED AND FIXED API HANDLER ===
  const handleOrderUpdate = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors

    const poId = selectedPO?.poNumber;
    if (!poId) {
      setError("Purchase Order ID is missing.");
      setIsLoading(false);
      return;
    }

    try {
      // Create an array of API call promises
      const apiCalls = itemsState.map((itemState, index) => {
        const originalItem = selectedPO.orderItems[index];
        const itemId = itemState.id; // This is the order-item-id

        // Construct the full data payload as requested
        const updatedItemData = {
          // Identifying info from original item
          partId: originalItem.part?.id || originalItem.partId,
          partNumber: originalItem.partNumber,

          // Data from our component's state
          unitCost: itemState.unitCost,
          unitsOrdered: itemState.unitsOrdered,
          unitsReceived: itemState.unitsReceived,
          // location: itemState.location,

          // Recalculated price based on updated cost and *ordered* units
          price: itemState.unitCost * itemState.unitsOrdered,
        };

        // Log data being sent for debugging
        console.log(`Sending data for item ${itemId}:`, updatedItemData);

        return purchaseOrderService
          .updateItemOrder(poId, itemId, updatedItemData)
          .then(async (response: any) => {
            if (!response.ok) {
              // Handle HTTP errors
              const errorData = await response.json().catch(() => ({})); // Try to parse error
              console.error(`Error updating item ${itemId}:`, errorData);
              throw new Error(
                `Failed to update item ${
                  originalItem.partNumber
                }: ${response.statusText}`
              );
            }
            // If response.ok, try to parse JSON
            return response.json();
          })
          .catch((err: any) => {
            // Handle errors from the individual API call
            console.error(`Error in updateItemOrder for ${itemId}:`, err);
            // Re-throw the error to make Promise.all fail
            throw new Error(
              `Failed to update ${originalItem.partNumber}: ${err.message}`
            );
          });
        // --- END OF FIX ---
      });

      // Wait for all API calls to complete
      const results = await Promise.all(apiCalls);
      console.log("All items updated successfully:", results);

      // If all successful, close the modal
      setFullFillModal(false);
    } catch (err: any) {
      // This catch block handles errors from Promise.all (if any promise failed)
      console.error("An error occurred during update:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      // Stop loading regardless of success or error
      setIsLoading(false);
    }
  };

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
            Purchase Order #{selectedPO?.poNumber?.slice(0,6) || "—"} - Approved
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
            const state = itemsState[index];
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
                          disabled={isLoading} // Disable when loading
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unitCost",
                              Math.max(0, parseFloat(e.target.value) || 0)
                            )
                          }
                          className="w-16 text-right text-sm outline-none ml-1 bg-transparent"
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
                          disabled={isLoading} // Disable when loading
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unitsReceived",
                              Math.max(0, parseInt(e.target.value || "0"))
                            )
                          }
                          className="w-16 text-right text-sm outline-none bg-transparent"
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
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-2 py-2">
          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm px-4 pb-2 text-center">
              Error: {error}
            </div>
          )}

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
                  disabled={isLoading} // Disable when loading
                  className="text-sm text-orange-600 px-6 py-2 rounded cursor-pointer hover:bg-orange-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderUpdate}
                  disabled={isLoading} // Disable when loading
                  className="px-6 py-2 bg-orange-600 text-white cursor-pointer rounded text-sm flex items-center gap-2 hover:bg-orange-600 disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>✓</span>
                  )}
                  <span>
                    {isLoading ? "Fulfilling..." : "Confirm and Fulfill"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}