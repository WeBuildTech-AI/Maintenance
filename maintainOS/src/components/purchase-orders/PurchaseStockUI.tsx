import React, { useState } from "react";
import { Settings, X, MapPin, ChevronDown, Trash2 } from "lucide-react";

type Props = {
  setFullFillModal: (v: boolean) => void;
  selectedPO?: any;
};

export default function PurchaseStockUI({
  setFullFillModal,
  selectedPO,
}: Props) {
  // item-level state
  const [unitCost, setUnitCost] = useState<number>(23);
  const [unitsOrdered] = useState<number>(1); // as per screenshot
  const [unitsReceived, setUnitsReceived] = useState<number>(0);

  // location rows (simple single-row demo like image)
  const [location, setLocation] = useState<string>("General");

  const price = unitCost * unitsReceived;
  const totalOrdered = unitCost * unitsOrdered;
  const subtotal = price; // if multiple locations/item rows you would sum them

  return (
    // backdrop
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      {/* modal shell */}
      <div className="relative  w-200 overflow-y-auto bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* top blue header bar like screenshot */}
        <div className="bg-[#1E90FF]  flex items-center justify-center px-4">
          <div className="absolute left-4 text-sm"></div>
          <div className="text-sm p-2 text-black font-medium">
            Purchase Order #7 - Approved
          </div>

          {/* <button
            aria-label="Close"
            onClick={() => setFullFillModal(false)}
            className="absolute text-black right-3 top-1/2 -translate-y-1/2 p-1 "
          >
            <X size={18} />
          </button> */}
        </div>

        {/* content area (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm font-semibold mb-6">
            Please confirm or edit the items that you have received as well as
            the costs.
          </h2>

          {/* card with item & locations */}
          <div className="border rounded-lg overflow-hidden">
            {/* item header row */}
            <div className="px-6 py-4 flex items-start justify-between gap-4 border-b">
              {/* left: item meta */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded border">
                  <Settings size={20} className="text-gray-500" />
                </div>
                <div>
                  <div className="font-medium">
                    {selectedPO?.orderItems.itemName}
                  </div>
                  <div className="text-sm text-gray-500">(234)</div>
                  <div className="text-sm text-gray-500">1 Unit Ordered</div>
                </div>
              </div>

              {/* right: Unit Cost + Total Price (aligned like screenshot) */}
              <div className="flex items-center gap-6">
                <div className="text-sm text-gray-600">Unit Cost</div>
                <div>
                  <div className="flex items-center border rounded px-2 py-1 bg-white">
                    <span className="mr-2 text-sm">$</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={unitCost}
                      onChange={(e) =>
                        setUnitCost(
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      className="w-20 text-right text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Total Price{" "}
                  <div className="font-medium">${totalOrdered.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* locations / units received / price rows */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* left: Locations (col-span 6) */}
                <div className="col-span-7">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Locations
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="relative">
                          <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded px-4 py-2 pr-10 bg-white text-sm appearance-none"
                          >
                            <option value="General">General</option>
                            <option value="Warehouse A">Warehouse A</option>
                            <option value="Warehouse B">Warehouse B</option>
                          </select>

                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <ChevronDown size={16} className="text-gray-400" />
                          </div>

                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <MapPin size={16} />
                          </div>

                          {/* left padding to avoid overlapping pin */}
                          <style>{`.purchase-select select { padding-left: 2.25rem; }`}</style>
                        </div>
                      </div>
                      {/* Units Received */}
                      <div className="w-36">
                        <label className="text-sm font-medium text-gray-700 block mb-2 text-center">
                          Units Received
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={unitsOrdered}
                          value={unitsReceived}
                          onChange={(e) =>
                            setUnitsReceived(
                              Math.max(0, parseInt(e.target.value || "0"))
                            )
                          }
                          className="w-full border rounded px-3 py-2 text-center"
                        />
                      </div>

                      {/* Price */}
                      <div className="w-36">
                        <label className="text-sm font-medium text-gray-700 block mb-2 text-center">
                          Price
                        </label>
                        <div className="text-center font-medium">
                          ${price.toFixed(2)}
                        </div>
                      </div>

                      {/* remove icon */}
                      <div className="w-8 flex justify-end">
                        <button className="p-1 rounded hover:bg-gray-100">
                          <Trash2 size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* + Add location link */}
                    <button className="text-blue-600 text-sm font-medium self-start">
                      + Add location
                    </button>
                  </div>
                </div>

                {/* right: empty spacer or any extra content (col-span 5) */}
                <div className="col-span-5 flex items-start justify-end">
                  {/* could place per-item notes / images etc */}
                </div>
              </div>
            </div>

            {/* subtotal bar inside card */}
            <div className="px-6 py-4 border-t flex justify-end items-center">
              <div className="text-sm text-gray-600 mr-6">Subtotal</div>
              <div className="font-medium">${subtotal.toFixed(2)}</div>
            </div>
          </div>

          {/* roomy bottom spacing so footer doesn't overlap content */}
          <div className="h-28" />
        </div>

        {/* fixed footer (like screenshot) */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 max-w-md">
            By fulfilling this Purchase Order we will update your parts
            Inventory with the Parts you have received.
          </p>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total received</div>
              <div className="font-medium">${subtotal.toFixed(2)}</div>
            </div>

            <div className="text-right mr-4">
              <div className="text-sm text-gray-600">Total ordered</div>
              <div className="font-medium">${totalOrdered.toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFullFillModal(false)}
                className="text-sm text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2 hover:bg-blue-700">
                <span>✓</span>
                <span>Confirm and Fulfill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------
  Usage example in a parent component:
----------------------------------*/

// Example parent to open modal:
// import React, { useState } from "react";
// import PurchaseStockUI from "./PurchaseStockUI";

// export default function MainComponent() {
//   const [fullFillModal, setFullFillModal] = useState(false);

//   return (
//     <div className="p-6">
//       <button
//         onClick={() => setFullFillModal(true)}
//         className="px-6 py-2 bg-blue-600 text-white rounded"
//       >
//         Open Purchase Modal
//       </button>

//       {fullFillModal && <PurchaseStockUI setFullFillModal={setFullFillModal} />}
//     </div>
//   );
// }
