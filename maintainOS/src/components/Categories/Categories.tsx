import { useState } from "react";
import {
  ArrowLeft,
  TriangleAlert,
  Zap,
  ClipboardList,
  Cog,
  RefreshCw,
  FileText,
  Snowflake,
  Shield,
  FileSignature,
  MoreHorizontal,
  Edit,
} from "lucide-react";

import { Button } from "../ui/button";
import CategoriesHeader from "./CategoriesHeader";
import { NewCategoryForm } from "./NewCategoriesForm";
import { Link, NavLink } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
// import { Separator } from "../ui/separator";

// Helper component for individual sidebar items (now handles clicks)
const SidebarItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left p-3 gap-3 cursor-pointer transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "hover:bg-muted/50 text-foreground"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// All available icons, mapping their names to components and colors
const ALL_ICONS = {
  TriangleAlert: {
    icon: <TriangleAlert className="w-5 h-5 text-red-600" />,
    color: "bg-red-100",
  },
  Zap: {
    icon: <Zap className="w-5 h-5 text-yellow-600" />,
    color: "bg-yellow-100",
  },
  ClipboardList: {
    icon: <ClipboardList className="w-5 h-5 text-purple-600" />,
    color: "bg-purple-100",
  },
  Cog: {
    icon: <Cog className="w-5 h-5 text-pink-600" />,
    color: "bg-pink-100",
  },
  RefreshCw: {
    icon: <RefreshCw className="w-5 h-5 text-green-600" />,
    color: "bg-green-100",
  },
  FileText: {
    icon: <FileText className="w-5 h-5 text-orange-600" />,
    color: "bg-orange-100",
  },
  Snowflake: {
    icon: <Snowflake className="w-5 h-5 text-blue-500" />,
    color: "bg-blue-100",
  },
  Shield: {
    icon: <Shield className="w-5 h-5 text-teal-600" />,
    color: "bg-teal-100",
  },
  FileSignature: {
    icon: <FileSignature className="w-5 h-5 text-rose-600" />,
    color: "bg-rose-100",
  },
};

export function Categories() {
  const sidebarItems = [
    {
      name: "Damage",
      iconName: "TriangleAlert",
      description: "Category for reporting all types of asset damage.",
    },
    {
      name: "Electrical",
      iconName: "Zap",
      description:
        "For issues related to wiring, power outages, and electrical components.",
    },
    {
      name: "Inspection",
      iconName: "ClipboardList",
      description: "Routine and ad-hoc inspection tasks.",
    },
    {
      name: "Mechanical",
      iconName: "Cog",
      description: "Tasks related to motors, engines, and mechanical parts.",
    },
    {
      name: "Preventive",
      iconName: "RefreshCw",
      description: "Scheduled preventive maintenance activities.",
    },
    {
      name: "Project",
      iconName: "FileText",
      description: "Tasks related to specific, ongoing projects.",
    },
    {
      name: "Refrigeration",
      iconName: "Snowflake",
      description: "All tasks concerning cooling and refrigeration units.",
    },
    {
      name: "Safety",
      iconName: "Shield",
      description: "Safety checks, compliance, and incident reports.",
    },
  
  ];

  // Initialize with the first category in the list
  const [selectedCategory, setSelectedCategory] = useState(sidebarItems[0]);
  const [newFormCategories, setNewFormCategories] = useState(false);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex h-full flex-col">
      <CategoriesHeader setNewFormCategories={setNewFormCategories} />
      <div className="flex gap-4 flex-1 overflow-hidden mt-6 min-h-0">
        {/* Left Sidebar */}
        <aside className="w-96 border bg-white ml-2  flex flex-col gap-2 overflow-y-auto">
          <div className="flex-1 space-y-1 overflow-y-auto ">
            {sidebarItems.length > 0 ? (
              sidebarItems?.map((item) => (
                <SidebarItem
                  key={item.name}
                  label={item.name}
                  icon={ALL_ICONS[item.iconName].icon}
                  isActive={selectedCategory?.name === item.name}
                  onClick={() => {
                    handleSelectCategory(item);
                    setNewFormCategories(false);
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No Categories Found
                </p>
                <Button
                  // variant="link"
                  onClick={() => setNewFormCategories(true)}
                  className="text-primary p-0 bg-white cursor-pointer"
                >
                  Create the first asset
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {newFormCategories === true ? (
            <NewCategoryForm setNewFormCategories={setNewFormCategories} />
          ) : (
            <>
              {selectedCategory ? (
                <div className="max-w-3xl mr-2 border h-full p-4 mx-auto bg-white">
                  {/* Header */}
                  <div className="flex justify-between items-center  mb-3">
                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                      {selectedCategory?.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        title="Copy Link"
                        className="p-2 rounded-md text-orange-600 cursor-pointer"
                      >
                        <Link size={18} />
                      </button>
                      <button
                        title="Edit"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md cursor-pointer text-orange-600 hover:bg-orange-50 border border-orange-600"
                        // onClick={() => {
                        //   // ❌ REMOVED: setIsEdit(true) & setEditData(selectedLocation)
                        //   // ✅ Navigate to the new parameterized URL
                        //   navigate(
                        //     `/locations/${selectedLocation.id}/edit`
                        //   );
                        // }}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="mt-2">
                            <DropdownMenuItem
                            // onClick={() =>
                            //   handleDeleteLocation(selectedLocation?.id)
                            // }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Footer */}

                  {/* {selectedLocation.createdAt ===
                      selectedLocation.updatedAt ? (
                        <>
                          <div className="text-sm text-gray-500 mt-6">
                            Created By{" "}
                            <span className="font-medium text-gray-700 capitalize">
                              {user?.fullName}
                            </span>{" "}
                            on {formatDate(selectedLocation.createdAt)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-500 mt-6">
                            Created By{" "}
                            <span className="font-medium text-gray-700 capitalize">
                              {user?.fullName}
                            </span>{" "}
                            on {formatDate(selectedLocation.createdAt)}
                          </div>
                          <div className="text-sm text-gray-500 mt-6">
                            Updated By{" "}
                            <span className="font-medium text-gray-700 capitalize">
                              {user?.fullName}
                            </span>{" "}
                            on {formatDate(selectedLocation.updatedAt)}
                          </div>
                        </>
                      )} */}
                  {/* Action Button */}
                  <div className="mt-6 flex justify-center">
                    <NavLink to="/work-orders">
                      <button className="bg-white border hover-bg-orange-50 border-orange-600 text-orange-600 px-5 py-3 p-2 cursor-pointer rounded-full text-sm shadow-sm transition">
                        Use in New Work Order
                      </button>
                    </NavLink>
                  </div>
                </div>
              ) : (
                // Fallback message if no category is selected
                <div className="flex h-full items-center justify-center rounded-lg border bg-white">
                  <p className="text-gray-500">
                    Select a category to see its details
                  </p>
                </div>
              )}
            </>
          )}

          {}
        </main>
      </div>
    </div>
  );
}
