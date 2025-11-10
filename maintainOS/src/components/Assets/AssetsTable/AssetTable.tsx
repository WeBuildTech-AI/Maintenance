// import { Card, CardContent } from "../../ui/card";
// import { Avatar, AvatarFallback } from "../../ui/avatar";

// export function AssetTable({
//   assets,
//   selectedAsset,
// }: {
//   assets: any[];
//   selectedAsset: any;
// }) {
//   const renderInitials = (text: string) =>
//     text
//       .split(" ")
//       .map((p) => p[0])
//       .slice(0, 2)
//       .join("")
//       .toUpperCase();

//   return (
//     <div className="flex-1 overflow-auto p-2">
//       <Card className="overflow-hidden shadow-sm">
//         <CardContent className="p-0">
//           <table className="w-full table-fixed text-sm">
//             <thead className="bg-muted/60 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
//               <tr>
//                 <th className="w-[20%] px-4 py-3 text-left">Name</th>
//                 <th className="w-[12%] px-4 py-3 text-left">ID</th>
//                 <th className="w-[16%] px-4 py-3 text-left">Status</th>
//                 <th className="w-[14%] px-4 py-3 text-left">Location</th>
//                 <th className="w-[12%] px-4 py-3 text-left">Criticality</th>
//                 <th className="w-[12%] px-4 py-3 text-left">Manufacturer</th>
//                 <th className="w-[12%] px-4 py-3 text-left">Type</th>
//                 <th className="w-[12%] px-4 py-3 text-left">QrCode</th>
//                 <th className="w-[12%] px-4 py-3 text-left">Meter</th>
//                 <th className="w-[12%] px-4 py-3 text-left">Part</th>
//                 <th className="w-[12%] px-4 py-3 text-left">Team</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assets.map((asset) => (
//                 <tr
//                   key={asset.id}
//                   className={`border-b border-border transition hover:bg-muted/40 ${
//                     asset.id === selectedAsset?.id ? "bg-primary/5" : ""
//                   }`}
//                 >
//                   {/* Name + Icon */}
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-3">
//                       <Avatar className="h-8 w-8">
//                         <AvatarFallback>
//                           {asset.icon || renderInitials(asset.name)}
//                         </AvatarFallback>
//                       </Avatar>
//                       {asset.name && (
//                         <span className="font-medium">{asset.name}</span>
//                       )}
//                     </div>
//                   </td>

//                   {/* ID */}
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {asset.id || "-"}
//                   </td>

//                   {/* Status */}
//                   <td className="px-4 py-3 capitalize text-muted-foreground">
//                     <span className="flex items-center gap-2">
//                       <span
//                         className={`h-1 w-2 rounded-full ${
//                           asset.status === "online"
//                             ? "bg-green-500"
//                             : asset.status === "offline"
//                             ? "bg-red-500"
//                             : asset.status === "doNotTrack"
//                             ? "bg-yellow-500"
//                             : "bg-gray-300"
//                         }`}
//                       ></span>
//                       {(asset.status && asset.status) ?? "—"}
//                     </span>
//                   </td>

//                   {/* Location */}
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {(asset.location && asset.location.name) || "-"}
//                   </td>

//                   {/* Criticality */}
//                   <td className="px-4 py-3 cursor-pointer capitalize text-muted-foreground">
//                     {asset.criticality || "-"}
//                   </td>

//                   {/* Manufacturer */}
//                   <td className="px-4 py-3 text-muted-foreground cursor-capitalize">
//                     {(asset.manufacturer && asset.manufacturer.name) || "-"}
//                   </td>

