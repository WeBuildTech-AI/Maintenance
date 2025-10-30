import React from "react";
import { type PurchaseOrder } from "./po.types"; // Aapke types file ka path
import { addressToLine, formatMoney } from "./helpers"; // Aapke helpers ka path

interface PurchaseOrderPDFProps {
  po: PurchaseOrder;
}

// Yeh component 'id' ke through target kiya jayega
export const PurchaseOrderPDF: React.FC<PurchaseOrderPDFProps> = ({ po }) => {
  if (!po) return null;

  // Totals calculate karein
  const subtotal =
    po.orderItems?.reduce(
      (acc, it) => acc + (it.price || it.unitCost * it.unitsOrdered),
      0
    ) ?? 0;
  const total = subtotal + (po.extraCosts ?? 0);

  return (
    <div
      id="po-pdf-content" // <-- YEH ID IMPORTANT HAI
      className="bg-white p-8 w-[210mm]" // A4 size width
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Order</h1>
        <span className="text-lg">#{po.poNumber}</span>
      </div>

      {/* Logo aur Info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          {/* Aap yahaan apna logo <img /> se laga sakte hain */}
          <span className="text-3xl font-bold text-blue-600">X</span>
          <span className="text-xl font-semibold">webuildtech</span>
        </div>
      </div>

      {/* Status, Due Date, Vendor */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Status
          </p>
          <p className="font-medium text-lg">{po.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Due Date
          </p>
          <p className="font-medium text-lg">
            {new Date(po.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Vendor Information
          </p>
          <p className="font-medium text-lg">{po.vendor?.name || "-"}</p>
        </div>
      </div>

      {/* Ship To / Bill To */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Ship To
          </p>
          <div className="font-medium">{addressToLine(po.shippingAddress)}</div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Bill To
          </p>
          <div className="font-medium">
            {addressToLine(po.billingAddress || po.shippingAddress)}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-4">
        <thead className="border-b-2 border-gray-300">
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
            <th className="pb-2">Name</th>
            <th className="pb-2">Part #</th>
            <th className="pb-2 text-right">Qty</th>
            <th className="pb-2 text-right">Received</th>
            <th className="pb-2 text-right">Unit Cost</th>
            <th className="pb-2 text-right">Cost Ordered</th>
          </tr>
        </thead>
        <tbody>
          {po.orderItems?.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2">
                {item.itemName || item.part?.name || "-"}
              </td>
              <td className="py-2">
                {item.partNumber || item.part?.partNumber || "-"}
              </td>
              <td className="py-2 text-right">{item.unitsOrdered}</td>
              <td className="py-2 text-right">-</td>{" "}
              {/* Placeholder for received */}
              <td className="py-2 text-right">{formatMoney(item.unitCost)}</td>
              <td className="py-2 text-right font-medium">
                {formatMoney(item.price || item.unitCost * item.unitsOrdered)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end text-sm mb-6">
        <div className="w-1/3">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Taxes & Costs</span>
            <span className="font-medium">
              {formatMoney(po.extraCosts ?? 0)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-300 mt-1">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatMoney(total)}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      {po.notes && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Note
          </p>
          <p className="text-sm">{po.notes}</p>
        </div>
      )}
    </div>
  );
};
