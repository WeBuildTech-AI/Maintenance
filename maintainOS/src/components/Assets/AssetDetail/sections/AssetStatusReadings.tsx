// import { Calendar, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
// import {
//   CartesianGrid,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
// import { Button } from "../../../ui/button";
// import { Card } from "../../../ui/card";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../../../store";
// import { formatFriendlyDate } from "../../../utils/Date";
// import { useState } from "react";

// export function AssetStatusReadings({ asset }: { asset: any }) {
//   const user = useSelector((state: RootState) => state.auth.user);

//   const [isOpen, setIsOpen] = useState(false);
//   // State to store the currently selected status
//   const [selectedStatus, setSelectedStatus] = useState("Online");
//   const statuses = [
//     { name: "Online", color: "bg-green-500", count: 12 },
//     { name: "Offline", color: "bg-red-500", count: 3 },
//     { name: "Do No track", color: "bg-yellow-500", count: 8 },
//   ];

//   // Function to find the color class for the selected status
//   // const getStatusColor = (asset.status) => {
//   //   const status = ass.find((s) => s.name === statusName);
//   //   return status ? status.color : "bg-gray-400"; // Default color
//   // };

//   // Function to handle changing the status
//   // const handleStatusChange = (statusName) => {
//   //   setSelectedStatus(statusName);
//   //   setIsOpen(false); // Close the dropdown after selecting an item
//   // };

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-medium">Status</h2>
//         <Button
//           variant="ghost"
//           className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto"
//         >
//           See More
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//       </div>

//       <div className="space-y-4">
//         {/* Status dropdown (visual only to preserve design) */}
//         <div className="relative w-48">
//           {/* Main Button */}
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
//           >
//             <div className="flex items-center gap-3">
//               <div
//               // className={`w-2 h-2 ${getStatusColor(
//               //   selectedStatus
//               // )} rounded-full`}
//               ></div>
//               <span className="text-gray-700 font-medium">
//                 {selectedStatus}
//               </span>
//             </div>
//             {isOpen ? (
//               <ChevronUp className="w-5 h-5 text-blue-500" />
//             ) : (
//               <ChevronDown className="w-5 h-5 text-blue-500" />
//             )}
//           </button>

//           {/* Dropdown Menu */}
//           {isOpen && (
//             <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//               {statuses.map((status, index) => (
//                 <button
//                   key={status.name}
//                   onClick={() => handleStatusChange(status.name)}
//                   className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
//                     index !== statuses.length - 1
//                       ? "border-b border-gray-100"
//                       : ""
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`w-2 h-2 ${status.color} rounded-full`}
//                     ></div>
//                     <span className="text-gray-700">{status.name}</span>
//                   </div>
//                   {status.count && (
//                     <span className="text-gray-400 text-sm">
//                       {status.count}
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         <p className="text-sm text-muted-foreground">
//           Last updated: <span className="font-medium">MaintainOS</span>,{" "}
//           {formatFriendlyDate(asset?.updatedAt)}
//         </p>

//         {/* Meter reading card */}
//         {/* <Card className="p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <span className="font-medium">Electrical</span>
//               <span className="text-muted-foreground">50 Feet</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-2">
//                 <Avatar className="w-7 h-7">
//                   <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face" />
//                   <AvatarFallback>
//                     {renderInitials(user?.fullName)}
//                   </AvatarFallback>
//                 </Avatar>
//                 <span className="text-sm text-muted-foreground">
//                   {user?.fullName}, on {formatFriendlyDate(asset.createdAt)}
//                 </span>
//               </div>
//               <ChevronRight className="h-4 w-4 text-muted-foreground" />
//             </div>
//           </div>
//         </Card> */}
//       </div>

