// ./components/CustomDropdown.tsx

import React, { useState, useEffect, useRef } from "react";
import Loader from "../../Loader/Loader";
import { 
  Ruler,       // Distance
  Box,         // Volume
  Thermometer, // Temperature
  Gauge,       // Velocity, Acceleration, Electricity
  Hash,        // Other
  Tag          // Fallback
} from "lucide-react"; 

// ... (Interfaces same rahenge) ...
interface DropdownOption {
  id: string;
  name: string;
  category?: string;
}

interface CustomDropdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  onOpen: () => void;
  loading: boolean;
  placeholder: string;
  errorText?: string;
  measurementCategory?: string;
}

export function CustomDropdown({
  id,
  label,
  value,
  onChange,
  options,
  onOpen,
  loading,
  placeholder,
  errorText,
  measurementCategory,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMeasurement = label === "Measurement Unit (Required)";

  // ✅ Same Helper Function (No changes here)
  const getCategoryIcon = (categoryName: string) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes("distance") || cat.includes("length")) return <Ruler size={16} />;
    if (cat.includes("volume") || cat.includes("capacity")) return <Box size={16} />;
    if (cat.includes("temperature")) return <Thermometer size={16} />;
    if (cat.includes("velocity") || cat.includes("speed")) return <Gauge size={16} />;
    if (cat.includes("acceleration")) return <Gauge size={16} />;
    if (cat.includes("electricity") || cat.includes("current")) return <Gauge size={16} />;
    return <Tag size={16} />;
  };

  // ... (useEffect logics same rahenge) ...
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((o) => o.id === value);
      if (selectedOption) setInputValue(selectedOption.name);
      else if (options.length === 0) setInputValue("");
    } else {
      setInputValue("");
    }
  }, [value, options]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        const selectedOption = options.find((o) => o.id === value);
        setInputValue(selectedOption ? selectedOption.name : "");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, options]);

  // ... (Filtering logic same rahega) ...
  const normalFilteredOptions = !isMeasurement
    ? options.filter((o) => o.name.toLowerCase().includes(inputValue.toLowerCase()))
    : [];

  let categoryFilteredOptions = options;
  if (isMeasurement && measurementCategory) {
    categoryFilteredOptions = options.filter((o) => o.category === measurementCategory);
  }

  const groupedOptions = isMeasurement
    ? categoryFilteredOptions.reduce((acc, item) => {
        if (!acc[item.category || "OTHER"]) acc[item.category || "OTHER"] = [];
        acc[item.category || "OTHER"].push(item);
        return acc;
      }, {} as Record<string, DropdownOption[]>)
    : {};

  const filteredGroupedOptions: Record<string, DropdownOption[]> = {};
  if (isMeasurement) {
    Object.keys(groupedOptions).forEach((category) => {
      const match = groupedOptions[category].filter((o) =>
        o.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      if (match.length > 0) filteredGroupedOptions[category] = match;
    });
  }

  const exactMatch = isMeasurement && categoryFilteredOptions.some(
      (o) => o.name.toLowerCase() === inputValue.toLowerCase()
    );
  const showCreateOption = isMeasurement && inputValue.trim().length > 0 && !exactMatch && !loading;

  // Handlers
  const handleInputClick = () => { onOpen(); setIsOpen(true); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); onChange(""); setIsOpen(true);
  };
  const handleOptionClick = (item: DropdownOption) => {
    onChange(item.id); setInputValue(item.name); setIsOpen(false);
  };
  const handleCreateClick = () => {
    const newId = inputValue.toLowerCase().replace(/\s+/g, "-"); onChange(newId);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative mt-2" ref={dropdownRef}>
        <input
          id={id}
          type="text"
          value={inputValue}
          onClick={handleInputClick}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="block w-full pl-2 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-sm text-gray-700 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          autoComplete="off"
        />

        {isOpen && (
          <div className="absolute z-50 w-full border mt-1 max-h-64 overflow-auto bg-white shadow-lg ring-1 ring-black ring-opacity-5 rounded-md p-2">
            {loading && (
              <div className="px-4 py-2 text-gray-500">
                <Loader />
              </div>
            )}

            {!loading && !isMeasurement && normalFilteredOptions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOptionClick(item)}
                className="cursor-pointer px-3 py-2 hover:bg-indigo-600 hover:text-white rounded-md"
              >
                {item.name}
              </div>
            ))}

            {!loading && showCreateOption && (
              <div
                onClick={handleCreateClick}
                className="cursor-pointer px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-md"
              >
                + Create “{inputValue}”
              </div>
            )}

            {/* ✅ UPDATED RENDER LOGIC */}
            {!loading &&
              isMeasurement &&
              Object.keys(filteredGroupedOptions).map((category, index) => (
                <div key={category}>
                  {/* Category Header (Icon Removed from here) */}
                  <div
                    className={`p-1 text-sm font-semibold text-orange-600 bg-orange-50 
                    ${index !== 0 ? "border-t mt-1" : ""} 
                    rounded-sm`}
                  >
                    {category}
                  </div>

                  {/* Items List (Icon Added here) */}
                  {filteredGroupedOptions[category].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOptionClick(item)}
                      // Added 'group', 'flex', 'items-center', 'gap-2'
                      className="group cursor-pointer py-2 px-3 capitalize flex items-center gap-2 hover:bg-indigo-600 hover:text-white rounded-md"
                    >
                      {/* Icon show karega (Category based) */}
                      {/* 'group-hover:text-white' ensure karega ki hover hone par icon bhi white ho jaye */}
                      <span className="text-gray-400 group-hover:text-white">
                        {getCategoryIcon(category)}
                      </span>

                      {item.name}
                    </div>
                  ))}
                </div>
              ))}

            {!loading && isMeasurement && !Object.keys(filteredGroupedOptions).length && !showCreateOption && (
              <div className="px-4 py-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
      {errorText && <p className="mt-2 text-sm text-red-600">{errorText}</p>}
    </div>
  );
}