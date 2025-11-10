import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Pencil,
  Copy,
  MoreVertical,
  ChevronUp,
  ClipboardList,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
// --- 💡 1. useState aur naye components import kiye ---
import React, { useState } from "react";
import { MoreActionsMenu } from "../GenerateProcedure/components/MoreActionsMenu";
import { ConfirmationModal } from "../GenerateProcedure/components/ConfirmationModal";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteProcedure } from "../../../store/procedures/procedures.thunks";
import { AppDispatch } from "../../../store";

// Date helper function
function formatTableDate(dateString: string) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
}

// 💡 2. Naye props add kiye
interface LibraryTableProps {
  procedures: any[];
  sortType: string;
  sortOrder: "asc" | "desc";
  onSortChange: (type: string, order: "asc" | "desc") => void;
  onRefresh: () => void; // Delete ke baad refresh karne ke liye
}

export function LibraryTable({
  procedures,
  sortType,
  sortOrder,
  onSortChange,
  onRefresh, // 💡 3. Prop ko receive kiya
}: LibraryTableProps) {
  
  // 💡 4. Modal state aur Redux logic (LibraryDetails.tsx se copy ki)
  const [modalProc, setModalProc] = useState<any | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Helper function naye column par click karne ke liye
  const handleHeaderClick = (columnName: string) => {
    if (sortType === columnName) {
      onSortChange(columnName, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(columnName, "asc");
    }
  };

  // Helper component icon dikhane ke liye (FIXED)
  const SortIcon = ({ column }: { column: string }) => {
    if (sortType !== column) {
      return <ChevronsUpDown size={14} className="text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };
  
  // 💡 5. Delete logic (LibraryDetails.tsx se copy ki)
  const handleDeleteClick = (proc: any) => {
    setModalProc(proc);
  };

  // --- 💡 6. DELETE LOGIC (Updated) ---
  const handleConfirmDelete = async () => {
    if (!modalProc) return;
    try {
      // Delete karne ki koshish karein
      await dispatch(deleteProcedure(modalProc.id)).unwrap();
    } catch (error: any) {
      console.error("Failed to delete procedure:", error);
      // Agar 404 error hai (Not Found), toh alert mat dikhao
      // Kyunki iska matlab item pehle se hi deleted hai.
      if (error?.statusCode !== 404) {
        alert("Failed to delete procedure.");
      }
      // Agar 404 hai, toh hum chup-chaap refresh kar denge.
    } finally {
      // Hamesha modal band karein aur list ko refresh karein
      setModalProc(null);
      onRefresh();
    }
  };
  
  return (
    // Root div (Exactly VendorTable jaisa)
    <div className="flex-1 overflow-auto p-2 flex flex-col">
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <table className="w-full table-fixed text-sm">
            {/* Thead (Exactly VendorTable jaisa) */}
            <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[35%] px-4 py-3 text-left">
                  <button
                    onClick={() => handleHeaderClick("Title")}
                    className="flex items-center gap-1"
                  >
                    Title <SortIcon column="Title" />
                  </button>
                </th>
                <th className="w-[20%] px-4 py-3 text-left">
                  <button
                    onClick={() => handleHeaderClick("Category")}
                    className="flex items-center gap-1"
                  >
                    Category <SortIcon column="Category" />
                  </button>
                </th>
                <th className="w-[15%] px-4 py-3 text-left">
                  <button
                    onClick={() => handleHeaderClick("Created At")}
                    className="flex items-center gap-1"
                  >
                    Created At <SortIcon column="Created At" />
                  </button>
                </th>
                <th className="w-[15%] px-4 py-3 text-left">
                  <button
                    onClick={() => handleHeaderClick("Last updated")}
                    className="flex items-center gap-1"
                  >
                    Last updated <SortIcon column="Last updated" />
                  </button>
                </th>
                <th className="w-[15%] px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((proc) => (
                <tr
                  key={proc.id}
                  className="border-b border-border transition hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-50 text-blue-400">
                          <ClipboardList size={18} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {proc.title || "Untitled Procedure"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {proc.categories?.[0] ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatTableDate(proc.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatTableDate(proc.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex items-center justify-end gap-4 text-gray-500">
                      <button className="hover:text-blue-600">
                        <Pencil size={18} />
                      </button>
                      <button className="hover:text-blue-600">
                        <Copy size={18} />
                      </button>
                      
                      {/* 💡 7. Button ko 'MoreActionsMenu' se wrap kiya */}
                      <MoreActionsMenu onDelete={() => handleDeleteClick(proc)}>
                        <button className="hover:text-blue-600">
                          <MoreVertical size={18} />
                        </button>
                      </MoreActionsMenu>
                      
                    </div>
                  </td>
                </tr>
              ))}
              {procedures.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-muted-foreground"
                    colSpan={5} // 5 columns
                  >
                    No procedures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination (Exactly VendorTable jaisa, Card ke bahar) */}
      <div className="flex items-center justify-end pt-4">
        <div className="inline-flex items-center gap-4 rounded-md border bg-white p-2 shadow-sm">
          <span className="text-sm text-gray-600">
            1 – {procedures.length} of {procedures.length}
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
      
      {/* 💡 8. Modal ko render kiya */}
      <ConfirmationModal
        isOpen={!!modalProc}
        onClose={() => setModalProc(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Procedure"
        message={`Are you sure you want to delete "${modalProc?.title}"?`}
      />
    </div>
  );
}