//       {/* Work order history chart (exact same config) */}
//       {/* <div className="border-t border-border pt-8">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="font-medium">Work Order History</h3>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-muted-foreground">
//               Aug 1 - Sep 19
//             </span>
//             <div className="flex items-center gap-2">
//               <div className="h-8 w-8 p-0 grid place-items-center cursor-default">
//                 <div className="h-4 w-4 text-muted-foreground" />
//               </div>
//               <div className="h-8 w-8 p-0 grid place-items-center cursor-default">
//                 <div className="h-4 w-4 text-muted-foreground" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="h-64 mb-6">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart
//               data={[
//                 { date: "29/07/2025", value: 0 },
//                 { date: "04/08/2025", value: 0 },
//                 { date: "11/08/2025", value: 0 },
//                 { date: "18/08/2025", value: 0 },
//                 { date: "25/08/2025", value: 0 },
//                 { date: "01/09/2025", value: 0 },
//                 { date: "08/09/2025", value: 0 },
//                 { date: "15/09/2025", value: 3 },
//               ]}
//               margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis
//                 dataKey="date"
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fontSize: 12, fill: "#666" }}
//                 angle={-45}
//                 textAnchor="end"
//                 height={60}
//               />
//               <YAxis
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fontSize: 12, fill: "#666" }}
//                 domain={[0, 10]}
//                 ticks={[0, 2, 4, 6, 8, 10]}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "white",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   fontSize: "12px",
//                 }}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="oklch(.646 .222 41.116)"
//                 strokeWidth={2}
//                 dot={{ fill: "oklch(.646 .222 41.116)", strokeWidth: 2, r: 4 }}
//                 activeDot={{ r: 6, fill: "oklch(.646 .222 41.116)" }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="flex justify-center mt-8">
//           <Button
//             variant="outline"
//             className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 rounded-full px-6"
//           >
//             <Calendar className="h-4 w-4" />
//             Use in New Work Order
//           </Button>
//         </div>
//       </div> */}
//     </div>
//   );
// }

import { ChevronDown, ChevronRight, ChevronUp, Plus, X } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";
import { formatFriendlyDate } from "../../../utils/Date";
import { useState, useEffect } from "react";
import { Button } from "../../../ui/button";

// --- Main Component ---
export function AssetStatusReadings({ asset }: { asset: any }) {
  const user = useSelector((state: RootState) => state.auth.user);

  // --- State Management ---
  const [assetStatus, setAssetStatus] = useState(asset?.status || "Online");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For the simple dropdown
  const [isModalOpen, setIsModalOpen] = useState(false); // For the detailed modal

  // Temporarily holds the status selected from the dropdown before opening the modal
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);

  useEffect(() => {
    setAssetStatus(asset?.status || "Online");
  }, [asset]);

  const statuses = [
    { name: "Online", color: "bg-green-500" },
    { name: "Offline", color: "bg-red-500" },
    { name: "Do Not Track", color: "bg-gray-500" },
  ];

  const getStatusColor = (statusName: string) => {
    const status = statuses.find((s) => s.name === statusName);
    return status ? status.color : "bg-gray-400";
  };

  // 1. This function is triggered when you select a status from the SIMPLE dropdown.
  const handleStatusSelection = (newStatus: string) => {
    setIsDropdownOpen(false); // Close the dropdown first
    // Only open the modal if a NEW status is selected
    if (newStatus !== assetStatus) {
      setStatusToUpdate(newStatus); // Set the new status
      setIsModalOpen(true); // THEN open the modal
    }
  };

  // 2. This function is called when the MODAL submits its data.
  const handleModalSubmit = (formData: {
    status: string;
    downtimeType?: string;
    offlineSince?: string;
  }) => {
    setAssetStatus(formData.status);
    setIsModalOpen(false); // Close the modal

    // TODO: Place your API call here using the complete formData
    console.log("Submitting to API:", formData);
  };

  return (
    <div>
      {/* --- Render the Modal --- */}
      {isModalOpen && statusToUpdate && (
        <UpdateAssetStatusModal
          initialStatus={statusToUpdate}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* --- Main Component JSX --- */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Status</h2>
        <Button
          variant="ghost"
          className="gap-1 cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto"
        >
          See More
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Status display button - now opens the simple dropdown */}
        <div className="relative w-48">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggles the dropdown
            className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 ${getStatusColor(
                  assetStatus
                )} rounded-full`}
              ></div>
              <span className="text-gray-700 font-medium">{assetStatus}</span>
            </div>
            {isDropdownOpen ? (
              <ChevronUp className="w-5 h-5 text-blue-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-500" />
            )}
          </button>

          {/* --- The Simple Dropdown Menu --- */}
          {isDropdownOpen && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {statuses.map((status) => (
                <button
                  key={status.name}
                  onClick={() => handleStatusSelection(status.name)}
                  className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 ${status.color} rounded-full`}></div>
                  <span className="text-gray-700">{status.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Last updated: <span className="font-medium">MaintainOS</span>,{" "}
          {formatFriendlyDate(asset?.updatedAt)}
        </p>
      </div>
    </div>
  );
}

