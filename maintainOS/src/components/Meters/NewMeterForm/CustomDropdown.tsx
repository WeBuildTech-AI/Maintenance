// ./components/CustomDropdown.tsx (UPDATED)

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react"; // Using lucide-react like your other icons
import Loader from "../../Loader/Loader";

interface DropdownOption {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  id: string;
  label: string;
  value: string; // The selected ID
  onChange: (value: string) => void;
  options: DropdownOption[];
  onOpen: () => void; // Function to call to fetch data
  loading: boolean;
  placeholder: string;
  errorText?: string;
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
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // This state holds what the user is typing
  const [inputValue, setInputValue] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Jab 'value' (selected ID) badalta hai, toh input field ko update karo
  useEffect(() => {
    if (value) {
      const selectedOption = options.find((item) => item.id === value);
      setInputValue(selectedOption ? selectedOption.name : "");
    } else {
      setInputValue(""); // Agar value clear ho, toh input ko bhi clear karo
    }
  }, [value, options, isOpen]); // isOpen add kiya taaki select karne par update ho

  // Click-Outside Handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);

        // Agar user ne bahar click kiya aur kuch select nahi kiya, toh reset karo
        const selectedOption = options.find((item) => item.id === value);
        setInputValue(selectedOption ? selectedOption.name : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, value, options]);

  // Options ko filter karo based on user input
  const filteredOptions = Array.isArray(options)
    ? options.filter((item) =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  const handleInputClick = () => {
    onOpen(); // Data fetch karo
    setIsOpen(true); // List open karo
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue); // User jo type kar raha hai, woh dikhao
    onChange(""); // Selection (ID) ko clear kardo kyunki user naya search kar raha hai
    setIsOpen(true); // List ko open rakho
  };

  const handleOptionClick = (item: DropdownOption) => {
    onChange(item.id); // ID set karo
    setInputValue(item.name); // Input field mein poora naam dikhao
    setIsOpen(false); // List band karo
  };

  return (
    <div className="w-full">
      {/* Label only renders if provided */}
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      {/* This 'ref' is for the click-outside handler */}
      <div className={label ? "relative mt-2" : "relative"} ref={dropdownRef}>
        {/* === The Input (replaces <button>) === */}
        <input
          type="text"
          id={id}
          value={inputValue} // Yahan 'inputValue' state use hoga
          onChange={handleInputChange} // Typing handle karega
          onClick={handleInputClick} // Click par open karega
          placeholder={placeholder}
          className="relative block w-full pl-2 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-sm text-gray-700 shadow-sm border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          style={{ height: "40px" }}
          aria-expanded={isOpen}
          aria-labelledby={`${id}-label`}
          autoComplete="off" // Browser ka autocomplete band karo
        />

        {/* Icon (Input ke upar) */}

        {/* === The Dropdown Panel (replaces <option>) === */}
        {isOpen && (
          <div className="absolute z-50 p-2 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {/* Loading state */}
            {loading && (
              <div className="cursor-default select-none px-4 py-2 text-gray-500">
                <Loader />
              </div>
            )}

            {/* Error state */}
            {errorText && !loading && !options.length && (
              <div className="cursor-default select-none px-4 py-2 text-red-600">
                Error loading data
              </div>
            )}

            {/* No options state (after filtering) */}
            {!loading && filteredOptions.length === 0 && (
              <div className="cursor-default select-none px-4 py-2 text-gray-500">
                No options found
              </div>
            )}

            {/* Data state (using filteredOptions) */}
            {!loading &&
              filteredOptions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOptionClick(item)}
                  className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOptionClick(item);
                    }
                  }}
                >
                  <span className="block truncate">{item.name}</span>
                  {value === item.id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                      {/* Check icon yahan laga sakte hain */}
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Validation error */}
      {errorText && <p className="mt-2 text-sm text-red-600">{errorText}</p>}
    </div>
  );
}
