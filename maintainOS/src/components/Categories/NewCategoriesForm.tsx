import React, { useState } from "react";
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
} from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";

// Type definition for an icon choice
interface IconChoice {
  name: string;
  icon: React.ReactNode;
  color: string;
}

// Helper component for rendering each selectable icon
const CategoryIconChoice: React.FC<{
  icon: React.ReactNode;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ icon, color, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${color} ${
      isSelected ? "ring-2 ring-offset-2 ring-blue-500" : "hover:opacity-80"
    }`}
  >
    {icon}
  </button>
);

export const NewCategoryForm: React.FC = ({ setNewFormCategories }) => {
  // State for the form fields
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);

  const categoryIconChoices: IconChoice[] = [
    {
      name: "TriangleAlert",
      icon: <TriangleAlert className="w-5 h-5 text-red-600" />,
      color: "bg-red-100",
    },
    {
      name: "Zap",
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      color: "bg-yellow-100",
    },
    {
      name: "ClipboardList",
      icon: <ClipboardList className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-100",
    },
    {
      name: "Cog",
      icon: <Cog className="w-5 h-5 text-pink-600" />,
      color: "bg-pink-100",
    },
    {
      name: "RefreshCw",
      icon: <RefreshCw className="w-5 h-5 text-green-600" />,
      color: "bg-green-100",
    },
    {
      name: "FileText",
      icon: <FileText className="w-5 h-5 text-orange-600" />,
      color: "bg-orange-100",
    },
    {
      name: "Snowflake",
      icon: <Snowflake className="w-5 h-5 text-sky-500" />,
      color: "bg-sky-100",
    },
    {
      name: "Shield",
      icon: <Shield className="w-5 h-5 text-teal-600" />,
      color: "bg-teal-100",
    },
    {
      name: "FileSignature",
      icon: <FileSignature className="w-5 h-5 text-rose-600" />,
      color: "bg-rose-100",
    },
  ];

  const isFormValid = categoryName.trim() !== "";

  return (
    <div className="bg-white p-4 h-full border max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-800 mb-6">New Category</h1>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Category Name Input */}
        <div>
          {/* <Input
            id="categoryName"
            type="text"
            placeholder="Enter Category Name (Required)"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border-0 border-b-2  focus:border-blue-500 rounded-none px-1 text-lg placeholder:text-gray-400"
          /> */}
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter Location Name"
            className="w-full px-0 py-2 p-3 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Icons Selector */}
        <div>
          <Label className="font-medium text-gray-700">Category Icons</Label>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {categoryIconChoices.map((choice) => (
              <CategoryIconChoice
                key={choice.name}
                icon={choice.icon}
                color={choice.color}
                isSelected={selectedIconName === choice.name}
                onClick={() => setSelectedIconName(choice.name)}
              />
            ))}
          </div>
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm mt-3"
          >
            Upload a custom icon
          </button>
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Footer with Info and Action Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Info className="w-4 h-4" />
            <span>
              Global Categories are published to all sub-organizations
            </span>
          </div>
          <div className="">
            <Button
              className="mr-2 bg-orange-600"
              type="submit"
              onClick={() => setNewFormCategories(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600"
              disabled={!isFormValid}
            >
              Create
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
