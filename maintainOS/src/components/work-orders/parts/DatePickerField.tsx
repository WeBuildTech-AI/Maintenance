import { Calendar } from "lucide-react";
import { useState } from "react";

export default function DatePickerField({ label }: { label: string }) {
  const [date, setDate] = useState("");
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-medium text-gray-900">{label}</h3>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="mm/dd/yyyy"
          className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 bg-white"
        />
        <Calendar
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#3b82f6",
            width: "20px",
            height: "20px",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
