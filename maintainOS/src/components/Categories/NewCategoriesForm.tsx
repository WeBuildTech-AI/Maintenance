import React, { useState, useEffect, FormEvent } from "react";
import {
  TriangleAlert,
  Zap,
  ClipboardList,
  Cog,
  RefreshCw,
  FileText,
  Snowflake,
  Shield,
  FileSignature,
  Info,
  Loader2,
} from "lucide-react";

// UI Imports (Check your paths)
import { Button } from "../ui/button";
import { Label } from "../ui/label";

// Service import
import { categoryService } from "../../store/categories"; 

// --- Types ---
interface CreateCategoryData {
  name: string;
  description?: string;
  iconName?: string;
}

interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Icon Selection Helper Component ---
interface IconChoice {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const CategoryIconChoice: React.FC<{
  icon: React.ReactNode;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ icon, color, isSelected, onClick }) => (
  <button
    type="button" // IMPORTANT: Yeh 'submit' hone se rokta hai
    onClick={onClick}
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${color} ${
      isSelected 
        ? "ring-2 ring-offset-2 ring-blue-500 scale-110" 
        : "hover:opacity-80"
    }`}
  >
    {icon}
  </button>
);

interface NewCategoryFormProps {
  initialData?: CategoryResponse | null;
  onClose: () => void;
  refreshCategories: () => void;
}

// --- Main Form ---
export const NewCategoryForm: React.FC<NewCategoryFormProps> = ({
  initialData,
  onClose,
  refreshCategories,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  
  // STATE: Selected Icon Name
  const [selectedIconName, setSelectedIconName] = useState<string>("FileText"); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  // --- Populate Form for Edit ---
  useEffect(() => {
    if (isEditMode && initialData) {
      setCategoryName(initialData.name || "");
      setDescription(initialData.description || "");
      // Edit mode: API se aaye hue icon name ko set karein
      setSelectedIconName(initialData.iconName || "FileText"); 
    } else {
      // Create mode: Reset
      setCategoryName("");
      setDescription("");
      setSelectedIconName("FileText");
    }
  }, [initialData, isEditMode]);

  // --- Icons Config ---
  const categoryIconChoices: IconChoice[] = [
    { name: "TriangleAlert", icon: <TriangleAlert className="w-5 h-5 text-red-600" />, color: "bg-red-100" },
    { name: "Zap", icon: <Zap className="w-5 h-5 text-yellow-600" />, color: "bg-yellow-100" },
    { name: "ClipboardList", icon: <ClipboardList className="w-5 h-5 text-purple-600" />, color: "bg-purple-100" },
    { name: "gear", icon: <Cog className="w-5 h-5 text-pink-600" />, color: "bg-pink-100" },
    { name: "RefreshCw", icon: <RefreshCw className="w-5 h-5 text-green-600" />, color: "bg-green-100" },
    { name: "FileText", icon: <FileText className="w-5 h-5 text-orange-600" />, color: "bg-orange-100" },
    { name: "Snowflake", icon: <Snowflake className="w-5 h-5 text-sky-500" />, color: "bg-sky-100" },
    { name: "Shield", icon: <Shield className="w-5 h-5 text-teal-600" />, color: "bg-teal-100" },
    { name: "FileSignature", icon: <FileSignature className="w-5 h-5 text-rose-600" />, color: "bg-rose-100" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // Payload prepare karein
    const data: CreateCategoryData = {
      name: categoryName,
      description: description,
      categoryIcon: selectedIconName, // Selected icon ka naam bhejein
    };

    try {
      if (isEditMode && initialData) {
        await categoryService.updateCategory(initialData.id , data);
      } else {
        await (categoryService as any).createCategory(data);
      }
      refreshCategories();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 h-full border max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-800 mb-6">
        {isEditMode ? "Edit Category" : "New Category"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Input */}
        <div>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter Category Name (Required)"
            className="w-full px-0 py-2 p-3 text-gray-700 placeholder-gray-400 bg-transparent border-0 border-b-2 border-blue-500 focus:outline-none"
          />
        </div>
        
        {/* Icon Selector */}
        <div>
          <Label className="font-medium text-gray-700">Category Icons</Label>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {categoryIconChoices.map((choice) => (
              <CategoryIconChoice
                key={choice.name}
                icon={choice.icon}
                color={choice.color}
                // Match selected state
                isSelected={selectedIconName === choice.name} 
                // Update state on click
                onClick={() => setSelectedIconName(choice.name)} 
              />
            ))}
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-900">Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none"
          />
        </div>

        {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Info className="w-4 h-4" />
            <span>Global Categories are published to all sub-organizations</span>
          </div>
          <div className="">
            <Button className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={!categoryName.trim() || isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : isEditMode ? "Save Changes" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};