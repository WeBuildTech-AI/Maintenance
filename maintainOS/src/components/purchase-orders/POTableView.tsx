// "use client";
// import React, { useState, useRef, useEffect, useMemo } from "react";
// import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";
// import {
//   FileText,
//   CheckCircle,
//   Send,
//   Package,
//   XCircle,
//   Settings,
//   Trash2,
//   Loader2,
// } from "lucide-react";
// import { renderInitials } from "../utils/renderInitials";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store";

// import { Table, Tooltip as AntTooltip } from "antd";
// import type { TableProps, TableColumnType } from "antd";
// import { Card, CardContent } from "../ui/card";

// import { formatDateOnly } from "../utils/Date";
// import toast from "react-hot-toast";
// import SettingsModal from "../utils/SettingsModal";
// import { purchaseOrderService } from "../../store/purchaseOrders";
// import AssetTableModal from "../utils/AssetTableModal";
// import { Tooltip } from "../ui/tooltip";

// // --- Helper Functions ---
// const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
//   order === "asc" ? "ascend" : "descend";

// // Row Styling
// const tableStyles = `
//   .selected-row-class > td {
//     background-color: #ffe8d9 !important;
//   }
//   .selected-row-class:hover > td {
//     background-color: #f9fafb !important;
//   }
//   .ant-table-cell-fix-left,
//   .ant-table-cell-fix-right {
//     background-color: #fff !important;
//     z-index: 3 !important;
//   }
//   .ant-table-row:hover > td {
//     background-color: #f9fafb !important;
//   }
//   .ant-table-thead > tr > th {
//     background-color: #f9fafb !important;
//     text-transform: uppercase;
//     font-size: 12px;
//     font-weight: 600;
//     color: #6b7280;
//   }
//   .ant-table-tbody > tr > td {
//     border-bottom: 1px solid #f3f4f6;
//   }
// `;

// // Column Configuration
// const allAvailableColumns = [
//   "ID",
//   "Vendor",
//   "Status",
//   "Created By",
//   "Created",
//   "Custom Number",
//   "Note",
// ];

// const columnConfig: {
//   [key: string]: {
//     dataIndex: string;
//     width: number;
//     sorter?: (a: any, b: any) => number;
//   };
// } = {
//   ID: {
//     dataIndex: "id",
//     width: 150,
//     sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
//   },
//   Vendor: {
//     dataIndex: "vendor",
//     width: 200,
//     sorter: (a, b) =>
//       (a.vendor?.name || "").localeCompare(b.vendor?.name || ""),
//   },
//   Status: {
//     dataIndex: "status",
//     width: 150,
//     sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
//   },
//   "Created By": {
//     dataIndex: "createdBy",
//     width: 200,
//     sorter: (a, b) => (a.createdBy || "").localeCompare(b.createdBy || ""),
//   },
//   Created: {
//     dataIndex: "createdAt",
//     width: 150,
//     sorter: (a, b) =>
//       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//   },
//   "Custom Number": {
//     dataIndex: "customNumber",
//     width: 150,
//     sorter: (a, b) => (a.poNumber || "").localeCompare(b.poNumber || ""),
//   },
//   Note: {
//     dataIndex: "note",
//     width: 150,
//     sorter: (a, b) => (a.note || "").localeCompare(b.note || ""),
//   },
// };

// // Storage Key for LocalStorage
// const STORAGE_KEY_COLUMNS = "purchaseOrders_visibleColumns";

// export interface PurchaseOrdersTableProps {
//   orders: any[];
//   isSettingModalOpen: boolean;
//   setIsSettingModalOpen: (isOpen: boolean) => void;
//   fetchPurchaseOrders: () => void;
//   showDeleted: boolean;
//   setShowDeleted: (v: boolean) => void;
// }

