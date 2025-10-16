import { ChevronDown, Search } from "lucide-react";

export function AssetTypesDropdown() {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-base font-medium text-gray-900">Asset Types</h3>
      <div className="relative">
        <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
          <Search className="h-4 w-4 text-gray-400" />
          <span className="flex-1 text-gray-400">Start typing...</span>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// import { ChevronDown, Search, Trash2, X } from "lucide-react"; // 'X' आइकन इम्पोर्ट किया
// import { useState, useRef, useEffect } from "react";

// // एक आइटम का स्ट्रक्चर
// interface AssetTypeItem {
//   id: number | string;
//   name: string;
// }

// // कुछ शुरुआती डेटा
// const INITIAL_ASSETS: AssetTypeItem[] = [];

// export function AssetTypesDropdown() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [assetTypes, setAssetTypes] = useState<AssetTypeItem[]>(INITIAL_ASSETS);
//   const [selectedAssetType, setSelectedAssetType] =
//     useState<AssetTypeItem | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null); // इनपुट को फोकस करने के लिए

//   // ड्रॉपडाउन के बाहर क्लिक करने पर उसे बंद करना
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//         if (!selectedAssetType) setSearchTerm("");
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [selectedAssetType]);

//   const filteredAssets = searchTerm
//     ? assetTypes.filter((asset) =>
//         asset.name.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : assetTypes;

//   const canCreate =
//     searchTerm.length > 0 &&
//     !assetTypes.some(
//       (asset) => asset.name.toLowerCase() === searchTerm.trim().toLowerCase()
//     );

//   const handleCreate = () => {
//     const trimmedName = searchTerm.trim();
//     if (!trimmedName) return;
//     const newItem: AssetTypeItem = { id: Date.now(), name: trimmedName };
//     setAssetTypes((prev) => [...prev, newItem]);
//     setSelectedAssetType(newItem);
//     setSearchTerm(newItem.name);
//     setIsOpen(false);
//   };

//   const handleSelect = (asset: AssetTypeItem) => {
//     setSelectedAssetType(asset);
//     setSearchTerm(asset.name);
//     setIsOpen(false);
//   };

//   const handleDelete = (
//     idToDelete: number | string,
//     event: React.MouseEvent
//   ) => {
//     event.stopPropagation();
//     setAssetTypes((prev) => prev.filter((asset) => asset.id !== idToDelete));
//     if (selectedAssetType?.id === idToDelete) {
//       setSelectedAssetType(null);
//       setSearchTerm("");
//     }
//   };

//   // **नया: सर्च बॉक्स क्लियर करने का फंक्शन**
//   const handleClearSearch = (event: React.MouseEvent) => {
//     event.stopPropagation(); // div के onClick को चलने से रोकता है
//     setSearchTerm("");
//     setSelectedAssetType(null);
//     inputRef.current?.focus(); // क्लियर करने के बाद इनपुट पर फोकस करें
//   };

//   return (
//     <div className="relative mt-4 w-72" ref={dropdownRef}>
//       <h3 className="mb-2 text-base font-medium text-gray-900">Asset Types</h3>

//       <div
//         className="relative flex h-12 items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500"
//         // अब इनपुट पर क्लिक से ही ड्रॉपडाउन खुलेगा
//       >
//         <Search className="h-4 w-4 text-gray-400" />
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="Select or create..."
//           className="w-full flex-1 cursor-pointer bg-transparent text-gray-800 placeholder-gray-500 outline-none:focus"
//           value={searchTerm}
//           onClick={() => setIsOpen(true)}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setSelectedAssetType(null);
//             if (!isOpen) setIsOpen(true);
//           }}
//         />

//         {/* --- नया क्लियर (X) बटन --- */}
//         {searchTerm && (
//           <X
//             className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600"
//             onClick={handleClearSearch}
//           />
//         )}

//         <ChevronDown
//           className={`h-5 w-5 text-gray-400 transition-transform ${
//             isOpen ? "rotate-180" : ""
//           }`}
//           onClick={() => setIsOpen(!isOpen)}
//         />
//       </div>

//       {isOpen && (
//         <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
//           <ul className="max-h-60 overflow-y-auto">
//             {filteredAssets.length > 0
//               ? filteredAssets.map((asset) => (
//                   <li
//                     key={asset.id}
//                     className="flex cursor-pointer items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100"
//                     onClick={() => handleSelect(asset)}
//                   >
//                     <span>{asset.name}</span>
//                     <Trash2
//                       className="h-4 w-4 text-gray-400 hover:text-red-600"
//                       onClick={(e) => handleDelete(asset.id, e)}
//                     />
//                   </li>
//                 ))
//               : !canCreate && (
//                   <li className="px-4 py-2 text-gray-500">No results found</li>
//                 )}

//             {canCreate && (
//               <li
//                 className="cursor-pointer border-t bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100"
//                 onClick={handleCreate}
//               >
//                 + Create "<strong>{searchTerm.trim()}</strong>"
//               </li>
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
