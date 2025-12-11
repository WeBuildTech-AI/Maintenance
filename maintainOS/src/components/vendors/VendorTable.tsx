// "use client";
// import React, { useState, useRef, useEffect, useMemo } from "react";
// import { Card, CardContent } from "../ui/card";
// import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";

// import { Table, Tooltip as AntTooltip } from "antd";
// import type { TableProps, TableColumnType } from "antd";

// import { Trash2, Loader2 } from "lucide-react";
// import { formatDateOnly } from "../utils/Date"; // Path check kar lein
// import toast from "react-hot-toast";
// import SettingsModal from "../utils/SettingsModal";
// import { type Vendor } from "./vendors.types";
// import { vendorService } from "../../store/vendors";
// import AssetTableModal from "../utils/AssetTableModal";
// import { Tooltip } from "../ui/tooltip";

// // --- Helper Functions ---

// const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
//   order === "asc" ? "ascend" : "descend";

// // Row Styling
// const tableStyles = `
//   .selected-row-class > td {
//     background-color: #f0f9ff !importableAnt; /* Blue selection color */
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
//     background-color: #f9fafb !important; /* Header BG */
//     text-transform: uppercase;
//     font-size: 12px;
//     font-weight: 600;
//     color: #6b7280;
//   }
//   .ant-table-tbody > tr > td {
//     border-bottom: 1px solid #f3f4f6; /* Lighter border */
//   }
// `;
// // --- End Helper Functions ---

// // Column Configuration
// const allAvailableColumns = ["ID", "Parts", "Locations", "Created", "Updated"];

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
//   Parts: {
//     dataIndex: "parts",
//     width: 180,
//     sorter: (a, b) => (a.parts || "").localeCompare(b.parts || ""),
//   },
//   Locations: {
//     dataIndex: "locations",
//     width: 180,
//     sorter: (a, b) => (a.locations || "").localeCompare(b.locations || ""),
//   },
//   Created: {
//     dataIndex: "createdAt",
//     width: 150,
//     sorter: (a, b) =>
//       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//   },
//   Updated: {
//     dataIndex: "updatedAt",
//     width: 150,
//     sorter: (a, b) =>
//       new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
//   },
// };

// export function VendorTable({
//   vendors,
//   isSettingModalOpen,
//   setIsSettingModalOpen,
//   fetchVendors,
//   setShowDeleted,
//   showDeleted,
// }: {
//   vendors: Vendor[];
//   isSettingModalOpen: any; // Type 'any' rakha hai aapke code ke hisaab se
//   setIsSettingModalOpen: (isOpen: boolean) => void;
//   fetchVendors: () => void;
//   showDeleted: boolean;
//   setShowDeleted: (value: boolean) => void;
// }) {
//   // State Management
//   const [visibleColumns, setVisibleColumns] =
//     useState<string[]>(allAvailableColumns);
//   const [sortType, setSortType] = useState<string>("name");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const headerCheckboxRef = useRef<HTMLInputElement>(null);
//   const [isOpenVendorDetailsModal, setIsOpenVendorDetailsModal] =
//     useState(false);
//   const [selectedVendorTable, setSelectedVendorTable] = useState<Vendor | null>(
//     null
//   );

//   const renderInitials = (text: string) =>
//     text
//       .split(" ")
//       .map((p) => p[0])
//       .slice(0, 2)
//       .join("")
//       .toUpperCase();

//   // Selection Logic
//   const allVendorIds = useMemo(() => vendors.map((p) => p.id), [vendors]);
//   const selectedCount = selectedVendorIds.length;
//   const isEditing = selectedCount > 0;
//   const areAllSelected =
//     allVendorIds.length > 0 && selectedCount === allVendorIds.length;
//   const isIndeterminate = selectedCount > 0 && !areAllSelected;

//   useEffect(() => {
//     if (headerCheckboxRef.current) {
//       headerCheckboxRef.current.indeterminate = isIndeterminate;
//     }
//   }, [isIndeterminate, isEditing]);

//   const handleSelectAllToggle = () => {
//     if (areAllSelected) setSelectedVendorIds([]);
//     else setSelectedVendorIds(allVendorIds);
//   };

//   const toggleRowSelection = (id: string) => {
//     setSelectedVendorIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   // Delete Handler
//   const handleDelete = async () => {
//     if (selectedVendorIds.length === 0) {
//       toast.error("No vendors selected to delete.");
//       return;
//     }
//     setIsDeleting(true);
//     try {
//       // ⭐ FIX: Delete service call ko uncomment kiya
//       await vendorService.batchDeleteVendor(selectedVendorIds);
//       toast.success("Vendors deleted successfully!");
//       setSelectedVendorIds([]);
//       fetchVendors();
//     } catch (err) {
//       console.error("Error bulk deleting vendors:", err);
//       toast.error("Failed to delete vendors.");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Table Change Handler
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
//       setSortType("name");
//       setSortOrder("asc");
//     }
//   };

