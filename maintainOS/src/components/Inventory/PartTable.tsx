// // PartTable.tsx
// "use client";
// import React, { useState, useRef, useEffect, useMemo } from "react";
// import { Card, CardContent } from "../ui/card";
// import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";

// // Antd & Icons
// import { Table, Tooltip as AntTooltip } from "antd";
// import type { TableProps, TableColumnType } from "antd";
// import { Settings, Trash2, Loader2, Edit, Plus, Maximize2, Minimize2, X } from "lucide-react";
// import toast from "react-hot-toast";

// // Imports
// import SettingsModal from "../utils/SettingsModal";
// import { formatDateOnly } from "../utils/Date";
// import { partService } from "../../store/parts";
// import AssetTableModal from "../utils/AssetTableModal";
// import { Tooltip } from "../ui/tooltip";

// // ✅ Import Modals for Table Actions
// import RestockModal from "./PartDetail/RestockModal";
// import { NewPartForm } from "./NewPartForm/NewPartForm";

// // --- Helper Functions ---

// const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
//   order === "asc" ? "ascend" : "descend";

// const renderInitials = (text: string) =>
//   text
//     .split(" ")
//     .map((p) => p[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

// const tableStyles = `
//   .selected-row-class > td {
//     background-color: #f0f9ff !important;
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

// const allAvailableColumns = [
//   "Name",
//   "Part ID",
//   "Unit Cost",
//   "Stock",
//   "Location",
//   "Vendors",
//   "Teams",
//   "Created At",
//   "Updated At",
// ];

// const columnConfig: {
//   [key: string]: {
//     dataIndex: string;
//     width: number;
//     sorter?: (a: any, b: any) => number;
//   };
// } = {
//   Name: {
//     dataIndex: "name",
//     width: 250,
//     sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
//   },
//   "Part ID": {
//     dataIndex: "id",
//     width: 150,
//     sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
//   },
//   "Unit Cost": {
//     dataIndex: "unitCost",
//     width: 120,
//     sorter: (a, b) => (a.unitCost || 0) - (b.unitCost || 0),
//   },
//   Stock: {
//     dataIndex: "totalStock",
//     width: 150,
//     sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
//   },
//   Location: {
//     dataIndex: "locationString",
//     width: 200,
//     sorter: (a, b) =>
//       (a.locationString || "").localeCompare(b.locationString || ""),
//   },
//   Vendors: {
//     dataIndex: "vendors",
//     width: 200,
//     sorter: (a, b) =>
//       (a.vendors?.[0]?.name || "").localeCompare(b.vendors?.[0]?.name || ""),
//   },
//   Teams: {
//     dataIndex: "teamsString",
//     width: 150,
//     sorter: (a, b) => (a.teamsString || "").localeCompare(b.teamsString || ""),
//   },
//   "Created At": {
//     dataIndex: "createdAt",
//     width: 150,
//     sorter: (a, b) =>
//       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//   },
//   "Updated At": {
//     dataIndex: "updatedAt",
//     width: 150,
//     sorter: (a, b) =>
//       new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
//   },
// };

// // --- Internal Wrapper for Edit Modal to handle State ---
// function EditPartModalWrapper({ partId, onClose, onRefresh }: { partId: string; onClose: () => void; onRefresh: () => void }) {
//   const [item, setItem] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     partService.fetchPartById(partId)
//       .then((data) => {
//         if (mounted) {
//           setItem({
//              ...data,
//              _original: data,
//              // Ensure arrays exist for form
//              pictures: data.photos || [],
//              files: data.files || [],
//              partsType: data.partsType || [],
//              assetIds: data.assetIds || [],
//              teamsInCharge: data.teamsInCharge || [],
//              vendorIds: data.vendorIds || [],
//              vendors: data.vendors || [],
//           });
//           setLoading(false);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         toast.error("Failed to load part details");
//         onClose();
//       });
//     return () => { mounted = false; };
//   }, [partId, onClose]);