// export default function PurchaseOrdersTable({
//   orders,
//   isSettingModalOpen,
//   setIsSettingModalOpen,
//   fetchPurchaseOrders,
//   showDeleted,
//   setShowDeleted,
// }: PurchaseOrdersTableProps) {
//   const user = useSelector((state: RootState) => state.auth.user);

//   // --- ⭐ FIX: Initialize State from LocalStorage ---
//   const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
//     if (typeof window !== "undefined") {
//       const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
//       if (saved) {
//         try {
//           return JSON.parse(saved);
//         } catch (e) {
//           console.error(
//             "Failed to parse visible columns from local storage",
//             e
//           );
//         }
//       }
//     }
//     return allAvailableColumns;
//   });

//   const [sortType, setSortType] = useState<string>("poNumber");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [selectedPOIds, setSelectedPOIds] = useState<string[]>([]);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const headerCheckboxRef = useRef<HTMLInputElement>(null);
//   const [isOpenPurchaseOrderDetailsModal, setIsOpenPurchaseOrderDetailsModal] =
//     useState(false);
//   const [selectedPurchaseOrderTable, setSelectedPurchaseOrderTable] = useState<
//     string[]
//   >([]);

//   const renderStatus = (status: string) => {
//     switch (status) {
//       case "pending":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-orange-600 border-orange-200 px-2 py-1 text-xs font-medium ">
//             <FileText className="h-4 w-4" />
//             Pending
//           </span>
//         );
//       case "approved":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border-green-200">
//             <CheckCircle className="h-4 w-4" />
//             Approved
//           </span>
//         );
//       case "partially_fulfilled":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border-blue-200">
//             <Send className="h-4 w-4" />
//             Partially fulfilled
//           </span>
//         );
//       case "completed":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
//             <Package className="h-4 w-4" />
//             Completed
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
//             <XCircle className="h-4 w-4" />
//             Rejected
//           </span>
//         );
//       case "cancelled":
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
//             <XCircle className="h-4 w-4" />
//             cancelled
//           </span>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
//             {status}
//           </span>
//         );
//     }
//   };

//   // Selection Logic
//   const allPOIds = useMemo(() => orders.map((p) => p.id), [orders]);
//   const selectedCount = selectedPOIds.length;
//   const isEditing = selectedCount > 0;
//   const areAllSelected =
//     allPOIds.length > 0 && selectedCount === allPOIds.length;
//   const isIndeterminate = selectedCount > 0 && !areAllSelected;

//   useEffect(() => {
//     if (headerCheckboxRef.current) {
//       headerCheckboxRef.current.indeterminate = isIndeterminate;
//     }
//   }, [isIndeterminate, isEditing, orders]);

//   const handleSelectAllToggle = () => {
//     if (areAllSelected) {
//       setSelectedPOIds([]);
//     } else {
//       setSelectedPOIds(allPOIds);
//     }
//   };

//   const toggleRowSelection = (id: string) => {
//     setSelectedPOIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const handleDelete = async () => {
//     if (selectedPOIds.length === 0) {
//       toast.error("No purchase orders selected to delete.");
//       return;
//     }
//     setIsDeleting(true);

//     try {
//       await purchaseOrderService.batchDeletePurchaseOrder(selectedPOIds);
//       toast.success("Purchase orders deleted successfully!");
//       setSelectedPOIds([]);
//       fetchPurchaseOrders();
//     } catch (err) {
//       console.error("Error bulk deleting purchase orders:", err);
//       toast.error("Failed to delete purchase orders.");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleTableChange: TableProps<any>["onChange"] = (
//     _pagination,
//     _filters,
//     sorter
//   ) => {
//     const s = Array.isArray(sorter) ? sorter[0] : sorter;
//     if (s && s.field && s.order) {
//       setSortType(s.field as string);
//       setSortOrder(s.order === "ascend" ? "asc" : "desc");
//     } else if (s && s.field) {
//       setSortType(s.field as string);
//       setSortOrder("asc");
//     } else {
//       setSortType("poNumber");
//       setSortOrder("asc");
//     }
//   };

