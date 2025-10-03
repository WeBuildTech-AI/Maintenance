import { Edit, Link, MoreHorizontal } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { deleteAsset } from "../../../store/assets";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import toast from "react-hot-toast";

export function AssetDetailHeader({ asset }: { asset: any }) {
  const dispatch = useDispatch<AppDispatch>();

  const handleDeleteAsset = (id: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      dispatch(deleteAsset(id))
        .unwrap()
        .then(() => {
          toast.success("Location deleted successfully!");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          alert("Failed to delete the location.");
        });
    }
  };

  return (
    <div className="p-6 border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium capitalize">{asset.name}</h1>
          <Link className="h-4 w-4 text-orange-600" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
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
              <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
