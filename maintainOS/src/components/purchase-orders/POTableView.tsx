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

      case "Approved":
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
            Cancelled
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
    <div className="border  shadow-sm bg-white flex flex-col h-full">
      {/* Scrollable table body */}
      <div className="flex-1 ">
        {/*  */}
        <table className="table-auto w-full text-sm overflow-y-auto">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
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
                  className="px-3 py-4 text-left font-medium text-gray-700 cursor-pointer select-none"
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
                  className="hover:bg-gray-50 transition border-b last:border-b-0"
                >
                  {/* Vendor Avatar w/ hover checkbox */}
                  <td key="rowCheckbox" className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedPOs.includes(order.id)}
                      onChange={() => toggleSelection(order.id)}
                      className="cursor-pointer accent-orange-600"
                    />
                  </td>
                  {columns.map((col) => {
                    const value = order[col.key as keyof typeof order];

                    switch (col.key) {
                      case "title":
                        return (
                          <td
                            key={col.key}
                            className="px-3 py-4 flex items-center gap-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {order.vendor
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium text-gray-900">
                              {order.title}
                            </p>
                          </td>
                        );
                      case "id":
                        return (
                          <td
                            key={col.key}
                            className="px-4 py-3 font-mono text-gray-700"
                          >
                            #{order.id}
                          </td>
                        );
                      case "vendor":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            <p>{order.vendor}</p>
                          </td>
                        );
                      case "status":
                        return (
                          <td key={col.key} className="px-4 py-3 font-medium">
                            {renderStatus(order.status)}
                          </td>
                        );
                      case "createdAt":
                        return (
                          <td key={col.key} className="px-4 py-3 text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                        );
                      case "createdBy":
                        return (
                          <td
                            key={col.key}
                            className="px-4 py-3 flex items-center gap-2"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {order.createdBy
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{order.createdBy}</span>
                          </td>
                        );
                      default:
                        return (
                          <td key={col.key} className="px-4 py-3">
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
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No purchase orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fixed footer inside flex, no sticky needed */}
      <div className="flex items-center justify-between p-3 border-t text-sm text-gray-600 bg-white">
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
