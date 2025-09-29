import { useState } from "react";
import { X } from "lucide-react";

interface CapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  assigneeName: string;
  onRequestConfirm: () => void;
}

type Day =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

interface DaySchedule {
  enabled: boolean;
  hours: number;
  minutes: number;
}

type Schedule = Record<Day, DaySchedule>;

export default function CapacityModal({
  isOpen,
  onClose,
  assigneeName,
  onRequestConfirm,
}: CapacityModalProps) {
  const [schedule, setSchedule] = useState<Schedule>({
    Sunday: { enabled: false, hours: 0, minutes: 0 },
    Monday: { enabled: true, hours: 7, minutes: 0 },
    Tuesday: { enabled: true, hours: 7, minutes: 0 },
    Wednesday: { enabled: true, hours: 7, minutes: 0 },
    Thursday: { enabled: true, hours: 7, minutes: 0 },
    Friday: { enabled: true, hours: 7, minutes: 0 },
    Saturday: { enabled: false, hours: 0, minutes: 0 },
  });

  const [initialSchedule, setInitialSchedule] = useState(schedule);

  if (!isOpen) return null;

  const handleToggle = (day: Day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleChange = (day: Day, type: "hours" | "minutes", value: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
  };

  const totalWeeklyCapacity = Object.values(schedule).reduce(
    (acc, day) => acc + (day.enabled ? day.hours + day.minutes / 60 : 0),
    0
  );

  const isChanged =
    JSON.stringify(schedule) !== JSON.stringify(initialSchedule);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "6px",
          width: "400px",
          maxWidth: "95%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          fontFamily: "Roboto, sans-serif",
          overflow: "hidden",
          fontSize: "13px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 500 }}>{assigneeName}</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px",
            }}
          >
            <X size={18} color="#5f6368" />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e0e0e0",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "6px",
              border: "none",
              borderBottom: "2px solid #1a73e8",
              background: "transparent",
              color: "#1a73e8",
              cursor: "pointer",
            }}
          >
            Default Schedule
          </button>
          <button
            style={{
              flex: 1,
              padding: "6px",
              border: "none",
              background: "transparent",
              color: "#5f6368",
              cursor: "pointer",
            }}
          >
            Custom Capacity by Week
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {Object.entries(schedule).map(([day, data]) => (
            <div
              key={day}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e0e0e0",
                borderRadius: "5px",
                padding: "6px 10px",
                background: "#fff",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                <div
                  onClick={() => handleToggle(day as Day)}
                  style={{
                    width: "28px",
                    height: "16px",
                    borderRadius: "16px",
                    background: data.enabled ? "#34c759" : "#ccc",
                    position: "relative",
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: "2px",
                      left: data.enabled ? "14px" : "2px",
                      transition: "all 0.3s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
                {day}
              </label>

              {/* Hours + Minutes */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="number"
                  value={data.hours}
                  disabled={!data.enabled}
                  min={0}
                  onChange={(e) =>
                    handleChange(
                      day as Day,
                      "hours",
                      parseInt(e.target.value) || 0
                    )
                  }
                  style={{
                    width: "40px",
                    padding: "4px 3px",
                    border: "1px solid #dadce0",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: data.enabled ? "#fff" : "#f1f3f4",
                  }}
                />
                <span>h</span>
                <input
                  type="number"
                  value={data.minutes}
                  disabled={!data.enabled}
                  min={0}
                  step={15}
                  onChange={(e) =>
                    handleChange(
                      day as Day,
                      "minutes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  style={{
                    width: "40px",
                    padding: "4px 3px",
                    border: "1px solid #dadce0",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: data.enabled ? "#fff" : "#f1f3f4",
                  }}
                />
                <span>m</span>
              </div>
            </div>
          ))}

          {/* Total Weekly Capacity */}
          <div
            style={{
              marginTop: "4px",
              fontSize: "12px",
              color: "#5f6368",
            }}
          >
            <strong>Total Weekly Capacity:</strong>{" "}
            {totalWeeklyCapacity.toFixed(0)}h
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "6px",
            padding: "8px 12px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#5f6368",
              fontSize: "13px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onRequestConfirm}
            disabled={!isChanged}
            style={{
              padding: "6px 12px",
              background: isChanged ? "#1a73e8" : "#e0e0e0",
              color: isChanged ? "#fff" : "#5f6368",
              border: "none",
              borderRadius: "4px",
              cursor: isChanged ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
