import React, { useState, useRef, useEffect } from "react";
import type { PurchaseOrdersTableProps } from "./po.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { FileText, CheckCircle, Send, Package, XCircle } from "lucide-react";
import { renderInitials } from "../utils/renderInitials";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export default function PurchaseOrdersTable({
  orders,
  columns,
  pageSize,
}: PurchaseOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedPOs((prev) =>
      prev.includes(id) ? prev.filter((po) => po !== id) : [...prev, id]
    );
  };

  console.log(orders, "orders");

  // handle sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey as keyof typeof a];
    const valB = b[sortKey as keyof typeof b];

    if (valA === undefined && valB === undefined) return 0;
    if (valA === undefined) return sortOrder === "asc" ? 1 : -1;
    if (valB === undefined) return sortOrder === "asc" ? -1 : 1;

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const visibleOrders = sortedOrders.slice(startIndex, endIndex);

  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const renderStatus = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Draft
          </span>
        );

      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <CheckCircle className="h-4 w-4" />
            Approved
          </span>
        );

      case "Sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            <Send className="h-4 w-4" />
            Sent
          </span>
        );

      case "Received":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
            <Package className="h-4 w-4" />
            Received
          </span>
        );

      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-4 w-4" />
            cancelled
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {status}
          </span>
        );
    }
  };

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;

    const allSelected =
      visibleOrders.length > 0 &&
      visibleOrders.every((order) => selectedPOs.includes(order.id));

    const someSelected =
      visibleOrders.some((order) => selectedPOs.includes(order.id)) &&
      !allSelected;

    headerCheckboxRef.current.indeterminate = someSelected;
  }, [visibleOrders, selectedPOs]);

  return (
    // --- UPDATED ---
    // Applied border, rounded-lg, shadow, bg-card, and overflow-hidden
    <div className="border rounded-lg shadow-sm bg-card flex flex-col h-full overflow-hidden">
      {/* Scrollable table body */}
      <div className="flex-1 overflow-auto">
        {/* --- UPDATED --- Applied w-full and text-sm */}
        <table className="w-full text-sm">
          {/* --- UPDATED --- Applied new thead styling from LocationTable */}
          <thead className="bg-muted/60 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              {/* --- UPDATED --- Changed py-4 to py-3 */}
              <th className="px-4 py-3 text-left w-10">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={
                    visibleOrders.length > 0 &&
                    visibleOrders.every((order) =>
                      selectedPOs.includes(order.id)
                    )
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = visibleOrders.map((o) => o.id);
                      setSelectedPOs((prev) =>
                        Array.from(new Set([...prev, ...allIds]))
                      );
                    } else {
                      setSelectedPOs((prev) =>
                        prev.filter(
                          (id) => !visibleOrders.some((o) => o.id === id)
                        )
                      );
                    }
                  }}
                  className="cursor-pointer accent-orange-600"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  // --- UPDATED --- Changed py-4 to py-3 and removed explicit text/font styles
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <a href="#">
                      <svg
                        className="w-3 h-3 ms-1.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                      </svg>
                    </a>
                    {sortKey === col.key &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {visibleOrders.length > 0 ? (
              visibleOrders.map((order) => (
                <tr
                  key={order.id}
                  // --- UPDATED --- Applied new row styling from LocationTable
                  className="border-b border-border transition hover:bg-muted/40"
                >
                  {/* --- UPDATED --- Changed py-4 to py-3 */}
                  <td key="rowCheckbox" className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedPOs.includes(order.id)}
                      onChange={() => toggleSelection(order.id)}
                      className="cursor-pointer accent-orange-600"
                    />
                  </td>
                  {columns?.map((col) => {
                    const value = order[col.key as keyof typeof order];

                    switch (col.key) {
                      case "title":
                        return (
                          // --- UPDATED --- Standardized padding
                          <td
                            key={col.key}
                            className="px-4 py-3 flex items-center gap-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {renderInitials(order.vendor.name)}
                              </AvatarFallback>
                            </Avatar>
                            {/* --- UPDATED --- Applied font-medium and text-foreground */}
                            <p className="font-medium text-foreground">
                              {order.title}
                            </p>
                          </td>
                        );
                      case "id":
                        return (
                          // --- UPDATED --- Applied text-muted-foreground
                          <td
                            key={col.key}
                            className="px-4 py-3 font-mono text-muted-foreground"
                          >
                            #{order.id}
                          </td>
                        );
                      case "vendor":
                        return (
                          // --- UPDATED --- Applied text-muted-foreground
                          <td
                            key={col.key}
                            className="px-4 py-3 text-muted-foreground"
                          >
                            <p>{order.vendor.name}</p>
                          </td>
                        );
                      case "status":
                        return (
                          // --- UPDATED --- Standardized padding
                          <td key={col.key} className="px-4 py-3 font-medium">
                            {renderStatus(order.status)}
                          </td>
                        );
                      case "createdAt":
                        return (
                          // --- UPDATED --- Applied text-muted-foreground
                          <td
                            key={col.key}
                            className="px-4 py-3 text-muted-foreground"
                          >
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                        );
                      case "createdBy":
                        return (
                          // --- UPDATED --- Applied text-muted-foreground
                          <td
                            key={col.key}
                            className="px-4 py-3 flex items-center gap-2 text-muted-foreground"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {renderInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            {/* --- UPDATED --- Applied text-foreground to the name */}
                            <span className="text-foreground">
                              {order.createdBy}
                            </span>
                          </td>
                        );
                      default:
                        return (
                          // --- UPDATED --- Applied text-muted-foreground
                          <td
                            key={col.key}
                            className="px-4 py-3 text-muted-foreground"
                          >
                            {String(value)}
                          </td>
                        );
                    }
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  // --- UPDATED --- Applied new empty state styling
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No purchase orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- UPDATED --- Applied bg-card and text-muted-foreground */}
      <div className="flex items-center justify-between p-3 border-t text-sm text-muted-foreground bg-card">
        <span>
          {orders.length === 0
            ? "0 of 0"
            : `${startIndex + 1}–${Math.min(endIndex, orders.length)} of ${
                orders.length
              }`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="p-1 rounded-md border disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
