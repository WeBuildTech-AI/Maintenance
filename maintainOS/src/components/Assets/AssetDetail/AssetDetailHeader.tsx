// import { Edit, Link, MoreHorizontal } from "lucide-react";
// import { Button } from "../../ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../../ui/dropdown-menu";
// import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
// import { deleteAsset } from "../../../store/assets";
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../../../store";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import React, { useState } from "react";
// import DeleteAssetModal from "./DeleteAssetModal";

// // Define a type for the asset object for type safety
// interface Asset {
//   id: string;
//   name: string;
//   // You can add other properties of your asset here
// }

// // Define the props type for the component
// interface AssetDetailHeaderProps {
//   asset: Asset;
//   setShowHistory: (show: boolean) => void;
//   onEdit: (asset: Asset) => void;
//   onDelete: (asset: Asset) => void;
// }

// export function AssetDetailHeader({
//   asset,
//   setShowHistory,
//   onEdit,
//   onDelete,
// }: AssetDetailHeaderProps) {
//   const navigate = useNavigate();
//   const [openAssetDeleteModal, setOpenAssetDeleteModal] = useState(false);
//   const modalRef = React.useRef<HTMLDivElement>(null);
//   return (
//     <div className="p-6 border-b border-border flex-shrink-0">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-2">
//           <h1 className="text-xl font-medium capitalize">{asset.name}</h1>
//           <Link
//             onClick={() => {
//               const url = `${window.location.origin}/assets/${asset?.id}`;
//               navigator.clipboard.writeText(url);
//               toast.success("Asset link copied!");
//             }}
//             className="h-4 w-4 text-orange-600"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             onClick={() => onEdit(asset)}
//             className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
//           >
//             <Edit className="h-4 w-4" />
//             Edit
//           </Button>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm">
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => setOpenAssetDeleteModal(true)}>
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Correctly handle tab changes */}
//       <Tabs
//         defaultValue="details"
//         className="w-full"
//         onValueChange={(value) => setShowHistory(value === "history")}
//       >
//         <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
//           <TabsTrigger value="details">Details</TabsTrigger>
//           <TabsTrigger value="history">History</TabsTrigger>
//         </TabsList>
//       </Tabs>
//       {openAssetDeleteModal && (
//         <DeleteAssetModal
//           modalRef={modalRef}
//           onClose={() => setOpenAssetDeleteModal(false)}
//           onConfirm={() => onDelete(asset.id)}
//         />
//       )}
//     </div>
//   );
// }


import { Edit, Link, MoreHorizontal } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Tooltip } from "../../ui/Tooltip"; // Import the simple tooltip
import { deleteAsset } from "../../../store/assets";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import DeleteAssetModal from "./DeleteAssetModal";

// Define a type for the asset object for type safety
interface Asset {
  id: string;
  name: string;
  // You can add other properties of your asset here
}

// Define the props type for the component
interface AssetDetailHeaderProps {
  asset: Asset;
  setShowHistory: (show: boolean) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetDetailHeader({
  asset,
  setShowHistory,
  onEdit,
  onDelete,
}: AssetDetailHeaderProps) {
  const navigate = useNavigate();
  const [openAssetDeleteModal, setOpenAssetDeleteModal] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  return (
    <div className="p-6 border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium capitalize">{asset.name}</h1>
          <Tooltip text="Copy link">
            <Link
              onClick={() => {
                const url = `${window.location.origin}/assets/${asset?.id}`;
                navigator.clipboard.writeText(url);
                toast.success("Asset link copied!");
              }}
              className="h-4 w-4 text-orange-600 cursor-pointer"
            />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(asset)}
            className="gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenAssetDeleteModal(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Correctly handle tab changes */}
      <Tabs
        defaultValue="details"
        className="w-full"
        onValueChange={(value) => setShowHistory(value === "history")}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>
      {openAssetDeleteModal && (
        <DeleteAssetModal
          modalRef={modalRef}
          onClose={() => setOpenAssetDeleteModal(false)}
          onConfirm={() => onDelete(asset.id)}
        />
      )}
    </div>
  );
}