//   if (loading || !item) {
//     return (
//       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
//         <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
//           <Loader2 className="animate-spin text-orange-600" />
//           <span>Loading Part...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
//        <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-lg font-semibold">Edit Part</h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
//              <X size={20} />
//           </button>
//        </div>
//        <div className="flex-1 overflow-hidden">
//           <NewPartForm
//             newItem={item}
//             setNewItem={setItem}
//             addVendorRow={() => setItem((prev: any) => ({ ...prev, vendors: [...(prev.vendors || []), { vendorId: "", orderingPartNumber: "" }] }))}
//             removeVendorRow={(idx: number) => setItem((prev: any) => ({ ...prev, vendors: (prev.vendors || []).filter((_: any, i: number) => i !== idx) }))}
//             onCancel={onClose}
//             onCreate={() => {
//                 onRefresh();
//                 onClose();
//             }}
//           />
//        </div>
//     </div>
//   );
// }

// export function PartTable({
//   inventory,
//   isSettingsModalOpen,
//   setIsSettingsModalOpen,
//   fetchPartsData,
//   showDeleted,
//   setShowDeleted,
// }: {
//   inventory: any[];
//   isSettingsModalOpen: boolean;
//   setIsSettingsModalOpen: (isOpen: boolean) => void;
//   fetchPartsData: () => void;
//   showDeleted: boolean;
//   setShowDeleted: (v: boolean) => void;
// }) {
//   const [visibleColumns, setVisibleColumns] = useState<string[]>(allAvailableColumns);
//   const [sortType, setSortType] = useState<string>("name");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // ✅ Local State for Modals
//   const [restockPartId, setRestockPartId] = useState<string | null>(null);
//   const [editPartId, setEditPartId] = useState<string | null>(null);
//   const [isFluid, setIsFluid] = useState(false); // Resize state

//   const headerCheckboxRef = useRef<HTMLInputElement>(null);

//   const allPartIds = useMemo(() => inventory.map((p) => p.id), [inventory]);
//   const selectedCount = selectedPartIds.length;
//   const isEditing = selectedCount > 0;
//   const areAllSelected = allPartIds.length > 0 && selectedCount === allPartIds.length;
//   const isIndeterminate = selectedCount > 0 && !areAllSelected;

//   // Detail Modal State (View only)
//   const [isOpenPartDetailsModal, setIsOpenPartDetailsModal] = useState(false);
//   const [selectedPartTable, setSelectedPartTable] = useState<string[]>([]);

//   useEffect(() => {
//     if (headerCheckboxRef.current) {
//       headerCheckboxRef.current.indeterminate = isIndeterminate;
//     }
//   }, [isIndeterminate, isEditing]);

//   const handleSelectAllToggle = () => {
//     if (areAllSelected) setSelectedPartIds([]);
//     else setSelectedPartIds(allPartIds);
//   };

//   const toggleRowSelection = (id: string) => {
//     setSelectedPartIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const handleDelete = async () => {
//     if (selectedPartIds.length === 0) {
//       toast.error("No parts selected to delete.");
//       return;
//     }
//     setIsDeleting(true);
//     try {
//       await partService.batchDeletePart(selectedPartIds);
//       toast.success("Parts deleted successfully!");
//       setSelectedPartIds([]);
//       fetchPartsData();
//     } catch (err) {
//       console.error("Error bulk deleting parts:", err);
//       toast.error("Failed to delete parts.");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleTableChange: TableProps<any>["onChange"] = (_pagination, _filters, sorter) => {
//     const s = Array.isArray(sorter) ? sorter[0] : sorter;
//     if (s && s.field && s.order) {
//       setSortType(s.field as string);
//       setSortOrder(s.order === "ascend" ? "asc" : "desc");
//     } else if (s && s.field) {
//       setSortType(s.field as string);
//       setSortOrder("asc");
//     } else {
//       setSortType("name");
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
//     setIsSettingsModalOpen(false);
//   };

