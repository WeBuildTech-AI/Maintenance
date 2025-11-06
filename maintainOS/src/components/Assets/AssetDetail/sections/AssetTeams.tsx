import { MapPin } from "lucide-react";


export function AssetTeams({ asset }: { asset: any }) {
  return (
    <div>
      {asset?.teams && asset.teams.length > 0 && (
        <div className="border-t mt-4">
          <h3 className="font-medium mb-3 mt-4">Teams</h3>
          <div className="space-y-2">
            {asset.teams.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
