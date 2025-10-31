import { Settings, X } from "lucide-react";
import React, { useState } from "react";

const PurchaseStockUI = () => {
  const [unitsReceived, setUnitsReceived] = useState(0);
  const [unitCost, setUnitCost] = useState(44);

  const unitsOrdered = 10;
  const price = unitsReceived * unitCost;
  const totalOrdered = unitsOrdered * unitCost;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Purchase Order #2 - Approved
          </h1>
          <button className="hover:bg-blue-700 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Please confirm or edit the items that you have received as well as
            the costs.
          </h2>

          {/* Table Header */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-white border-b">
              <div className="grid grid-cols-5 gap-4 p-4 font-semibold text-gray-700">
                <div>item</div>
                <div className="text-center">Unit Cost</div>
                <div className="text-center">Units Received</div>
                <div className="text-center">Price</div>
                <div className="text-center">Total Price</div>
              </div>
            </div>

            {/* Item Row */}
            <div className="bg-white p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    <Settings size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium">(44)</div>
                    <div className="text-sm text-gray-600">
                      10 Units Ordered
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) =>
                      setUnitCost(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-24 border rounded px-4 py-2 text-center"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="text-center">
                  <input
                    type="number"
                    value={unitsReceived}
                    onChange={(e) =>
                      setUnitsReceived(
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-24 border rounded px-4 py-2 text-center"
                    min="0"
                    max={unitsOrdered}
                  />
                </div>

                <div className="text-center font-medium">
                  ${price.toFixed(2)}
                </div>

                <div className="text-center font-medium">
                  ${totalOrdered.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-end gap-8 text-lg mb-4">
              <div className="font-semibold">Total received</div>
              <div className="font-semibold w-24 text-right">
                ${price.toFixed(2)}
              </div>
            </div>
            <div className="flex justify-end gap-8 text-lg">
              <div className="font-semibold">Total ordered</div>
              <div className="font-semibold w-24 text-right">
                ${totalOrdered.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-gray-600 max-w-md">
              By fulfilling this Purchase Order we will update your parts
              Inventory with the Parts you have received.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-2 text-blue-600 font-semibold hover:bg-gray-100 rounded">
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 rounded flex items-center gap-2">
                <span>✓</span>
                <span>Confirm and Fulfill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