//   const columns: TableColumnType<any>[] = useMemo(() => {
//     const nameColumn: TableColumnType<any> = {
//       title: () => {
//         if (!isEditing) {
//           return (
//             <div className="flex items-center justify-between gap-2 h-full w-full">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   ref={headerCheckboxRef}
//                   checked={areAllSelected}
//                   onChange={handleSelectAllToggle}
//                   className="h-4 w-4 accent-blue-600 cursor-pointer"
//                 />
//                 <span className="text-gray-600">Name</span>
//               </div>

//               {/* ✅ Resize Toggle */}
//               {/* <Tooltip text={isFluid ? "Fixed Width" : "Fit to Screen"}>
//                 <button
//                   onClick={() => setIsFluid(!isFluid)}
//                   className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition"
//                 >
//                    {isFluid ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
//                 </button>
//               </Tooltip> */}
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
//               className="h-4 w-4 accent-blue-600 cursor-pointer"
//             />
//             <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
//               {selectedCount} Selected
//             </span>

//             <div className="flex items-center gap-1">
//                 {/* ✅ Edit Button */}
//                 {/* <Tooltip text="Edit">
//                     <button
//                         onClick={() => {
//                             if (selectedCount === 1) setEditPartId(selectedPartIds[0]);
//                         }}
//                         disabled={selectedCount !== 1}
//                         className={`p-1.5 rounded transition ${
//                         selectedCount === 1
//                             ? "text-blue-600 hover:bg-blue-50 cursor-pointer"
//                             : "text-gray-300 cursor-not-allowed"
//                         }`}
//                     >
//                         <Edit size={18} />
//                     </button>
//                 </Tooltip> */}

//                 {/* ✅ Restock Button */}
//                 {/* <Tooltip text="Restock">
//                     <button
//                         onClick={() => {
//                             if (selectedCount === 1) setRestockPartId(selectedPartIds[0]);
//                         }}
//                         disabled={selectedCount !== 1}
//                         className={`p-1.5 rounded transition ${
//                         selectedCount === 1
//                             ? "text-green-600 hover:bg-green-50 cursor-pointer"
//                             : "text-gray-300 cursor-not-allowed"
//                         }`}
//                     >
//                         <Plus size={18} />
//                     </button>
//                 </Tooltip> */}

//                 <Tooltip text="Delete">
//                     <button
//                         onClick={handleDelete}
//                         disabled={isDeleting}
//                         className={`p-1.5 rounded transition ${
//                         isDeleting
//                             ? "text-gray-400 cursor-not-allowed"
//                             : "text-red-600 hover:bg-red-50 cursor-pointer"
//                         }`}
//                     >
//                         {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
//                     </button>
//                 </Tooltip>
//             </div>
//           </div>
//         );
//       },
//       dataIndex: "name",
//       key: "name",
//       fixed: "left",
//       width: isFluid ? undefined : 250, // ✅ Fluid Logic
//       sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
//       sortOrder: sortType === "name" ? mapAntSortOrder(sortOrder) : undefined,
//       render: (name: string, record: any) => {
//         const isSelected = selectedPartIds.includes(record.id);
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
//                   className="h-5 w-5 accent-blue-600 cursor-pointer"
//                 />
//               ) : (
//                 <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
//                   <AvatarFallback>{renderInitials(name)}</AvatarFallback>
//                 </ShadCNAvatar>
//               )}
//             </div>
//             <span
//               className="truncate cursor-pointer hover:text-orange-600 hover:underline"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedPartTable(record.fullPart);
//                 setIsOpenPartDetailsModal(true);
//               }}
//             >
//               {name}
//             </span>
//           </div>
//         );
//       },
//     };

//     const dynamicColumns: TableColumnType<any>[] = visibleColumns
//       .map((colName) => {
//         const config = columnConfig[colName];
//         if (!config) return null;
//         if (colName === "Name") return null;

