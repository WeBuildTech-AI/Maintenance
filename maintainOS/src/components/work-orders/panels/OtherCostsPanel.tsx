"use client";

import { ArrowLeft, Plus, Trash } from "lucide-react";
import { useState } from "react";

export default function OtherCostsPanel({ onCancel }: any) {
  const [costs, setCosts] = useState<{ item: string; amount: string }[]>([
    { item: "", amount: "" },
  ]);

  const handleAddCost = () => setCosts([...costs, { item: "", amount: "" }]);
  const handleRemove = (i: number) =>
    setCosts(costs.filter((_, index) => index !== i));

  const handleChange = (i: number, field: string, value: string) => {
    const updated = [...costs];
    (updated[i] as any)[field] = value;
    setCosts(updated);
  };

  const handleSave = () => {
    console.log("✅ Costs saved:", costs);
    onCancel();
  };

  return (
    <div
      className="flex flex-col bg-white border-l shadow-sm"
      style={{ height: "calc(100vh - 135px)" }} // ✅ Full screen height
    >
      {/* ✅ Fixed Header */}
      <div className="flex-none flex items-center justify-between p-4 border-b bg-white sticky top-0 z-20">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-medium text-gray-900">Other Costs Overview</h2>
        <div />
      </div>

      {/* ✅ Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {costs.map((cost, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border rounded-md p-3 bg-gray-50"
          >
            <input
              value={cost.item}
              onChange={(e) => handleChange(index, "item", e.target.value)}
              placeholder="Expense Type"
              className="flex-1 border rounded-md px-2 py-1 text-sm"
            />
            <input
              value={cost.amount}
              onChange={(e) => handleChange(index, "amount", e.target.value)}
              placeholder="Amount"
              className="w-32 border rounded-md px-2 py-1 text-sm"
            />
            <button
              onClick={() => handleRemove(index)}
              className="p-2 text-gray-500 hover:text-red-600"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddCost}
          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
        >
          <Plus className="h-4 w-4" /> Add another cost
        </button>
      </div>

      {/* ✅ Fixed Footer */}
      <div className="flex-none border-t p-4 flex justify-end bg-white sticky bottom-0 z-20">
        <button
          onClick={handleSave}
          className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
        >
          Save Costs
        </button>
      </div>
    </div>
  );
}
