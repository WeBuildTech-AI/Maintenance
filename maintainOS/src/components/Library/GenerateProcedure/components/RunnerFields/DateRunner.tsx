import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; 
import { format, isValid } from "date-fns";

interface DateRunnerProps {
  value: string | null;
  onChange: (val: string | null) => void;
}

export function DateRunner({ value, onChange }: DateRunnerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : undefined;
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString());
      setIsCalendarOpen(false);
    }
  };
  const displayDate = value && isValid(new Date(value)) ? format(new Date(value), "MM/dd/yyyy") : "";

  return (
    <div className="relative mt-2" ref={containerRef}>
      <div 
        className={`flex items-center border rounded-md bg-white px-3 py-2.5 cursor-pointer transition-shadow ${isCalendarOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 hover:border-gray-400"}`}
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <input readOnly value={displayDate} placeholder="mm/dd/yyyy" className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 cursor-pointer" />
        <div className="flex items-center gap-2">
          {value && <button onClick={(e) => { e.stopPropagation(); onChange(null); }} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>}
          <div className="border-l border-gray-200 h-5 mx-1"></div>
          <CalendarIcon size={18} className="text-blue-500" />
        </div>
      </div>
      {isCalendarOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 animate-in fade-in zoom-in-95">
          <DayPicker mode="single" selected={selectedDate} onSelect={handleSelect} styles={{ head_cell: { width: "40px", color: "#6b7280", fontSize: "0.75rem", fontWeight: 600 }, cell: { width: "40px" }, day: { margin: "auto", borderRadius: "6px" }, day_selected: { backgroundColor: "#2563eb", color: "white" }, day_today: { fontWeight: "bold", color: "#2563eb" } }} />
        </div>
      )}
    </div>
  );
}