//         let renderFunc: ((value: any, record: any) => React.ReactNode) | undefined = undefined;

//         if (colName === "Part ID") {
//           renderFunc = (id: string) => (
//             <Tooltip text={id}>
//               <span>#{id.substring(0, 8)}...</span>
//             </Tooltip>
//           );
//         } else if (colName === "Unit Cost") {
//           renderFunc = (val: number) => <span className="text-muted-foreground">${(val || 0).toFixed(2)}</span>;
//         } else if (colName === "Stock") {
//           renderFunc = (_: any, record: any) => (
//             <span className="text-muted-foreground">{record.totalStock} / Min {record.minStock}</span>
//           );
//         } else if (colName === "Vendors") {
//           renderFunc = (vendors: any[]) => (
//             <div className="flex flex-col gap-1 text-xs text-muted-foreground">
//               {vendors && vendors.length > 0
//                 ? vendors.map((v) => <span key={v.id} className="bg-gray-100 px-2 py-0.5 rounded w-fit">{v.name}</span>)
//                 : "—"}
//             </div>
//           );
//         } else if (colName === "Teams") {
//           renderFunc = (text: string) => <span className="text-muted-foreground">{text || "—"}</span>;
//         } else if (colName === "Created At") {
//           renderFunc = (text: string) => formatDateOnly(text) || "—";
//         } else if (colName === "Updated At") {
//           renderFunc = (text: string) => formatDateOnly(text) || "—";
//         }

//         return {
//           title: colName,
//           dataIndex: config.dataIndex,
//           key: config.dataIndex,
//           width: isFluid ? undefined : config.width, // ✅ Fluid Logic
//           sorter: config.sorter,
//           sortOrder: sortType === config.dataIndex ? mapAntSortOrder(sortOrder) : undefined,
//           render: renderFunc,
//         };
//       })
//       .filter(Boolean) as TableColumnType<any>[];

//     return [nameColumn, ...dynamicColumns];
//   }, [isEditing, sortType, sortOrder, visibleColumns, areAllSelected, selectedCount, selectedPartIds, isDeleting, isFluid]); // Added isFluid

//   const dataSource = useMemo(() => {
//     return inventory.map((part) => {
//       const totalStock = part.locations?.reduce((acc: number, loc: any) => acc + (loc.unitsInStock || 0), 0) || 0;
//       const minStock = part.locations?.reduce((acc: number, loc: any) => acc + (loc.minimumInStock || 0), 0) || 0;
//       const locationString = part.locations?.map((l: any) => `${l.name} (${l.area})`).join(", ") || "—";
//       const teamsString = part.teams?.map((t: any) => t.name).join(", ") || "";

//       return {
//         key: part.id,
//         id: part.id,
//         name: part.name,
//         unitCost: part.unitCost,
//         totalStock,
//         minStock,
//         locationString,
//         teamsString,
//         vendors: part.vendors,
//         createdAt: part.createdAt,
//         updatedAt: part.updatedAt,
//         fullPart: part,
//       };
//     });
//   }, [inventory]);

//   return (
//     <div className="flex-1 overflow-auto p-2">
//       <style>{tableStyles}</style>

//       <Card className="shadow-sm border rounded-lg overflow-hidden w-full">
//         <CardContent className="p-0">
//           <Table
//             columns={columns}
//             dataSource={dataSource}
//             pagination={false}
//             scroll={{
//                 x: isFluid ? undefined : "max-content", // ✅ Fluid Scroll Logic
//                 y: "75vh"
//             }}
//             rowClassName={(record: any) => selectedPartIds.includes(record.id) ? "selected-row-class" : ""}
//             onChange={handleTableChange}
//             rowSelection={{
//               selectedRowKeys: selectedPartIds,
//               columnWidth: 0,
//               renderCell: () => null,
//               columnTitle: " ",
//             }}
//             onRow={(record) => ({
//               onClick: () => { toggleRowSelection(record.id); },
//             })}
//             locale={{ emptyText: "No parts found." }}
//           />
//         </CardContent>
//       </Card>