//   // Settings Handler
//   const handleApplySettings = (settings: {
//     resultsPerPage: number;
//     showDeleted: boolean;
//     sortColumn: string;
//     visibleColumns: string[];
//   }) => {
//     setVisibleColumns(settings.visibleColumns);
//     setShowDeleted(settings.showDeleted);
//     // fetchVendors();
//     setIsSettingModalOpen(false);
//   };

//   // Columns Definition
//   const columns: TableColumnType<any>[] = useMemo(() => {
//     // --- Name Column (Fixed Left) ---
//     const nameColumn: TableColumnType<any> = {
//       title: () => {
//         if (!isEditing) {
//           // Default Header
//           return (
//             <div className="flex items-center justify-between gap-2 h-full">
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
//             </div>
//           );
//         }
//         // Bulk Edit Header
//         return (
//           <div className="flex items-center gap-4 h-full">
//             <input
//               type="checkbox"
//               ref={headerCheckboxRef}
//               checked={areAllSelected}
//               onChange={handleSelectAllToggle}
//               className="h-4 w-4 accent-blue-600 cursor-pointer"
//             />
//             <span className="text-sm font-medium text-gray-900">
//               Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
//             </span>
//             {/* Delete Button */}
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
//       dataIndex: "name",
//       key: "name",
//       fixed: "left",
//       width: 250,
//       sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
//       sortOrder: sortType === "name" ? mapAntSortOrder(sortOrder) : undefined,
//       render: (name: string, record: any) => {
//         const isSelected = selectedVendorIds.includes(record.id);
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
//                 setIsOpenVendorDetailsModal(true);
//                 setSelectedVendorTable(record.fullVendor);
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

//         let renderFunc:
//           | ((value: any, record: any) => React.ReactNode)
//           | undefined = undefined;

//         if (colName === "ID") {
//           renderFunc = (id: string) => (
//             <Tooltip text={id}>
//               <span>#{id.substring(0, 8)}...</span>
//             </Tooltip>
//           );
//         } else if (colName === "Created" || colName === "Updated") {
//           renderFunc = (text: string) => formatDateOnly(text) || "—";
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
//     selectedVendorIds,
//     isDeleting,
//   ]);

//   const dataSource = useMemo(() => {
//     return vendors.map((vendor) => ({
//       key: vendor.id,
//       id: vendor.id,
//       name: vendor.name,
//       parts: vendor.partsSummary ?? "—",
//       locations:
//         vendor.locations?.map((loc: any) => loc.name).join(", ") || "—",
//       createdAt: vendor.createdAt,
//       updatedAt: vendor.updatedAt,
//       fullVendor: vendor,
//     }));
//   }, [vendors]);

//   // JSX
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
//               selectedVendorIds.includes(record.id) ? "selected-row-class" : ""
//             }
//             onChange={handleTableChange}
//             rowSelection={{
//               selectedRowKeys: selectedVendorIds,
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
//               emptyText: "No vendors found.",
//             }}
//           />
//         </CardContent>
//       </Card>

//       {/* Settings Modal */}
//       <SettingsModal
//         isOpen={isSettingModalOpen}
//         onClose={() => setIsSettingModalOpen(false)}
//         onApply={handleApplySettings}
//         allToggleableColumns={allAvailableColumns}
//         currentVisibleColumns={visibleColumns}
//         currentShowDeleted={showDeleted}
//         componentName="Vendor"
//       />

//       {isOpenVendorDetailsModal && selectedVendorTable && (
//         <AssetTableModal
//           data={selectedVendorTable}
//           onClose={() => setIsOpenVendorDetailsModal(false)}
//           showDetailsSection={"vendor"}
//           restoreData={"restore"}
//           fetchData={fetchVendors}
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
import { Trash2, Loader2, Edit, X, User, MapPin, Box, Settings } from "lucide-react"; 
import toast from "react-hot-toast";

// Imports
import SettingsModal from "../utils/SettingsModal";
import { formatDateOnly } from "../utils/Date";
import { vendorService } from "../../store/vendors"; // ✅ Use Vendor Service
import AssetTableModal from "../utils/AssetTableModal"; // ✅ Reusing generic modal if compatible, or just use details
import { Tooltip } from "../ui/tooltip";

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

