import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  ClipboardList,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

function formatTableDate(dateString: string) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

export function ListView() {
  const workOrders = [
    {
      id: "#1",
      title: "HVAC not working",
      status: "Done",
      priority: "High",
      workType: "Reactive",
      assignedTo: { name: "sumit sahani" },
      categories: "HVAC",
      asset: "HVAC",
      location: "General",
      createdBy: { name: "sumit sahani" },
      createdOn: "2025-09-29",
      updatedOn: "2025-09-29",
      dueDate: "—",
      recurrence: "—",
      attachedProcedure: "Procedure",
    },
    {
      id: "#4",
      title: "workorder 1",
      status: "In Progress",
      priority: "—",
      workType: "Reactive",
      assignedTo: { name: "sumit sahani" },
      categories: "—",
      asset: "—",
      location: "—",
      createdBy: { name: "sumit sahani" },
      createdOn: "2025-11-07",
      updatedOn: "2025-11-07",
      dueDate: "—",
      recurrence: "—",
      attachedProcedure: "maintainX",
    },
    {
      id: "#5",
      title: "swdefrg",
      status: "In Progress",
      priority: "—",
      workType: "Reactive",
      assignedTo: { name: "sumit sahani" },
      categories: "—",
      asset: "—",
      location: "—",
      createdBy: { name: "sumit sahani" },
      createdOn: "2025-11-07",
      updatedOn: "2025-11-07",
      dueDate: "—",
      recurrence: "—",
      attachedProcedure: "maintainOS",
    },
    {
      id: "#7",
      title: "work order 2",
      status: "In Progress",
      priority: "—",
      workType: "Reactive",
      assignedTo: { name: "sumit sahani" },
      categories: "—",
      asset: "—",
      location: "General",
      createdBy: { name: "sumit sahani" },
      createdOn: "2025-11-11",
      updatedOn: "2025-11-11",
      dueDate: "—",
      recurrence: "—",
      attachedProcedure: "Copy - Copy - maintainOS",
    },
  ];

  const [sortType, setSortType] = useState<string>("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleHeaderClick = (columnName: string) => {
    if (sortType === columnName) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortType(columnName);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortType !== column)
      return <ChevronsUpDown size={14} className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  return (
    <div className="flex-1 overflow-hidden p-4 flex flex-col">
      <Card className="overflow-hidden shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <div className="flex">
            {/* Fixed Title Column */}
            <div className="w-[260px] flex-shrink-0 border-r border-gray-200">
              <table className="w-full border-collapse text-sm table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm text-xs font-semibold text-gray-600 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left border">
                      <button
                        onClick={() => handleHeaderClick("Title")}
                        className="flex items-center gap-1 text-gray-600"
                      >
                        Title 
                         <SortIcon column="Title" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo, idx) => (
                    <tr
                      key={wo.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      }`}
                      style={{ height: "52px" }}
                    >
                      <td className="px-4 h-[52px] font-medium text-gray-800 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-blue-50 text-blue-500">
                              <ClipboardList size={18} />
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[160px]">
                            {wo.title}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scrollable Data Columns */}
            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
              <table className="min-w-full border-collapse text-sm table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm border text-xs font-semibold text-gray-600 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Work Type</th>
                    <th className="px-4 py-3 text-left">Assigned To</th>
                    <th className="px-4 py-3 text-left">Categories</th>
                    <th className="px-4 py-3 text-left">Asset</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Created By</th>
                    <th className="px-4 py-3 text-left">Created On</th>
                    <th className="px-4 py-3 text-left">Updated On</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Recurrence</th>
                    <th className="px-4 py-3 text-left">Attached Procedure</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo, idx) => (
                    <tr
                      key={wo.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                      }`}
                      style={{ height: "52px" }}
                    >
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.id}
                      </td>
                      <td className="px-4 h-[52px] align-middle">
                        <Badge
                          variant={
                            wo.status === "Done" ? "outline" : "secondary"
                          }
                        >
                          {wo.status}
                        </Badge>
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.priority}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.workType}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.assignedTo?.name || "—"}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.categories}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.asset}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.location}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.createdBy?.name || "—"}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {formatTableDate(wo.createdOn)}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {formatTableDate(wo.updatedOn)}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {formatTableDate(wo.dueDate)}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.recurrence}
                      </td>
                      <td className="px-4 h-[52px] text-gray-600 align-middle whitespace-nowrap">
                        {wo.attachedProcedure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