//       <SettingsModal
//         isOpen={isSettingsModalOpen}
//         onClose={() => setIsSettingsModalOpen(false)}
//         onApply={handleApplySettings}
//         allToggleableColumns={allAvailableColumns}
//         currentVisibleColumns={visibleColumns}
//         currentShowDeleted={showDeleted}
//         componentName="Parts"
//       />

//       {isOpenPartDetailsModal && (
//         <AssetTableModal
//           data={selectedPartTable}
//           onClose={() => setIsOpenPartDetailsModal(false)}
//           showDetailsSection={"part"}
//           restoreData={"Restore"}
//           fetchData={fetchPartsData}
//         />
//       )}

//       {/* ✅ Render Restock Modal */}
//       {restockPartId && (
//         <RestockModal
//             isOpen={!!restockPartId}
//             onClose={() => setRestockPartId(null)}
//             part={inventory.find(p => p.id === restockPartId)}
//             onConfirm={() => {
//                 fetchPartsData();
//                 setRestockPartId(null);
//             }}
//         />
//       )}

//       {/* ✅ Render Edit Part Modal */}
//       {editPartId && (
//         <EditPartModalWrapper
//             partId={editPartId}
//             onClose={() => setEditPartId(null)}
//             onRefresh={fetchPartsData}
//         />
//       )}
//     </div>
//   );
// }

"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";

