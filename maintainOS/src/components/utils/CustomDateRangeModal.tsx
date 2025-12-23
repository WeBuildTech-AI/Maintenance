"use client";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "../ui/button";
import { subDays, subWeeks, subMonths } from "date-fns";

type Props = {
  onClose: () => void;
  onApply: (start: Date, end: Date) => void;
  anchorRef: React.RefObject<HTMLDivElement | HTMLButtonElement>; // Updated type to accept Button too
  position?: "top" | "bottom" | "auto"; // 👈 New Prop
};

export function CustomDateRangeModal({
  onClose,
  onApply,
  anchorRef,
  position = "auto", // Default to auto
}: Props) {
  const [tab, setTab] = useState<"between" | "last">("last");
  const [value, setValue] = useState<number | "">(15);
  const [unit, setUnit] = useState<"days" | "weeks" | "months">("days");
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  // State for dynamic styling
  const [style, setStyle] = useState<React.CSSProperties>({
    visibility: "hidden", // Hide initially until calculation is done
    position: "absolute",
    zIndex: 50,
    right: 0, // Right align with anchor
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // 📌 Position Logic (Smart Detection)
  useLayoutEffect(() => {
    if (!anchorRef.current || !modalRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();
    const screenHeight = window.innerHeight;

    // Check space below the button
    const spaceBelow = screenHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;

    // Default gap between button and modal
    const gap = 8;

    let finalPosition = position;

    // If auto, decide based on available space
    if (position === "auto") {
      // Agar neeche jagah kam hai (modal height se kam), toh upar dikhao
      if (spaceBelow < modalRect.height && spaceAbove > modalRect.height) {
        finalPosition = "top";
      } else {
        finalPosition = "bottom";
      }
    }

    // Apply Styles based on decision
    if (finalPosition === "top") {
      setStyle({
        position: "absolute",
        bottom: "100%", // Anchor ke upar
        marginBottom: `${gap}px`,
        right: 0,
        zIndex: 50,
        visibility: "visible",
      });
    } else {
      setStyle({
        position: "absolute",
        top: "100%", // Anchor ke neeche
        marginTop: `${gap}px`,
        right: 0,
        zIndex: 50,
        visibility: "visible",
      });
    }
  }, [anchorRef, position, tab]); // Re-calculate if tab changes (size changes)

  // 📌 Sync calendar when LAST is selected
  useEffect(() => {
    if (tab !== "last" || value === "") return;

    const now = new Date();
    let start: Date;

    switch (unit) {
      case "weeks":
        start = subWeeks(now, value);
        break;
      case "months":
        start = subMonths(now, value);
        break;
      default:
        start = subDays(now, value);
    }

    setRange({ from: start, to: now });
  }, [tab, value, unit]);

  const handleApply = () => {
    if (range.from && range.to) {
      onApply(range.from, range.to);
    }
    onClose();
  };

  return (
    <div
      ref={modalRef} // 👈 Ref attached here to measure height
      style={style}
      className="bg-white border rounded-lg shadow-lg w-[360px] p-3"
    >
      {/* Tabs */}
      <div className="flex mb-3 rounded-md overflow-hidden border">
        <button
          className={`flex-1 py-1 text-sm ${
            tab === "between" ? "bg-orange-600 text-white font-medium" : ""
          }`}
          onClick={() => setTab("between")}
        >
          Between
        </button>
        <button
          className={`flex-1 py-1 text-sm ${
            tab === "last" ? "bg-orange-600 text-white font-medium" : ""
          }`}
          onClick={() => setTab("last")}
        >
          Last
        </button>
      </div>

      {/* LAST controls */}
      {tab === "last" && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setValue("");
              } else {
                setValue(Number(val));
              }
            }}
            onBlur={() => {
              if (value === "" || value === 0) {
                setValue(15);
              }
            }}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="flex-1 border rounded px-2 py-1 text-sm"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      )}

      {/* Calendar (Both tabs) */}
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        modifiersClassNames={{
          selected: "bg-orange-600  hover:bg-orange-600",
          range_start: "bg-orange-600 text-white rounded-full",
          range_end: "bg-orange-600 text-white rounded-full",
          range_middle: "bg-orange-100 text-orange-900",
        }}
      />

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-3">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="bg-orange-500" onClick={handleApply}>
          Apply
        </Button>
      </div>

      <div className="text-[11px] text-gray-500 mt-2">
        Time zone for all dates: Asia/Kolkata
      </div>
    </div>
  );
}