//   const handleApplySettings = (settings: {
//     resultsPerPage: number;
//     showDeleted: boolean;
//     sortColumn: string;
//     visibleColumns: string[];
//   }) => {
//     setVisibleColumns(settings.visibleColumns);
//     setShowDeleted(settings.showDeleted);

//     // --- ⭐ FIX: Save to LocalStorage ---
//     localStorage.setItem(
//       STORAGE_KEY_COLUMNS,
//       JSON.stringify(settings.visibleColumns)
//     );

//     setIsSettingModalOpen(false);
//   };

//   const columns: TableColumnType<any>[] = useMemo(() => {
//     const nameColumn: TableColumnType<any> = {
//       title: () => {
//         if (!isEditing) {
//           return (
//             <div className="flex items-center justify-between gap-2 h-full">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   ref={headerCheckboxRef}
//                   checked={areAllSelected}
//                   onChange={handleSelectAllToggle}
//                   className="h-4 w-4 accent-orange-600 cursor-pointer"
//                 />
//                 <span className="text-gray-600">PO Number</span>
//               </div>
//             </div>
//           );
//         }
//         return (
//           <div className="flex items-center gap-4 h-full">
//             <input
//               type="checkbox"
//               ref={headerCheckboxRef}
//               checked={areAllSelected}
//               onChange={handleSelectAllToggle}
//               className="h-4 w-4 accent-orange-600 cursor-pointer"
//             />
//             <span className="text-sm font-medium text-gray-900">
//               Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
//             </span>
//             <Tooltip text="Delete">
//               <button
//                 onClick={handleDelete}
//                 disabled={isDeleting}
//                 className={`flex items-center gap-1 transition ${
//                   isDeleting
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-orange-600 hover:text-orange-600 cursor-pointer"
//                 }`}
//               >
//                 {isDeleting ? (
//                   <Loader2 size={16} className="animate-spin" />
//                 ) : (
//                   <Trash2 size={16} />
//                 )}
//               </button>
//             </Tooltip>
//           </div>
//         );
//       },
//       dataIndex: "poNumber",
//       key: "poNumber",
//       fixed: "left",
//       width: 250,
//       sorter: (a, b) => (a.poNumber || "").localeCompare(b.poNumber || ""),
//       sortOrder:
//         sortType === "poNumber" ? mapAntSortOrder(sortOrder) : undefined,
//       render: (poNumber: string, record: any) => {
//         const isSelected = selectedPOIds.includes(record.id);
//         return (
//           <div className="flex items-center gap-3 font-medium text-gray-800 h-full">
//             <div
//               className="flex items-center justify-center h-8 w-8 cursor-pointer"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 toggleRowSelection(record.id);
//               }}
//             >
//               {isEditing ? (
//                 <input
//                   type="checkbox"
//                   checked={isSelected}
//                   readOnly
//                   className="h-5 w-5 accent-orange-600 cursor-pointer"
//                 />
//               ) : (
//                 <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
//                   <AvatarFallback>
//                     {renderInitials(record.vendor?.name || "PO")}
//                   </AvatarFallback>
//                 </ShadCNAvatar>
//               )}
//             </div>
//             <span
//               className="truncate cursor-pointer hover:text-orange-600 hover:underline"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setIsOpenPurchaseOrderDetailsModal(true);
//                 setSelectedPurchaseOrderTable(record.fullOrder);
//               }}
//             >
//               Purchase Order #{poNumber}
//             </span>
//           </div>
//         );
//       },
//     };

//     const dynamicColumns: TableColumnType<any>[] = visibleColumns
//       .map((colName) => {
//         const config = columnConfig[colName];
//         if (!config) return null;

//         let renderFunc:
//           | ((value: any, record: any) => React.ReactNode)
//           | undefined = undefined;

