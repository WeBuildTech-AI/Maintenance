import { Calendar, DollarSign, Paperclip, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { formatMoney } from "./helpers";
import { mockVendors, type NewPOFormProps } from "./po.types";





export function NewPOForm(props: NewPOFormProps) {
  const {
    newPO, setNewPO, newPOSubtotal, newPOTotal,
    addNewPOItemRow, removePOItemRow, updateItemField,
    createPurchaseOrder, onCancel
  } = props;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header (fixed in right pane) */}
      <div className="p-6 border-b flex items-center justify-between flex-none">
        <h2 className="text-xl font-medium">New Purchase Order</h2>
      </div>

      {/* Body (single scroll area) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] p-6 space-y-10">
          {/* Vendor */}
          <section>
            <div className="text-base font-medium mb-4">Vendor</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Select
                  value={newPO.vendorId}
                  onValueChange={(val: string) => setNewPO((s) => ({ ...s, vendorId: val }))}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select a Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                PO Number will be generated automatically.
              </div>
            </div>

            {/* Order Items */}
            <div className="text-base font-medium mb-3">Order Items</div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 w-[38%]">Item Name</th>
                    <th className="p-3 w-[20%]">Part Number</th>
                    <th className="p-3 w-[14%]">Units Ordered</th>
                    <th className="p-3 w-[14%]">Unit Cost</th>
                    <th className="p-3 w-[14%]">Price</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {newPO.items.map((it) => {
                    const price = (Number(it.quantity) || 0) * (Number(it.unitCost) || 0);
                    return (
                      <tr key={it.id} className="border-t">
                        <td className="p-3">
                          <Input
                            className="h-9 text-sm"
                            placeholder="Start typing…"
                            value={it.itemName}
                            onChange={(e) => updateItemField(it.id, "itemName", e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            className="h-9 text-sm"
                            placeholder="e.g. #12345"
                            value={it.partNumber ?? ""}
                            onChange={(e) => updateItemField(it.id, "partNumber", e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            className="h-9 text-sm"
                            type="number"
                            min={0}
                            value={it.quantity}
                            onChange={(e) => updateItemField(it.id, "quantity", Number(e.target.value))}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">$</span>
                            <Input
                              className="h-9 text-sm"
                              type="number"
                              min={0}
                              step="0.01"
                              value={it.unitCost}
                              onChange={(e) => updateItemField(it.id, "unitCost", Number(e.target.value))}
                            />
                          </div>
                        </td>
                        <td className="p-3">{formatMoney(price)}</td>
                        <td className="p-3">
                          {newPO.items.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removePOItemRow(it.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t">
                    <td colSpan={6}>
                      <div className="flex items-center justify-between p-3">
                        <Button variant="link" className="gap-2" onClick={addNewPOItemRow}>
                          <Plus className="h-4 w-4" /> Add Item
                        </Button>
                        <div className="text-sm mr-2">
                          <span className="text-muted-foreground mr-2">Subtotal</span>
                          <span className="font-medium">{formatMoney(newPOSubtotal)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Taxes & total */}
            <div className="flex items-center justify-end gap-6 mt-3">
              <button
                className="text-sm text-blue-600"
                onClick={() => setNewPO((s) => ({ ...s, extraCosts: Number(s.extraCosts) || 0 }))}
              >
                + Add Taxes &amp; Costs
              </button>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  className="h-9 text-sm w-28"
                  type="number"
                  min={0}
                  step="0.01"
                  value={newPO.extraCosts}
                  onChange={(e) => setNewPO((s) => ({ ...s, extraCosts: Number(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">Total</span>
                <span className="font-semibold">{formatMoney(newPOTotal)}</span>
              </div>
            </div>
          </section>

          {/* Shipping Information */}
          <section>
            <div className="text-base font-medium mb-4">Shipping Information</div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  className="h-9 text-sm"
                  placeholder="Contact name"
                  value={newPO.contactName}
                  onChange={(e) => setNewPO((s) => ({ ...s, contactName: e.target.value }))}
                />
                <Input
                  className="h-9 text-sm"
                  placeholder="Email or Phone Number"
                  value={newPO.contactEmailOrPhone}
                  onChange={(e) => setNewPO((s) => ({ ...s, contactEmailOrPhone: e.target.value }))}
                />
              </div>

              <Input
                className="h-9 text-sm"
                placeholder="Shipping Address"
                value={newPO.shippingAddress.line1}
                onChange={(e) =>
                  setNewPO((s) => ({
                    ...s,
                    shippingAddress: { ...s.shippingAddress, line1: e.target.value },
                    ...(s.sameShipBill ? { billingAddress: { ...s.billingAddress, line1: e.target.value } } : {}),
                  }))
                }
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input className="h-9 text-sm" placeholder="City"
                  value={newPO.shippingAddress.city}
                  onChange={(e) =>
                    setNewPO((s) => ({
                      ...s,
                      shippingAddress: { ...s.shippingAddress, city: e.target.value },
                      ...(s.sameShipBill ? { billingAddress: { ...s.billingAddress, city: e.target.value } } : {}),
                    }))
                  }
                />
                <Input className="h-9 text-sm" placeholder="State"
                  value={newPO.shippingAddress.state}
                  onChange={(e) =>
                    setNewPO((s) => ({
                      ...s,
                      shippingAddress: { ...s.shippingAddress, state: e.target.value },
                      ...(s.sameShipBill ? { billingAddress: { ...s.billingAddress, state: e.target.value } } : {}),
                    }))
                  }
                />
                <Input className="h-9 text-sm" placeholder="PIN"
                  value={newPO.shippingAddress.postalCode}
                  onChange={(e) =>
                    setNewPO((s) => ({
                      ...s,
                      shippingAddress: { ...s.shippingAddress, postalCode: e.target.value },
                      ...(s.sameShipBill ? { billingAddress: { ...s.billingAddress, postalCode: e.target.value } } : {}),
                    }))
                  }
                />
                <Input className="h-9 text-sm" placeholder="Country"
                  value={newPO.shippingAddress.country}
                  onChange={(e) =>
                    setNewPO((s) => ({
                      ...s,
                      shippingAddress: { ...s.shippingAddress, country: e.target.value },
                      ...(s.sameShipBill ? { billingAddress: { ...s.billingAddress, country: e.target.value } } : {}),
                    }))
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  checked={newPO.sameShipBill}
                  onChange={(e) => setNewPO((s) => ({ ...s, sameShipBill: e.target.checked }))}
                />
                Use the same Shipping and Billing Address
              </label>

              {!newPO.sameShipBill && (
                <>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Billing Address"
                    value={newPO.billingAddress.line1}
                    onChange={(e) =>
                      setNewPO((s) => ({
                        ...s,
                        billingAddress: { ...s.billingAddress, line1: e.target.value },
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input className="h-9 text-sm" placeholder="City"
                      value={newPO.billingAddress.city}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s, billingAddress: { ...s.billingAddress, city: e.target.value },
                        }))
                      }
                    />
                    <Input className="h-9 text-sm" placeholder="State"
                      value={newPO.billingAddress.state}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s, billingAddress: { ...s.billingAddress, state: e.target.value },
                        }))
                      }
                    />
                    <Input className="h-9 text-sm" placeholder="PIN"
                      value={newPO.billingAddress.postalCode}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s, billingAddress: { ...s.billingAddress, postalCode: e.target.value },
                        }))
                      }
                    />
                    <Input className="h-9 text-sm" placeholder="Country"
                      value={newPO.billingAddress.country}
                      onChange={(e) =>
                        setNewPO((s) => ({
                          ...s, billingAddress: { ...s.billingAddress, country: e.target.value },
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Details */}
          <section>
            <div className="text-base font-medium mb-4">Details</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Calendar className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9 h-9 text-sm"
                  type="date"
                  value={newPO.dueDate}
                  onChange={(e) => setNewPO((s) => ({ ...s, dueDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  className="h-9 text-sm"
                  placeholder="Add notes"
                  value={newPO.notes}
                  onChange={(e) => setNewPO((s) => ({ ...s, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <Button variant="outline" className="gap-2 h-9">
                <Paperclip className="h-4 w-4" />
                Attach files
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Footer (fixed in right pane) */}
      <div className="p-6 border-t flex justify-end">
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={createPurchaseOrder}
              disabled={!newPO.vendorId || newPO.items.every((i) => !i.itemName)}
            >
              <Plus className="h-4 w-4" />
              Create Purchase Order
            </Button>
          {/* <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={createPurchaseOrder}
            disabled={!newPO.vendorId || newPO.items.every((i) => !i.itemName)}
          >
            <Plus className="h-4 w-4" />
            Create Purchase Order
          </Button> */}
        </div>
      </div>
    </div>
  );
}