// ✅ UPDATED STYLES: Matches PartTable exactly
const tableStyles = `
  .selected-row-class > td {
    background-color: #f0f9ff !importableAnt; /* Blue selection color */
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
    white-space: nowrap !important;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px !important;
    color: #374151;
  }
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
  "Vendor ID",
  "Type",
  "Contacts",
  "Locations",
  "Assets",
  "Parts",
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
  "Vendor ID": {
    dataIndex: "id",
    width: 150,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  Type: {
    dataIndex: "vendorType",
    width: 150,
    sorter: (a, b) => (a.vendorType || "").localeCompare(b.vendorType || ""),
  },
  Contacts: {
    dataIndex: "contacts",
    width: 200,
    sorter: (a, b) => (a.contacts?.length || 0) - (b.contacts?.length || 0),
  },
  Locations: {
    dataIndex: "locationString",
    width: 200,
    sorter: (a, b) => (a.locationString || "").localeCompare(b.locationString || ""),
  },
  Assets: {
    dataIndex: "assetCount",
    width: 120,
    sorter: (a, b) => (a.assetCount || 0) - (b.assetCount || 0),
  },
  Parts: {
    dataIndex: "partCount",
    width: 120,
    sorter: (a, b) => (a.partCount || 0) - (b.partCount || 0),
  },
  "Created At": {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  "Updated At": {
    dataIndex: "updatedAt",
    width: 150,
    sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
};

// --- Internal Wrapper for Edit Modal (Same logic as PartTable) ---
function EditVendorModalWrapper({ vendorId, onClose, onRefresh }: { vendorId: string; onClose: () => void; onRefresh: () => void }) {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    vendorService.fetchVendorById(vendorId)
      .then((data) => {
        if (mounted) {
          setVendor(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load vendor details");
        onClose();
      });
    return () => { mounted = false; };
  }, [vendorId, onClose]);

  if (loading || !vendor) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
          <Loader2 className="animate-spin text-orange-600" />
          <span>Loading Vendor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
       <div className="flex-1 overflow-hidden">
          <VendorForm 
            initialData={vendor}
            onCancel={onClose}
            onSuccess={() => {
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

export function VendorTable({
  vendors,
  isSettingModalOpen,
  setIsSettingModalOpen,
  fetchVendors,
  showDeleted,
  setShowDeleted,
}: {
  vendors: any[];
  isSettingModalOpen: boolean;
  setIsSettingModalOpen: (isOpen: boolean) => void;
  fetchVendors: () => void;
  showDeleted: boolean;
  setShowDeleted: (v: boolean) => void;
}) {
  // State Management
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);
  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit State
  const [editVendorId, setEditVendorId] = useState<string | null>(null);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const allVendorIds = useMemo(() => vendors.map((v) => v.id), [vendors]);
  const selectedCount = selectedVendorIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected = allVendorIds.length > 0 && selectedCount === allVendorIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;
  
  const [isOpenVendorDetailsModal, setIsOpenVendorDetailsModal] = useState(false);
  const [selectedVendorTable, setSelectedVendorTable] = useState<any>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedVendorIds([]);
    else setSelectedVendorIds(allVendorIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedVendorIds.length === 0) {
      toast.error("No vendors selected to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      await vendorService.batchDeleteVendor(selectedVendorIds);
      toast.success("Vendors deleted successfully!");
      setSelectedVendorIds([]);
      fetchVendors();
    } catch (err) {
      console.error("Error bulk deleting vendors:", err);
      toast.error("Failed to delete vendors.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTableChange: TableProps<any>["onChange"] = (_pagination, _filters, sorter) => {
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

  // Settings Handler
  const handleApplySettings = (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
    visibleColumns: string[];
  }) => {
    setVisibleColumns(settings.visibleColumns);
    setShowDeleted(settings.showDeleted);
    // fetchVendors();
    setIsSettingModalOpen(false);
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
                {/* ✅ Edit Button */}
                <Tooltip text="Edit">
                    <button
                        onClick={() => {
                            if (selectedCount === 1) setEditVendorId(selectedVendorIds[0]);
                        }}
                        disabled={selectedCount !== 1}
                        className={`p-1.5 rounded transition ${
                        selectedCount === 1
                            ? "text-blue-600 hover:bg-blue-50 cursor-pointer"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                    >
                        <Edit size={18} />
                    </button>
                </Tooltip>

                {/* ✅ Delete Button */}
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
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
        const isSelected = selectedVendorIds.includes(record.id);
        const picture = record.fullVendor?.pictureUrl?.[0];
        
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
              ) : picture ? (
                <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
                  <ShadCNAvatar.Image src={`data:${picture.mimetype};base64,${picture.base64}`} alt={name} />
                  <AvatarFallback>{renderInitials(name)}</AvatarFallback>
                </ShadCNAvatar>
              ) : (
                <div
                    className="flex items-center justify-center rounded-full text-white font-semibold text-xs flex-shrink-0"
                    style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: record.fullVendor.color || "#2563eb",
                    }}
                >
                    {renderInitials(name)}
                </div>
              )}
            </div>
            <span
              className="truncate cursor-pointer hover:text-orange-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVendorTable(record.fullVendor);
                setIsOpenVendorDetailsModal(true);
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

        let renderFunc: ((value: any, record: any) => React.ReactNode) | undefined = undefined;

        if (colName === "Vendor ID") {
          renderFunc = (id: string) => (
            <Tooltip text={id}>
              <span>#{id.substring(0, 8)}...</span>
            </Tooltip>
          );
        } else if (colName === "Type") {
          renderFunc = (type: string) => (
             <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-xs font-medium">
                {type || "Standard"}
             </span>
          );
        } else if (colName === "Contacts") {
          renderFunc = (contacts: any[]) => {
             if (!contacts || contacts.length === 0) return <span className="text-muted-foreground">—</span>;
             return (
                <div className="flex flex-col gap-1">
                    {contacts.slice(0, 2).map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                             <User size={12} className="text-gray-400" />
                             <span>{c.fullName || c.name}</span>
                        </div>
                    ))}
                    {contacts.length > 2 && <span className="text-xs text-blue-500">+{contacts.length - 2} more</span>}
                </div>
             );
          };
        } else if (colName === "Locations") {
          renderFunc = (loc: string) => {
            if (!loc) return <span className="text-muted-foreground">—</span>;
            return (
                <div className="flex items-center gap-1.5" title={loc}>
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate max-w-[180px]">{loc}</span>
                </div>
            );
          };
        } else if (colName === "Assets") {
           renderFunc = (count: number) => (
               <div className="flex items-center gap-1.5 text-gray-600">
                  <Box size={14} className="text-gray-400" />
                  <span>{count}</span>
               </div>
           );
        } else if (colName === "Parts") {
           renderFunc = (count: number) => (
               <div className="flex items-center gap-1.5 text-gray-600">
                  <Settings size={14} className="text-gray-400" />
                  <span>{count}</span>
               </div>
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
          sortOrder: sortType === config.dataIndex ? mapAntSortOrder(sortOrder) : undefined,
          render: renderFunc,
        };
      })
      .filter(Boolean) as TableColumnType<any>[];

    return [nameColumn, ...dynamicColumns];
  }, [isEditing, sortType, sortOrder, visibleColumns, areAllSelected, selectedCount, selectedVendorIds, isDeleting]);

  const dataSource = useMemo(() => {
    return vendors.map((vendor) => {
      const locationString = vendor.locations?.map((l: any) => typeof l === 'string' ? l : l.name).join(", ") || "";
      
      return {
        key: vendor.id,
        id: vendor.id,
        name: vendor.name,
        vendorType: vendor.vendorType,
        contacts: vendor.contacts,
        locationString,
        assetCount: vendor.assets?.length || vendor.assetIds?.length || 0,
        partCount: vendor.parts?.length || vendor.partIds?.length || 0,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        fullVendor: vendor,
      };
    });
  }, [vendors]);

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
            // ✅ Matched Scroll Height to PartTable logic
            scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
            rowClassName={(record: any) => selectedVendorIds.includes(record.id) ? "selected-row-class" : ""}
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedVendorIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ",
            }}
            onRow={(record) => ({
              onClick: () => { toggleRowSelection(record.id); },
            })}
            locale={{ emptyText: "No vendors found." }}
          />
        </CardContent>

        {/* ✅ PAGINATION FOOTER - Matched PartTable style exactly */}
        <div className="flex-shrink-0 flex items-center justify-end p-3 border-t border-gray-100 bg-white">
          <div className="inline-flex items-center gap-4 rounded-md border bg-white p-2 shadow-sm">
            <span className="text-sm text-gray-600">
              1 – {vendors.length} of {vendors.length}
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        componentName="Vendor"
      />

      {isOpenVendorDetailsModal && (
        <AssetTableModal
          data={selectedVendorTable}
          onClose={() => setIsOpenVendorDetailsModal(false)}
          showDetailsSection={"vendor"}
          restoreData={"Restore"}
          fetchData={fetchVendors}
        />
      )}

      {/* ✅ Render Edit Vendor Modal */}
      {editVendorId && (
        <EditVendorModalWrapper 
            vendorId={editVendorId} 
            onClose={() => setEditVendorId(null)} 
            onRefresh={fetchVendors} 
        />
      )}
    </div>
  );
}