// Antd & Icons
import { Table, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";
import { Settings, Trash2, Loader2, Edit, Plus, X } from "lucide-react"; 
import toast from "react-hot-toast";


// Imports
import SettingsModal from "../utils/SettingsModal";
import { formatDateOnly } from "../utils/Date";
import { partService } from "../../store/parts";
import AssetTableModal from "../utils/AssetTableModal";
import { Tooltip } from "../ui/tooltip";

// Import Modals for Table Actions
import RestockModal from "./PartDetail/RestockModal";
import { NewPartForm } from "./NewPartForm/NewPartForm";

// --- Constants ---
const STORAGE_KEY_PART_COLUMNS = "part_table_visible_columns";

// --- Helper Functions ---

const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

const renderInitials = (text: string) =>
  text
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// ✅ UPDATED STYLES: Single line headers, small text, custom scrollbar
const tableStyles = `
  .selected-row-class > td {
    background-color: #f0f9ff !important;
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
    background-color: #f9fafb !important;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap !important; /* ✅ Single line headers */
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px !important; /* ✅ Small text */
    color: #374151;
  }
  /* ✅ CUSTOM SCROLLBAR (Matched ListView) */
  .ant-table-body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .ant-table-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .ant-table-body::-webkit-scrollbar-thumb {
    background: #d1d5db; 
    border-radius: 9999px;
  }
  .ant-table-body::-webkit-scrollbar-thumb:hover {
    background: #9ca3af; 
  }
`;

const allAvailableColumns = [
  "Name",
  "Part ID",
  "Unit Cost",
  "Available Quantity", 
  "Minimum In Stock",   
  "Ordered Quantity",   
  "Reserved Quantity",  
  "Stock",              
  "Location",
  "Vendors",
  "Teams",
  "Created At",
  "Updated At",
];

const columnConfig: {
  [key: string]: {
    dataIndex: string;
    width: number;
    sorter?: (a: any, b: any) => number;
  };
} = {
  Name: {
    dataIndex: "name",
    width: 250,
    sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
  },
  "Part ID": {
    dataIndex: "id",
    width: 150,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  "Unit Cost": {
    dataIndex: "unitCost",
    width: 120,
    sorter: (a, b) => (a.unitCost || 0) - (b.unitCost || 0),
  },
  "Available Quantity": { 
    dataIndex: "totalStock",
    width: 180, 
    sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
  },
  "Minimum In Stock": { 
    dataIndex: "minStock",
    width: 180, 
    sorter: (a, b) => (a.minStock || 0) - (b.minStock || 0),
  },
  "Ordered Quantity": { 
    dataIndex: "orderedQty",
    width: 180, 
    sorter: (a, b) => (a.orderedQty || 0) - (b.orderedQty || 0),
  },
  "Reserved Quantity": { 
    dataIndex: "reservedQty",
    width: 180, 
    sorter: (a, b) => (a.reservedQty || 0) - (b.reservedQty || 0),
  },
  Stock: {
    dataIndex: "totalStock",
    width: 150,
    sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
  },
  Location: {
    dataIndex: "locationString",
    width: 200,
    sorter: (a, b) =>
      (a.locationString || "").localeCompare(b.locationString || ""),
  },
  Vendors: {
    dataIndex: "vendors",
    width: 200,
    sorter: (a, b) =>
      (a.vendors?.[0]?.name || "").localeCompare(b.vendors?.[0]?.name || ""),
  },
  Teams: {
    dataIndex: "teamsString",
    width: 150,
    sorter: (a, b) => (a.teamsString || "").localeCompare(b.teamsString || ""),
  },
  "Created At": {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  "Updated At": {
    dataIndex: "updatedAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
};

// --- Internal Wrapper for Edit Modal ---
function EditPartModalWrapper({ partId, onClose, onRefresh }: { partId: string; onClose: () => void; onRefresh: () => void }) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    partService
      .fetchPartById(partId)
      .then((data) => {
        if (mounted) {
          setItem({
             ...data,
             _original: data,
             pictures: data.photos || [],
             files: data.files || [],
             partsType: data.partsType || [],
             assetIds: data.assetIds || [],
             teamsInCharge: data.teamsInCharge || [],
             vendorIds: data.vendorIds || [],
             vendors: data.vendors || [],
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load part details");
        onClose();
      });
    return () => {
      mounted = false;
    };
  }, [partId, onClose]);

  if (loading || !item) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
          <Loader2 className="animate-spin text-orange-600" />
          <span>Loading Part...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
       <div className="flex-1 overflow-hidden">
          <NewPartForm 
            newItem={item}
            setNewItem={setItem}
            addVendorRow={() => setItem((prev: any) => ({ ...prev, vendors: [...(prev.vendors || []), { vendorId: "", orderingPartNumber: "" }] }))}
            removeVendorRow={(idx: number) => setItem((prev: any) => ({ ...prev, vendors: (prev.vendors || []).filter((_: any, i: number) => i !== idx) }))}
            onCancel={onClose}
            onCreate={() => {
                onRefresh();
                onClose();
            }}
          />
       </div>
       {/* Floating Close Button */}
       <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 shadow-sm z-[100000]"
       >
          <X size={20} />
       </button>
    </div>
  );
}

export function PartTable({
  inventory,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  fetchPartsData,
  showDeleted,
  setShowDeleted,
}: {
  inventory: any[];
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  fetchPartsData: () => void;
  showDeleted: boolean;
  setShowDeleted: (v: boolean) => void;
}) {
  // --- 1. Production Level State Initialization ---
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PART_COLUMNS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Error parsing part column settings:", error);
      }
    }
    return allAvailableColumns;
  });

  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modals
  const [restockPartId, setRestockPartId] = useState<string | null>(null);
  const [editPartId, setEditPartId] = useState<string | null>(null);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const allPartIds = useMemo(() => inventory.map((p) => p.id), [inventory]);
  const selectedCount = selectedPartIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allPartIds.length > 0 && selectedCount === allPartIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;
  
  const [isOpenPartDetailsModal, setIsOpenPartDetailsModal] = useState(false);
  const [selectedPartTable, setSelectedPartTable] = useState<string[]>([]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedPartIds([]);
    else setSelectedPartIds(allPartIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedPartIds.length === 0) {
      toast.error("No parts selected to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      await partService.batchDeletePart(selectedPartIds);
      toast.success("Parts deleted successfully!");
      setSelectedPartIds([]);
      fetchPartsData();
    } catch (err) {
      console.error("Error bulk deleting parts:", err);
      toast.error("Failed to delete parts.");
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
      setSortType("name");
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
    setVisibleColumns(settings.visibleColumns);
    setShowDeleted(settings.showDeleted);

    // Persistence Logic
    if (typeof window !== "undefined") {
      const hasSameLength =
        settings.visibleColumns.length === allAvailableColumns.length;
      const hasAllColumns =
        hasSameLength &&
        allAvailableColumns.every((col) =>
          settings.visibleColumns.includes(col)
        );

      if (hasAllColumns) {
        localStorage.removeItem(STORAGE_KEY_PART_COLUMNS);
      } else {
        localStorage.setItem(
          STORAGE_KEY_PART_COLUMNS,
          JSON.stringify(settings.visibleColumns)
        );
      }
    }

    setIsSettingsModalOpen(false);
  };

  const columns: TableColumnType<any>[] = useMemo(() => {
    const nameColumn: TableColumnType<any> = {
      title: () => {
        if (!isEditing) {
          return (
            <div className="flex items-center justify-between gap-2 h-full w-full">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={areAllSelected}
                  onChange={handleSelectAllToggle}
                  className="h-4 w-4 accent-blue-600 cursor-pointer"
                />
                <span className="text-gray-600">Name</span>
              </div>
              {/* ❌ Removed Resize/Fit to Screen Toggle as requested */}
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
              className="h-4 w-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
              {selectedCount} Selected
            </span>

            <div className="flex items-center gap-1">
              <Tooltip text="Delete">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`p-1.5 rounded transition ${
                    isDeleting
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50 cursor-pointer"
                  }`}
                >
                  {isDeleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        );
      },
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 250, 
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      sortOrder: sortType === "name" ? mapAntSortOrder(sortOrder) : undefined,
      render: (name: string, record: any) => {
        const isSelected = selectedPartIds.includes(record.id);
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
                  className="h-5 w-5 accent-blue-600 cursor-pointer"
                />
              ) : (
                <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>{renderInitials(name)}</AvatarFallback>
                </ShadCNAvatar>
              )}
            </div>
            <span
              className="truncate cursor-pointer hover:text-orange-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPartTable(record.fullPart);
                setIsOpenPartDetailsModal(true);
              }}
            >
              {name}
            </span>
          </div>
        );
      },
    };

    const dynamicColumns: TableColumnType<any>[] = visibleColumns
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;
        if (colName === "Name") return null;

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        if (colName === "Part ID") {
          renderFunc = (id: string) => (
            <Tooltip text={id}>
              <span>#{id.substring(0, 8)}...</span>
            </Tooltip>
          );
        } else if (colName === "Unit Cost") {
          renderFunc = (val: number) => (
            <span className="text-muted-foreground">
              ${(val || 0).toFixed(2)}
            </span>
          );
        } else if (colName === "Stock") {
          renderFunc = (_: any, record: any) => (
            <span className="text-muted-foreground">{record.totalStock}</span>
          );
        } else if (colName === "Available Quantity") { // 🆕
          renderFunc = (val: number) => <span className="text-muted-foreground font-medium">{val}</span>;
        } else if (colName === "Minimum In Stock") { // 🆕
          renderFunc = (val: number) => <span className="text-muted-foreground">{val}</span>;
        } else if (colName === "Ordered Quantity") { // 🆕
          renderFunc = (val: number) => <span className="text-muted-foreground">{val}</span>;
        } else if (colName === "Reserved Quantity") { // 🆕
          renderFunc = (val: number) => <span className="text-muted-foreground">{val}</span>;
        } else if (colName === "Vendors") {
          renderFunc = (vendors: any[]) => (
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              {vendors && vendors.length > 0
                ? vendors.map((v) => (
                    <span
                      key={v.id}
                      className="bg-gray-100 px-2 py-0.5 rounded w-fit"
                    >
                      {v.name}
                    </span>
                  ))
                : "—"}
            </div>
          );
        } else if (colName === "Teams") {
          renderFunc = (text: string) => (
            <span className="text-muted-foreground">{text || "—"}</span>
          );
        } else if (colName === "Created At") {
          renderFunc = (text: string) => formatDateOnly(text) || "—";
        } else if (colName === "Updated At") {
          renderFunc = (text: string) => formatDateOnly(text) || "—";
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
  }, [isEditing, sortType, sortOrder, visibleColumns, areAllSelected, selectedCount, selectedPartIds, isDeleting]);

  const dataSource = useMemo(() => {
    return inventory.map((part) => {
      const totalStock =
        part.locations?.reduce(
          (acc: number, loc: any) => acc + (loc.unitsInStock || 0),
          0
        ) || 0;
      const minStock =
        part.locations?.reduce(
          (acc: number, loc: any) => acc + (loc.minimumInStock || 0),
          0
        ) || 0;
      const locationString =
        part.locations?.map((l: any) => `${l.name} (${l.area})`).join(", ") ||
        "—";
      const teamsString = part.teams?.map((t: any) => t.name).join(", ") || "";

      return {
        key: part.id,
        id: part.id,
        name: part.name,
        unitCost: part.unitCost,
        totalStock, 
        minStock,   
        orderedQty: part.orderedQuantity || 0,
        reservedQty: part.reservedQuantity || 0,
        
        locationString,
        teamsString,
        vendors: part.vendors,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
        fullPart: part,
      };
    });
  }, [inventory]);

  return (
    // ✅ H-FULL structure to push footer to bottom
    <div className="h-full flex flex-col p-4">
      <style>{tableStyles}</style>

      {/* ✅ Flex-1 Card to take available space */}
      <Card className="flex-1 flex flex-col shadow-sm border rounded-lg overflow-hidden">
        <CardContent className="flex-1 p-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            // ✅ Matched Scroll Height to ListView logic (screen height - offset)
            scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
            rowClassName={(record: any) => selectedPartIds.includes(record.id) ? "selected-row-class" : ""}
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedPartIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ",
            }}
            onRow={(record) => ({
              onClick: () => {
                toggleRowSelection(record.id);
              },
            })}
            locale={{ emptyText: "No parts found." }}
          />
        </CardContent>

        {/* ✅ PAGINATION FOOTER - Matched ListView style exactly */}
        <div className="flex-shrink-0 flex items-center justify-end p-3 border-t border-gray-100 bg-white">
          <div className="inline-flex items-center gap-4 rounded-md border bg-white p-2 shadow-sm">
            <span className="text-sm text-gray-600">
              1 – {inventory.length} of {inventory.length}
            </span>
            <button className="text-gray-400 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </Card>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        componentName="Parts"
      />

      {isOpenPartDetailsModal && (
        <AssetTableModal
          data={selectedPartTable}
          onClose={() => setIsOpenPartDetailsModal(false)}
          showDetailsSection={"part"}
          restoreData={"Restore"}
          fetchData={fetchPartsData}
        />
      )}

      {/* Render Restock Modal */}
      {restockPartId && (
        <RestockModal
          isOpen={!!restockPartId}
          onClose={() => setRestockPartId(null)}
          part={inventory.find((p) => p.id === restockPartId)}
          onConfirm={() => {
            fetchPartsData();
            setRestockPartId(null);
          }}
        />
      )}

      {/* Render Edit Part Modal */}
      {editPartId && (
        <EditPartModalWrapper
          partId={editPartId}
          onClose={() => setEditPartId(null)}
          onRefresh={fetchPartsData}
        />
      )}
    </div>
  );
}