//         if (colName === "ID") {
//           renderFunc = (id: string) => (
//             <Tooltip text={id}>
//               <span>#{id.substring(0, 8)}...</span>
//             </Tooltip>
//           );
//         } else if (colName === "Vendor") {
//           renderFunc = (vendor: any) => (
//             <span className="text-muted-foreground">{vendor?.name || "—"}</span>
//           );
//         } else if (colName === "Status") {
//           renderFunc = (status: string) => renderStatus(status);
//         } else if (colName === "Created") {
//           renderFunc = (text: string) => formatDateOnly(text) || "—";
//         } else if (colName === "Created By") {
//           renderFunc = (createdBy: string) => (
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <ShadCNAvatar className="h-8 w-8">
//                 <AvatarFallback>
//                   {renderInitials(user?.fullName || "U")}
//                 </AvatarFallback>
//               </ShadCNAvatar>
//               <span className="text-foreground">{user?.fullName}</span>
//             </div>
//           );
//         } else if (colName === "Custom Number") {
//           renderFunc = (poNumber: string) => poNumber;
//         } else if (colName === "Note") {
//           renderFunc = (note: string) => note;
//         }
//         return {
//           title: colName,
//           dataIndex: config.dataIndex,
//           key: config.dataIndex,
//           width: config.width,
//           sorter: config.sorter,
//           sortOrder:
//             sortType === config.dataIndex
//               ? mapAntSortOrder(sortOrder)
//               : undefined,
//           render: renderFunc,
//         };
//       })
//       .filter(Boolean) as TableColumnType<any>[];

//     return [nameColumn, ...dynamicColumns];
//   }, [
//     isEditing,
//     sortType,
//     sortOrder,
//     visibleColumns,
//     areAllSelected,
//     selectedCount,
//     selectedPOIds,
//     isDeleting,
//     user,
//   ]);

//   const dataSource = useMemo(() => {
//     return orders.map((order) => ({
//       key: order.id,
//       id: order.id,
//       poNumber: order.poNumber,
//       vendor: order.vendor,
//       status: order.status,
//       createdAt: order.createdAt,
//       createdBy: order.createdBy,
//       customNumber: order.poNumber,
//       note: order.notes,
//       fullOrder: order,
//     }));
//   }, [orders]);

//   return (
//     <div className="flex-1 overflow-auto p-2">
//       <style>{tableStyles}</style>

//       <Card className="shadow-sm border rounded-lg overflow-hidden w-full">
//         <CardContent className="p-0">
//           <Table
//             columns={columns}
//             dataSource={dataSource}
//             pagination={false}
//             scroll={{ x: "max-content", y: "75vh" }}
//             rowClassName={(record: any) =>
//               selectedPOIds.includes(record.id) ? "selected-row-class" : ""
//             }
//             onChange={handleTableChange}
//             rowSelection={{
//               selectedRowKeys: selectedPOIds,
//               columnWidth: 0,
//               renderCell: () => null,
//               columnTitle: " ",
//             }}
//             onRow={(record) => ({
//               onClick: () => {
//                 toggleRowSelection(record.id);
//               },
//             })}
//             locale={{
//               emptyText: "No purchase orders found.",
//             }}
//           />
//         </CardContent>
//       </Card>

//       <SettingsModal
//         isOpen={isSettingModalOpen}
//         onClose={() => setIsSettingModalOpen(false)}
//         onApply={handleApplySettings}
//         allToggleableColumns={allAvailableColumns}
//         currentVisibleColumns={visibleColumns}
//         currentShowDeleted={showDeleted}
//         componentName="PurchaseOrder"
//       />

//       {isOpenPurchaseOrderDetailsModal && (
//         <AssetTableModal
//           data={selectedPurchaseOrderTable}
//           onClose={() => setIsOpenPurchaseOrderDetailsModal(false)}
//           showDetailsSection={"purchaseorder"}
//           restoreData={"Restore"}
//           fetchData={fetchPurchaseOrders}
//           showDeleted={showDeleted}
//         />
//       )}
//     </div>
//   );
// }