// --- Modal Component ---
export function UpdateAssetStatusModal({
  initialStatus,
  onClose,
  onSubmit,
}: {
  initialStatus: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [downtimeType, setDowntimeType] = useState("");
  const [offlineSince, setOfflineSince] = useState("Now");
  const [notes, setNotes] = useState("");
  const [isNotesVisible, setIsNotesVisible] = useState(false);

  const [statusDropdown, setStatusDropdown] = useState(false);
  const [downtimeDropdown, setDowntimeDropdown] = useState(false);
  const [offlineSinceDropdown, setOfflineSinceDropdown] = useState(false);

  const statuses = [
    { name: "Online", color: "bg-green-500" },
    { name: "Offline", color: "bg-red-500" },
    { name: "Do Not Track", color: "bg-gray-500" },
  ];

  const downtimeTypes = [
    "Planned Mark Status at a plan if it's due to expected maintaince  inspections etc  ",
    "Unplanned Unplanned status update can be related to unexpected breakdowns etc ",
  ];

  const offlineSinceOptions = [
    "Now",
    "1 hour ago",
    "2 hours ago",
    "1 day ago",
    "Custom date",
  ];

  const isFormValid = selectedStatus === "Offline" ? !!downtimeType : true;

  const handleConfirm = () => {
    if (!isFormValid) return;
    onSubmit({
      status: selectedStatus,
      downtimeType: selectedStatus === "Offline" ? downtimeType : undefined,
      offlineSince: selectedStatus === "Offline" ? offlineSince : undefined,
      notes: notes || undefined,
    });
  };

  // --- Helper UI Components ---

  const NotesSection = () => (
    <div>
      {!isNotesVisible ? (
        <button
          onClick={() => setIsNotesVisible(true)}
          className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Add notes
        </button>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant details..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      )}
    </div>
  );

  const OfflineSinceDropdown = () => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Offline Since
      </label>
      <div className="relative">
        <button
          onClick={() => setOfflineSinceDropdown(!offlineSinceDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <span>{offlineSince}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              offlineSinceDropdown ? "rotate-180" : ""
            }`}
          />
        </button>
        {offlineSinceDropdown && (
          <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10">
            {offlineSinceOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setOfflineSince(opt);
                  setOfflineSinceDropdown(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- Main UI ---

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      {/* Modal container */}
      <div className="bg-white rounded-lg shadow-lg w-130 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Asset Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Status <span className="text-gray-500">(required)</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border-2 border-blue-500 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 ${
                      statuses.find((s) => s.name === selectedStatus)?.color
                    } rounded-full`}
                  ></div>
                  <span>{selectedStatus}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-blue-500 transition-transform ${
                    statusDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <NotesSection />

          {/* Conditional Fields */}
          {selectedStatus === "Offline" ? (
            <>
              {/* Downtime Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Downtime Type <span className="text-red-500">(required)</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setDowntimeDropdown(!downtimeDropdown)}
                    className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>{downtimeType || "Select downtime type"}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        downtimeDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {downtimeDropdown && (
                    <div className="absolute w-full bg-white cursor-pointer border border-gray-200 rounded-md shadow-lg mt-1 z-50">
                      {downtimeTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setDowntimeType(type);
                            setDowntimeDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Offline Since */}
              <OfflineSinceDropdown />
            </>
          ) : (
            <OfflineSinceDropdown />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between cursor-pointer px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="px-6 py-2 rounded-md bg-orange-600 font-medium text-white"
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
