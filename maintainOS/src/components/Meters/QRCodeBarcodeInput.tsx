"use client";

import { useState } from "react";

interface Props {
  title?: string;
  placeholder?: string;
  generateText?: string;
  value?: string;
  onChange?: (value: string) => void;
  onGenerate?: () => void;
}

export function QRCodeBarcodeInput({
  title = "QR Code/Barcode",
  placeholder = "Enter or scan code",
  generateText = "Generate Code",
  value = "",
  onChange = () => {},
  onGenerate = () => {},
}: Props) {
  const [inputValue, setInputValue] = useState<string>(value);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{title}</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full h-10 px-3 border rounded-md bg-gray-50"
      />
      <div className="mt-1">
        <span
          onClick={onGenerate}
          className="text-sm text-orange-600 cursor-pointer hover:underline"
        >
          {generateText}
        </span>
      </div>
    </div>
  );
}