"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";
import {
  FileText,
  CheckCircle,
  Send,
  Package,
  XCircle,
  Settings,
  Trash2,
  Loader2,
} from "lucide-react";
import { renderInitials } from "../utils/renderInitials";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

// Antd components
import { Table, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";
import { Card, CardContent } from "../ui/card";

import { formatDateOnly } from "../utils/Date";
import toast from "react-hot-toast";
import SettingsModal from "../utils/SettingsModal";
import { purchaseOrderService } from "../../store/purchaseOrders";
import AssetTableModal from "../utils/AssetTableModal";
import { Tooltip } from "../ui/tooltip";

// --- Constants ---
const STORAGE_KEY_COLUMNS = "purchase_orders_visible_columns";

// --- Helper Functions ---
const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

// Row Styling
const tableStyles = `
  .selected-row-class > td {
    background-color: #ffe8d9 !important; /* Orange theme */
  }
  .selected-row-class:hover > td {
    background-color: #f9fafb !important;
  }
  .ant-table-cell-fix-left,  
  .ant-table-cell-fix-right {
    background-color: #fff !important;  
    z-index: 3 !important;
  }
  .ant-table-row:hover > td {
    background-color: #f9fafb !important;
  }
  .ant-table-thead > tr > th {
    background-color: #f9fafb !important; /* Header BG */
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f3f4f6; /* Lighter border */
  }
`;

// Column Configuration
const allAvailableColumns = [
  "ID",
  "Vendor",
  "Status",
  "Created By",
  "Created",
  "Custom Number",
  "Note",
];

const columnConfig: {
  [key: string]: {
    dataIndex: string;
    width: number;
    sorter?: (a: any, b: any) => number;
  };
} = {
  ID: {
    dataIndex: "id",
    width: 150,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  Vendor: {
    dataIndex: "vendor",
    width: 200,
    sorter: (a, b) =>
      (a.vendor?.name || "").localeCompare(b.vendor?.name || ""),
  },
  Status: {
    dataIndex: "status",
    width: 150,
    sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
  },
  "Created By": {
    dataIndex: "createdBy",
    width: 200,
    sorter: (a, b) => (a.createdBy || "").localeCompare(b.createdBy || ""),
  },
  Created: {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  "Custom Number": {
    dataIndex: "customNumber",
    width: 150,
    sorter: (a, b) => (a.poNumber || "").localeCompare(b.poNumber || ""),
  },
  Note: {
    dataIndex: "note",
    width: 150,
    sorter: (a, b) => (a.note || "").localeCompare(b.note || ""),
  },
};

export interface PurchaseOrdersTableProps {
  orders: any[];
  isSettingModalOpen: boolean;
  setIsSettingModalOpen: (isOpen: boolean) => void;
  fetchPurchaseOrders: () => void;
  showDeleted: boolean;
  setShowDeleted: (v: boolean) => void;
}

export default function PurchaseOrdersTable({
  orders,
  isSettingModalOpen,
  setIsSettingModalOpen,
  fetchPurchaseOrders,
  showDeleted,
  setShowDeleted,
}: PurchaseOrdersTableProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  // --- 1. Production Level State Initialization ---
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    // Check if running in browser (SSR safety)
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Error parsing column settings:", error);
      }
    }
    // Default fallback
    return allAvailableColumns;
  });

  const [sortType, setSortType] = useState<string>("poNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPOIds, setSelectedPOIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [isOpenPurchaseOrderDetailsModal, setIsOpenPurchaseOrderDetailsModal] =
    useState(false);
  const [selectedPurchaseOrderTable, setSelectedPurchaseOrderTable] = useState<
    string[]
  >([]);

  // Render Status Function
  const renderStatus = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-orange-600 border-orange-200 px-2 py-1 text-xs font-medium ">
            <FileText className="h-4 w-4" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4" />
            Approved
          </span>
        );
      case "partially_fulfilled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border-blue-200">
            <Send className="h-4 w-4" />
            Partially fulfilled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
            <Package className="h-4 w-4" />
            Completed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-4 w-4" />
            Rejected
          </span>
        );
      case "cancelled":
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

  // Selection Logic
  const allPOIds = useMemo(() => orders.map((p) => p.id), [orders]);
  const selectedCount = selectedPOIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allPOIds.length > 0 && selectedCount === allPOIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing, orders]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) {
      setSelectedPOIds([]);
    } else {
      setSelectedPOIds(allPOIds);
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedPOIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handlers
  const handleDelete = async () => {
    if (selectedPOIds.length === 0) {
      toast.error("No purchase orders selected to delete.");
      return;
    }
    setIsDeleting(true);

    try {
      await purchaseOrderService.batchDeletePurchaseOrder(selectedPOIds);
      toast.success("Purchase orders deleted successfully!");
      setSelectedPOIds([]);
      fetchPurchaseOrders();
    } catch (err) {
      console.error("Error bulk deleting purchase orders:", err);
      toast.error("Failed to delete purchase orders.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTableChange: TableProps<any>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s && s.field && s.order) {
      setSortType(s.field as string);
      setSortOrder(s.order === "ascend" ? "asc" : "desc");
    } else if (s && s.field) {
      setSortType(s.field as string);
      setSortOrder("asc");
    } else {
      setSortType("poNumber");
      setSortOrder("asc");
    }
  };

  // --- 2. OPTIMIZED SETTINGS HANDLER ---
  const handleApplySettings = (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
    visibleColumns: string[];
  }) => {
    // Update State (Immediate UI update)
    setVisibleColumns(settings.visibleColumns);
    setShowDeleted(settings.showDeleted);

    // Update Local Storage (Persistence)
    if (typeof window !== "undefined") {
      // Logic:
      // 1. Check if the COUNT of columns is the same.
      // 2. Check if EVERY default column exists in the current selection.
      // 3. We IGNORE order. If user has all columns, we consider it "default" and clear storage.
      const hasSameLength =
        settings.visibleColumns.length === allAvailableColumns.length;
      const hasAllColumns =
        hasSameLength &&
        allAvailableColumns.every((col) =>
          settings.visibleColumns.includes(col)
        );

      if (hasAllColumns) {
        localStorage.removeItem(STORAGE_KEY_COLUMNS);
      } else {
        localStorage.setItem(
          STORAGE_KEY_COLUMNS,
          JSON.stringify(settings.visibleColumns)
        );
      }
    }

    setIsSettingModalOpen(false);
  };

  const columns: TableColumnType<any>[] = useMemo(() => {
    // --- Name Column (Fixed Left) ---
    const nameColumn: TableColumnType<any> = {
      title: () => {
        if (!isEditing) {
          return (
            <div className="flex items-center justify-between gap-2 h-full">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={areAllSelected}
                  onChange={handleSelectAllToggle}
                  className="h-4 w-4 accent-orange-600 cursor-pointer"
                />
                <span className="text-gray-600">PO Number</span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-4 h-full">
            <input
              type="checkbox"
              ref={headerCheckboxRef}
              checked={areAllSelected}
              onChange={handleSelectAllToggle}
              className="h-4 w-4 accent-orange-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900">
              Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </span>
            <Tooltip text="Delete">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-orange-600 hover:text-orange-600 cursor-pointer"
                }`}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </Tooltip>
          </div>
        );
      },
      dataIndex: "poNumber",
      key: "poNumber",
      fixed: "left",
      width: 250,
      sorter: (a, b) => (a.poNumber || "").localeCompare(b.poNumber || ""),
      sortOrder:
        sortType === "poNumber" ? mapAntSortOrder(sortOrder) : undefined,
      render: (poNumber: string, record: any) => {
        const isSelected = selectedPOIds.includes(record.id);
        return (
          <div className="flex items-center gap-3 font-medium text-gray-800 h-full">
            <div
              className="flex items-center justify-center h-8 w-8 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleRowSelection(record.id);
              }}
            >
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="h-5 w-5 accent-orange-600 cursor-pointer"
                />
              ) : (
                <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {renderInitials(record.vendor?.name || "PO")}
                  </AvatarFallback>
                </ShadCNAvatar>
              )}
            </div>
            <span
              className="truncate cursor-pointer hover:text-orange-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenPurchaseOrderDetailsModal(true);
                setSelectedPurchaseOrderTable(record.fullOrder);
              }}
            >
              Purchase Order #{poNumber}
            </span>
          </div>
        );
      },
    };

    // --- Dynamic Columns ---
    const dynamicColumns: TableColumnType<any>[] = visibleColumns
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        if (colName === "ID") {
          renderFunc = (id: string) => (
            <Tooltip text={id}>
              <span>#{id.substring(0, 8)}...</span>
            </Tooltip>
          );
        } else if (colName === "Vendor") {
          renderFunc = (vendor: any) => (
            <span className="text-muted-foreground">{vendor?.name || "—"}</span>
          );
        } else if (colName === "Status") {
          renderFunc = (status: string) => renderStatus(status);
        } else if (colName === "Created") {
          renderFunc = (text: string) => formatDateOnly(text) || "—";
        } else if (colName === "Created By") {
          renderFunc = (createdBy: string) => (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShadCNAvatar className="h-8 w-8">
                <AvatarFallback>
                  {renderInitials(user?.fullName || "U")}
                </AvatarFallback>
              </ShadCNAvatar>
              <span className="text-foreground">{user?.fullName}</span>
            </div>
          );
        } else if (colName === "Custom Number") {
          renderFunc = (poNumber: string) => poNumber;
        } else if (colName === "Note") {
          renderFunc = (note: string) => note;
        }
        return {
          title: colName,
          dataIndex: config.dataIndex,
          key: config.dataIndex,
          width: config.width,
          sorter: config.sorter,
          sortOrder:
            sortType === config.dataIndex
              ? mapAntSortOrder(sortOrder)
              : undefined,
          render: renderFunc,
        };
      })
      .filter(Boolean) as TableColumnType<any>[];

    return [nameColumn, ...dynamicColumns];
  }, [
    isEditing,
    sortType,
    sortOrder,
    visibleColumns,
    areAllSelected,
    selectedCount,
    selectedPOIds,
    isDeleting,
    user,
  ]);

  const dataSource = useMemo(() => {
    return orders.map((order) => ({
      key: order.id,
      id: order.id,
      poNumber: order.poNumber,
      vendor: order.vendor,
      status: order.status,
      createdAt: order.createdAt,
      createdBy: order.createdBy,
      customNumber: order.poNumber,
      note: order.notes,
      fullOrder: order,
    }));
  }, [orders]);

  return (
    <div className="flex-1 overflow-auto p-2">
      <style>{tableStyles}</style>

      <Card className="shadow-sm border rounded-lg overflow-hidden w-full">
        <CardContent className="p-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "max-content", y: "75vh" }}
            rowClassName={(record: any) =>
              selectedPOIds.includes(record.id) ? "selected-row-class" : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedPOIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ",
            }}
            onRow={(record) => ({
              onClick: () => {
                toggleRowSelection(record.id);
              },
            })}
            locale={{
              emptyText: "No purchase orders found.",
            }}
          />
        </CardContent>
      </Card>

      <SettingsModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        componentName="PurchaseOrder"
      />

      {isOpenPurchaseOrderDetailsModal && (
        <AssetTableModal
          data={selectedPurchaseOrderTable}
          onClose={() => setIsOpenPurchaseOrderDetailsModal(false)}
          showDetailsSection={"purchaseorder"}
          restoreData={"Restore"}
          fetchData={fetchPurchaseOrders}
          showDeleted={showDeleted}
        />
      )}
    </div>
  );
}