//                   {/* Asset Type */}
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {asset.assetTypes?.length > 0 ? (
//                       <>
//                         {asset.assetTypes[0]?.name}
//                         {asset.assetTypes.length > 1 && (
//                           <span className="text-gray-500 ml-1">
//                             +{asset.assetTypes.length - 1}
//                           </span>
//                         )}
//                       </>
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {(asset.qrCode && asset.qrCode.split("/").pop()) || "-"}
//                   </td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {asset.meters?.length > 0 ? (
//                       <>
//                         {asset.meters[0]?.name}
//                         {asset.meters.length > 1 && (
//                           <span className="text-gray-500 ml-1">
//                             +{asset.meters.length - 1}
//                           </span>
//                         )}
//                       </>
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {asset.parts?.length > 0 ? (
//                       <>
//                         {asset.parts[0]?.name}
//                         {asset.parts.length > 1 && (
//                           <span className="text-gray-500 ml-1">
//                             +{asset.parts.length - 1}
//                           </span>
//                         )}
//                       </>
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     {asset.teams?.length > 0 ? (
//                       <>
//                         {asset.teams[0]?.name}
//                         {asset.teams.length > 1 && (
//                           <span className="text-gray-500 ml-1">
//                             +{asset.teams.length - 1}
//                           </span>
//                         )}
//                       </>
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                 </tr>
//               ))}
//               {assets.length === 0 && (
//                 <tr>
//                   <td
//                     className="px-4 py-4 text-center text-muted-foreground"
//                     colSpan={7}
//                   >
//                     No assets found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";

export function AssetTable({
  assets,
  selectedAsset,
}: {
  assets: any[];
  selectedAsset: any;
}) {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const toggleSelection = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((assetId) => assetId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const allSelected =
      assets.length > 0 &&
      assets.every((asset) => selectedAssetIds.includes(asset.id));
    const someSelected =
      assets.some((asset) => selectedAssetIds.includes(asset.id)) &&
      !allSelected;
    headerCheckboxRef.current.indeterminate = someSelected;
  }, [assets, selectedAssetIds]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = assets.map((a) => a.id);
      setSelectedAssetIds(allIds);
    } else {
      setSelectedAssetIds([]);
    }
  };

  const isAllSelected =
    assets.length > 0 &&
    assets.every((asset) => selectedAssetIds.includes(asset.id));

  return (
    // Container ko horizontal scroll (overflow-auto) ki zaroorat hai
    <div className="flex-1 overflow-auto p-2">
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {/* table-fixed ki jagah min-w-full behtar rehta hai, 
              lekin aapke widths 100% se zyada hain, isliye ye chalega */}
          <table className="w-full table-fixed text-sm">
            <thead className="bg-muted/60 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                {/* --- UPDATED: Sticky Header Checkbox --- */}
                <th className="sticky left-0 z-10 bg-muted/60 w-12 px-4 py-3 text-left">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="cursor-pointer accent-orange-600"
                  />
                </th>
                
                {/* --- UPDATED: Sticky Header Name --- */}
                {/* left-12 (3rem) = pehle sticky column (w-12) ki width */}
                <th className="sticky left-12s z-10 bg-muted/60 w-[20%] px-4 py-3 text-left">
                  Name
                </th>
                
                <th className="w-[12%] px-4 py-3 text-left">ID</th>
                <th className="w-[16%] px-4 py-3 text-left">Status</th>
                <th className="w-[14%] px-4 py-3 text-left">Location</th>
                <th className="w-[12%] px-4 py-3 text-left">Criticality</th>
                <th className="w-[12%] px-4 py-3 text-left">Manufacturer</th>
                <th className="w-[12%] px-4 py-3 text-left">Type</th>
                <th className="w-[12%] px-4 py-3 text-left">QrCode</th>
                <th className="w-[12%] px-4 py-3 text-left">Meter</th>
                <th className="w-[12%] px-4 py-3 text-left">Part</th>
                <th className="w-[12%] px-4 py-3 text-left">Team</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  // --- UPDATED: Row styles ab 'td' par bhi duplicate honge ---
                  className={`border-b border-border transition hover:bg-muted/40 ${
                    asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                  }`}
                >
                  {/* --- UPDATED: Sticky Body Checkbox --- */}
                  {/* Background styles (bg-card, hover, selected) yahan repeat kiye gaye hain */}
                  <td
                    className={`sticky left-0 z-10 px-4 py-3 bg-card transition hover:bg-muted/40 ${
                      asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.includes(asset.id)}
                      onChange={() => toggleSelection(asset.id)}
                      className="cursor-pointer accent-orange-600"
                    />
                  </td>

                  {/* --- UPDATED: Sticky Body Name --- */}
                  {/* Background styles yahan bhi repeat kiye gaye hain */}
                  <td
                    className={`sticky left-12 z-10 px-4 py-3 bg-card transition hover:bg-muted/40 ${
                      asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {asset.icon || renderInitials(asset.name)}
                        </AvatarFallback>
                      </Avatar>
                      {asset.name && (
                        <span className="font-medium">{asset.name}</span>
                      )}
                    </div>
                  </td>

                  {/* Baaki non-sticky cells normal rahenge */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.id || "-"}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1 w-2 rounded-full ${
                          asset.status === "online"
                            ? "bg-green-500"
                            : asset.status === "offline"
                            ? "bg-red-500"
                            : asset.status === "doNotTrack"
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      ></span>
                      {(asset.status && asset.status) ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(asset.location && asset.location.name) || "-"}
                  </td>
                  <td className="px-4 py-3 cursor-pointer capitalize text-muted-foreground">
                    {asset.criticality || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground cursor-capitalize">
                    {(asset.manufacturer && asset.manufacturer.name) || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.assetTypes?.length > 0 ? (
                      <>
                        {asset.assetTypes[0]?.name}
                        {asset.assetTypes.length > 1 && (
                          <span className="text-gray-500 ml-1">
                            +{asset.assetTypes.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(asset.qrCode && asset.qrCode.split("/").pop()) || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.meters?.length > 0 ? (
                      <>
                        {asset.meters[0]?.name}
                        {asset.meters.length > 1 && (
                          <span className="text-gray-500 ml-1">
                            +{asset.meters.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.parts?.length > 0 ? (
                      <>
                        {asset.parts[0]?.name}
                        {asset.parts.length > 1 && (
                          <span className="text-gray-500 ml-1">
                            +{asset.parts.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.teams?.length > 0 ? (
                      <>
                        {asset.teams[0]?.name}
                        {asset.teams.length > 1 && (
                          <span className="text-gray-500 ml-1">
                            +{asset.teams.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-muted-foreground"
                    colSpan={12}
                  >
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}