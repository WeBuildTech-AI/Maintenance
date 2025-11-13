import React, { useEffect, useState } from "react";
import {
  TriangleAlert,
  Zap,
  ClipboardList,
  Cog,
  RefreshCw,
  FileText,
  Snowflake,
  Shield,
  MoreHorizontal,
  Edit,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

import { Button } from "../ui/button"; 
import CategoriesHeader from "./CategoriesHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Link, NavLink } from "react-router-dom";
import { categoryService } from "../../store/categories";

// Import the updated form component
import { NewCategoryForm } from "./NewCategoriesForm"; 

// --- Types ---
interface Category {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  iconName?: string;
  createdAt?: string;
  code?: string;
}

// --- Icon Map ---
const ALL_ICONS: { [key: string]: React.ReactNode } = {
  Damage: <TriangleAlert className="w-5 h-5 text-red-600" />,
  Electrical: <Zap className="w-5 h-5 text-yellow-600" />,
  Inspection: <ClipboardList className="w-5 h-5 text-purple-600" />,
  Mechanical: <Cog className="w-5 h-5 text-pink-600" />,
  Preventive: <RefreshCw className="w-5 h-5 text-green-600" />,
  Project: <FileText className="w-5 h-5 text-orange-600" />,
  Refrigeration: <Snowflake className="w-5 h-5 text-blue-500" />,
  Safety: <Shield className="w-5 h-5 text-teal-600" />,
  Default: <FileText className="w-5 h-5 text-gray-600" />,
};

const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return ALL_ICONS.Default;
  const iconKey = Object.keys(ALL_ICONS).find((k) =>
    categoryName.toLowerCase().includes(k.toLowerCase())
  );
  return iconKey ? ALL_ICONS[iconKey] : ALL_ICONS.Default;
};

// --- Sidebar Item ---
const SidebarItem = ({
  item,
  isActive,
  onClick,
}: {
  item: Category;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left p-3 gap-3 cursor-pointer transition-colors rounded-md ${
      isActive
        ? "bg-primary/10 text-primary font-semibold border-r-4 border-primary"
        : "hover:bg-muted/50 text-foreground"
    }`}
  >
    {getCategoryIcon(item.iconName || item.name)}
    <span className="capitalize">{item.name}</span>
  </button>
);

// --- Main Component ---
export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state to handle Create vs Edit
  const [formState, setFormState] = useState<{
    mode: "closed" | "create" | "edit";
    data: Category | null;
  }>({ mode: "closed", data: null });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await (categoryService as any).fetchAllCategories();
      const data = Array.isArray(res) ? res : (res as any).data || [];

      // Sort: Newest First
      const sortedData = data.sort((a: Category, b: Category) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; 
      });

      setCategories(sortedData);

      // Maintain selection or select first
      if (selectedCategory) {
        const updatedSelected = sortedData.find((c: Category) => c.id === selectedCategory.id);
        setSelectedCategory(updatedSelected || sortedData[0] || null);
      } else if (sortedData.length > 0) {
        setSelectedCategory(sortedData[0]);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handlers
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormState({ mode: "closed", data: null });
  };

  const handleAddNew = () => {
    setFormState({ mode: "create", data: null });
    setSelectedCategory(null); // Deselect to show form
  };

  const handleEdit = () => {
    if (selectedCategory) {
      setFormState({ mode: "edit", data: selectedCategory });
    }
  };

  const handleCloseForm = () => {
    setFormState({ mode: "closed", data: null });
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <CategoriesHeader setNewFormCategories={handleAddNew} />

      <div className="flex gap-4 flex-1 overflow-hidden mt-6 min-h-0">
        {/* Sidebar */}
        <aside className="w-96 border bg-white ml-2 flex flex-col gap-2 overflow-y-auto rounded-lg shadow-sm">
          <div className="flex-1 space-y-1 p-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : categories.length > 0 ? (
              categories.map((item) => (
                <SidebarItem
                  key={item.id || item._id}
                  item={item}
                  isActive={selectedCategory?.id === item.id}
                  onClick={() => handleSelectCategory(item)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No Categories Found</p>
                <Button onClick={handleAddNew} variant="link" className="text-primary">
                  Create the first asset
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pr-2">
          {formState.mode === "create" || formState.mode === "edit" ? (
            <NewCategoryForm
              initialData={formState.data}
              onClose={handleCloseForm}
              refreshCategories={fetchCategories}
            />
          ) : selectedCategory ? (
            <div className="max-w-3xl w-full border h-full p-6 mx-auto bg-white rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-full">
                    {getCategoryIcon(selectedCategory.iconName || selectedCategory.name)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 capitalize">
                    {selectedCategory.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition">
                    <LinkIcon size={18} />
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md cursor-pointer text-orange-600 hover:bg-orange-50 border border-orange-600 transition"
                    onClick={handleEdit}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600 cursor-pointer">
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <hr className="border-gray-100 my-6" />
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">
                    {selectedCategory.description || "No description provided."}
                  </p>
                </div>
                {selectedCategory.code && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category Code</h3>
                    <p className="mt-1 text-gray-900">{selectedCategory.code}</p>
                  </div>
                )}
              </div>
              <div className="mt-10 flex justify-end">
                <NavLink to="/work-orders">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow-sm transition">
                    Use in New Work Order
                  </button>
                </NavLink>
              </div>
            </div>
          ) : (
            !isLoading && (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-white border-dashed p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Category Selected</h3>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}