// ./components/CustomDropdown.tsx

import React, { useState, useEffect, useRef } from "react";
import Loader from "../../Loader/Loader";
import { useNavigate } from "react-router-dom";

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

  // only for measurement
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

  // Update input when value changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((o) => o.id === value);
      setInputValue(selectedOption ? selectedOption.name : value);
    } else {
      setInputValue("");
    }
  }, [value, options]);

  // Close when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        const selectedOption = options.find((o) => o.id === value);
        setInputValue(selectedOption ? selectedOption.name : "");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value, options]);

  // --------------------------------------------------------------------
  // LOGIC FOR NON-MEASUREMENT DROPDOWNS
  // --------------------------------------------------------------------
  const normalFilteredOptions = !isMeasurement
    ? options.filter((o) =>
        o.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  // --------------------------------------------------------------------
  // LOGIC FOR MEASUREMENT-DROPDOWN ONLY
  // --------------------------------------------------------------------
  let categoryFilteredOptions = options;

  if (isMeasurement && measurementCategory) {
    categoryFilteredOptions = options.filter(
      (o) => o.category === measurementCategory
    );
  }

  // Group by category
  const groupedOptions = isMeasurement
    ? categoryFilteredOptions.reduce((acc, item) => {
        if (!acc[item.category || "OTHER"]) acc[item.category || "OTHER"] = [];
        acc[item.category || "OTHER"].push(item);
        return acc;
      }, {} as Record<string, DropdownOption[]>)
    : {};

  // Filter inside groups
  const filteredGroupedOptions: Record<string, DropdownOption[]> = {};

  if (isMeasurement) {
    Object.keys(groupedOptions).forEach((category) => {
      const match = groupedOptions[category].filter((o) =>
        o.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      if (match.length > 0) filteredGroupedOptions[category] = match;
    });
  }

  // Create option logic (measurement only)
  const exactMatch =
    isMeasurement &&
    categoryFilteredOptions.some(
      (o) => o.name.toLowerCase() === inputValue.toLowerCase()
    );

  const showCreateOption =
    isMeasurement && inputValue.trim().length > 0 && !exactMatch && !loading;

  // --------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------
  const handleInputClick = () => {
    onOpen();
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange("");
    setIsOpen(true);
  };

  const handleOptionClick = (item: DropdownOption) => {
    onChange(item.id);
    setInputValue(item.name);
    setIsOpen(false);
  };

  const handleCreateClick = () => {
    const newId = inputValue.toLowerCase().replace(/\s+/g, "-");
    onChange(newId);
    setInputValue(inputValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
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
          <div className="absolute z-50 w-full max-h-64 overflow-auto bg-white shadow-lg ring-1 ring-black ring-opacity-5 rounded-md p-2">

            {/* LOADING */}
            {loading && (
              <div className="px-4 py-2 text-gray-500">
                <Loader />
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* NON-MEASUREMENT MODE (Asset, Location etc.) */}
            {/* ---------------------------------------------------------------- */}
            {!loading &&
              !isMeasurement &&
              normalFilteredOptions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOptionClick(item)}
                  className="cursor-pointer px-3 py-2 hover:bg-indigo-600 hover:text-white rounded-md"
                >
                  {item.name}
                </div>
              ))}

            {/* ---------------------------------------------------------------- */}
            {/* MEASUREMENT MODE (ONLY Measurement Unit dropdown) */}
            {/* ---------------------------------------------------------------- */}

            {/* CREATE */}
            {!loading && showCreateOption && (
              <div
                onClick={handleCreateClick}
                className="cursor-pointer px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-md"
              >
                + Create “{inputValue}”
              </div>
            )}

            {/* GROUPED OPTIONS */}
            {!loading &&
              isMeasurement &&
              Object.keys(filteredGroupedOptions).map((category) => (
                <div key={category}>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                    {category}
                  </div>

                  {filteredGroupedOptions[category].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOptionClick(item)}
                      className="cursor-pointer py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white rounded-md"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              ))}

            {/* NOTHING FOUND */}
            {!loading &&
              isMeasurement &&
              !Object.keys(filteredGroupedOptions).length &&
              !showCreateOption && (
                <div className="px-4 py-2 text-gray-500">
                  No options found
                </div>
              )}
          </div>
        )}
      </div>

      {errorText && (
        <p className="mt-2 text-sm text-red-600">{errorText}</p>
      )}
    </div>
  );
}
