import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

// --- Types & Enums (Matching your backend) ---
export enum RecurrenceType {
  DO_NOT_REPEAT = 'do_not_repeat',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY_BY_DATE = 'monthly_by_date',
  MONTHLY_BY_WEEKDAY = 'monthly_by_weekday',
  YEARLY = 'yearly',
}

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number;
  daysOfWeek?: number[]; // 0=Sun, 6=Sat (or 1-7 depending on backend, usually 0-6 in JS)
  dayOfMonth?: number;   // 1-31
  weekOfMonth?: number;  // 1-4 or 5 (Last)
  weekdayOfMonth?: number; // 0-6
  intervalYears?: number;
}

interface RecurrenceFieldProps {
  // Parent state handlers
  recurrenceRule?: RecurrenceRule | null; 
  setRecurrenceRule?: (val: RecurrenceRule | null) => void;
  
  selectedWorkType?: string;
  setSelectedWorkType?: (val: string) => void;
}

export default function RecurrenceField({
  recurrenceRule,
  setRecurrenceRule,
  selectedWorkType = "Reactive",
  setSelectedWorkType,
}: RecurrenceFieldProps) {
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const workTypes = ["Reactive", "Preventive", "Other"];

  // Local state initialized from props
  const [rule, setRule] = useState<RecurrenceRule>({ 
    type: RecurrenceType.DO_NOT_REPEAT 
  });

  // Sync local state with parent prop
  useEffect(() => {
    if (recurrenceRule) {
        setRule(recurrenceRule);
    }
  }, [recurrenceRule]);

  // Helper to update rule and notify parent
  const updateRule = (updates: Partial<RecurrenceRule>) => {
    const newRule = { ...rule, ...updates };
    setRule(newRule);
    if (setRecurrenceRule) {
      setRecurrenceRule(newRule);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as RecurrenceType;
    
    // Default values when switching types
    const defaults: Partial<RecurrenceRule> = { type: newType };
    
    if (newType === RecurrenceType.WEEKLY) defaults.daysOfWeek = [];
    if (newType === RecurrenceType.MONTHLY_BY_DATE) defaults.dayOfMonth = 1;
    if (newType === RecurrenceType.MONTHLY_BY_WEEKDAY) {
      defaults.weekOfMonth = 1; 
      defaults.weekdayOfMonth = 1; // Monday
    }
    if (newType === RecurrenceType.YEARLY) defaults.intervalYears = 1;

    // Clear other fields by resetting to defaults
    const cleanRule = { type: newType, ...defaults };
    
    // If switching to DO_NOT_REPEAT, send null to parent
    if (newType === RecurrenceType.DO_NOT_REPEAT && setRecurrenceRule) {
        setRule(cleanRule as RecurrenceRule);
        setRecurrenceRule(null); 
    } else {
        updateRule(cleanRule as RecurrenceRule);
    }
  };

  const toggleDayOfWeek = (dayIndex: number) => {
    const currentDays = rule.daysOfWeek || [];
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter((d) => d !== dayIndex)
      : [...currentDays, dayIndex];
    updateRule({ daysOfWeek: newDays });
  };

  // 0=Sun, 1=Mon...
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeks = [
    { label: "First", value: 1 },
    { label: "Second", value: 2 },
    { label: "Third", value: 3 },
    { label: "Fourth", value: 4 },
    { label: "Last", value: 5 }, 
  ];

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-medium text-gray-900">Recurrence & Work Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Recurrence Type Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
          <div className="relative">
            <select
              value={rule.type}
              onChange={handleTypeChange}
              className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-md text-gray-900 bg-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value={RecurrenceType.DO_NOT_REPEAT}>Does not repeat</option>
              <option value={RecurrenceType.DAILY}>Daily</option>
              <option value={RecurrenceType.WEEKLY}>Weekly</option>
              <option value={RecurrenceType.MONTHLY_BY_DATE}>Monthly (By Date)</option>
              <option value={RecurrenceType.MONTHLY_BY_WEEKDAY}>Monthly (By Weekday)</option>
              <option value={RecurrenceType.YEARLY}>Yearly</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* 2. Work Type Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Work Type</label>
          <div
            onClick={() => setWorkTypeOpen(!workTypeOpen)}
            className="flex items-center justify-between h-12 px-4 border border-gray-300 rounded-md bg-white cursor-pointer"
          >
            <span className="text-gray-900 text-sm">{selectedWorkType}</span>
            <ChevronDown
              className={`h-4 w-4 text-blue-500 transition-transform ${
                workTypeOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {workTypeOpen && (
            <div className="absolute left-0 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg z-20">
              {workTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    if (setSelectedWorkType) setSelectedWorkType(type);
                    setWorkTypeOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm ${
                    selectedWorkType === type
                      ? "text-blue-600 font-semibold bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- DYNAMIC RECURRENCE OPTIONS --- */}
      
      {/* WEEKLY: Days of Week */}
      {rule.type === RecurrenceType.WEEKLY && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">Repeat on</label>
          <div className="flex gap-2 flex-wrap">
            {days.map((day, idx) => {
              const isSelected = rule.daysOfWeek?.includes(idx); // 0=Sun
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDayOfWeek(idx)}
                  className={`w-10 h-10 rounded-full text-xs font-medium transition-colors border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {day.charAt(0)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY BY DATE */}
      {rule.type === RecurrenceType.MONTHLY_BY_DATE && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Day of Month</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">On day</span>
            <input
              type="number"
              min={1}
              max={31}
              value={rule.dayOfMonth || ""}
              onChange={(e) => updateRule({ dayOfMonth: parseInt(e.target.value) })}
              className="w-20 h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
              placeholder="1-31"
            />
          </div>
        </div>
      )}

      {/* MONTHLY BY WEEKDAY */}
      {rule.type === RecurrenceType.MONTHLY_BY_WEEKDAY && (
        <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Week</label>
            <div className="relative">
              <select
                value={rule.weekOfMonth || 1}
                onChange={(e) => updateRule({ weekOfMonth: parseInt(e.target.value) })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm outline-none focus:border-blue-500 appearance-none"
              >
                {weeks.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
            <div className="relative">
              <select
                value={rule.weekdayOfMonth || 0}
                onChange={(e) => updateRule({ weekdayOfMonth: parseInt(e.target.value) })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm outline-none focus:border-blue-500 appearance-none"
              >
                {days.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* YEARLY */}
      {rule.type === RecurrenceType.YEARLY && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Interval (Years)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Every</span>
            <input
              type="number"
              min={1}
              value={rule.intervalYears || 1}
              onChange={(e) => updateRule({ intervalYears: parseInt(e.target.value) })}
              className="w-20 h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
            />
            <span className="text-sm text-gray-600">Year(s)</span>
          </div>
        </div>
      )}
    </div>
  );
}