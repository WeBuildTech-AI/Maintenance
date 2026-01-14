import { useState, useEffect, useRef } from "react";
import {  Calendar, Clock } from "lucide-react";
import { fetchFilterData } from "../../utils/filterDataFetcher";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DynamicSelect } from "./DynamicSelect"; // ✅ Imported DynamicSelect

// --- ✅ CUSTOM TIME PICKER COMPONENT (Preserved) ---
interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const TimePickerInput = ({ value, onChange, className }: TimePickerProps) => {
  const [isOpenH, setIsOpenH] = useState(false);
  const [isOpenM, setIsOpenM] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const [hours, minutes] = (value || "00:00").split(":");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpenH(false);
        setIsOpenM(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpenH && hourListRef.current) {
      const selectedEl = hourListRef.current.querySelector(`[data-value="${hours}"]`);
      if (selectedEl) selectedEl.scrollIntoView({ block: "center" });
    }
  }, [isOpenH, hours]);

  useEffect(() => {
    if (isOpenM && minuteListRef.current) {
      const selectedEl = minuteListRef.current.querySelector(`[data-value="${minutes}"]`);
      if (selectedEl) selectedEl.scrollIntoView({ block: "center" });
    }
  }, [isOpenM, minutes]);

  return (
    <div
      ref={containerRef}
      className={className} 
      style={{ display: "flex", alignItems: "center", position: "relative", cursor: "pointer" }}
    >
      <div className="flex items-center text-sm text-gray-900 w-full h-full">
        <span
          onClick={(e) => { e.stopPropagation(); setIsOpenH(!isOpenH); setIsOpenM(false); }}
          className={`px-1 rounded hover:bg-gray-100 transition-colors select-none ${isOpenH ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
        >
          {hours || "00"}
        </span>
        <span className="mx-0.5 text-gray-400 font-medium">:</span>
        <span
          onClick={(e) => { e.stopPropagation(); setIsOpenM(!isOpenM); setIsOpenH(false); }}
          className={`px-1 rounded hover:bg-gray-100 transition-colors select-none ${isOpenM ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
        >
          {minutes || "00"}
        </span>
      </div>

      <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      {isOpenH && (
        <div 
          ref={hourListRef}
          className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
          style={{ maxHeight: "145px", overflowY: "auto" }}
        >
          {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
            <div
              key={h}
              data-value={h}
              onClick={(e) => { e.stopPropagation(); onChange(`${h}:${minutes || "00"}`); setIsOpenH(false); }}
              className={`px-3 py-2 text-sm cursor-pointer text-center hover:bg-gray-50 transition-colors ${hours === h ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {h}
            </div>
          ))}
        </div>
      )}

      {isOpenM && (
        <div 
          ref={minuteListRef}
          className="absolute top-full left-10 mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
          style={{ maxHeight: "145px", overflowY: "auto" }}
        >
          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map((m) => (
            <div
              key={m}
              data-value={m}
              onClick={(e) => { e.stopPropagation(); onChange(`${hours || "00"}:${m}`); setIsOpenM(false); }}
              className={`px-3 py-2 text-sm cursor-pointer text-center hover:bg-gray-50 transition-colors ${minutes === m ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

interface Props {
  selectedUsers: string[];
  setSelectedUsers: (value: string[] | ((prev: string[]) => string[])) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  selectedWorkType: string;
  setSelectedWorkType: (value: string) => void;
  onOpenInviteModal: () => void;
  
  recurrenceRule: any; 
  setRecurrenceRule: (value: any) => void;
  recurrence?: string;
  setRecurrence?: (value: string) => void;
  initialAssignees?: { id: string; name: string }[];
  startTime?: string;
  setStartTime?: (value: string) => void;
  dueTime?: string;
  setDueTime?: (value: string) => void;
}

export function AssignmentAndScheduling({
  selectedUsers,
  setSelectedUsers,
  dueDate,
  setDueDate,
  startDate,
  setStartDate,
  selectedWorkType,
  setSelectedWorkType,
  onOpenInviteModal,
  recurrenceRule,
  setRecurrenceRule,
  initialAssignees = [],
  startTime = "",
  setStartTime,
  dueTime = "",
  setDueTime,
}: Props) {
  // ✅ Managed locally since not passed from parent in this snippet context
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [selectedFreq, setSelectedFreq] = useState("Does not repeat");
  const [users, setUsers] = useState<{ id: string; name: string }[]>(initialAssignees);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showDueCalendar, setShowDueCalendar] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const dueRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]); 
  const [monthMode, setMonthMode] = useState<"date" | "weekday">("date");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [weekOfMonth, setWeekOfMonth] = useState(1);
  const [weekdayOfMonth, setWeekdayOfMonth] = useState(1); 
  const [yearInterval, setYearInterval] = useState(1);
  const monthDaysList = Array.from({length: 31}, (_, i) => i + 1);

  // Constants for Dropdowns
  const workTypes = ["Reactive", "Preventive", "Other"].map(t => ({ id: t, name: t }));
  const recurrenceOptions = ["Does not repeat", "Daily", "Weekly", "Monthly", "Yearly"].map(r => ({ id: r, name: r }));

  // --- Time Toggle States ---
  const [showDueTimeInput, setShowDueTimeInput] = useState(!!dueTime);
  const [showStartTimeInput, setShowStartTimeInput] = useState(!!startTime);

  // Local state fallbacks
  const [internalStartTime, setInternalStartTime] = useState("");
  const [internalDueTime, setInternalDueTime] = useState("");

  const handleStartTimeChange = (val: string) => {
    if (setStartTime) setStartTime(val);
    else setInternalStartTime(val);
  };

  const handleDueTimeChange = (val: string) => {
    if (setDueTime) setDueTime(val);
    else setInternalDueTime(val);
  };

  const currentStartTime = setStartTime ? startTime : internalStartTime;
  const currentDueTime = setDueTime ? dueTime : internalDueTime;

  // Effects
  useEffect(() => {
    if (dueTime && !showDueTimeInput) setShowDueTimeInput(true);
  }, [dueTime]);

  useEffect(() => {
    if (startTime && !showStartTimeInput) setShowStartTimeInput(true);
  }, [startTime]);

  useEffect(() => {
    if (initialAssignees.length > 0) {
      setUsers((prev) => {
        const existingIds = new Set(prev.map(u => u.id));
        const newUsers = initialAssignees.filter(u => !existingIds.has(u.id));
        return [...prev, ...newUsers];
      });
    }
  }, [initialAssignees]);

  // Recurrence Logic
  useEffect(() => {
    if (recurrenceRule) {
      try {
        const rule = typeof recurrenceRule === 'string' ? JSON.parse(recurrenceRule) : recurrenceRule;
        const type = rule.type?.toLowerCase();

        if (type === 'daily') setSelectedFreq("Daily");
        else if (type === 'weekly') {
          setSelectedFreq("Weekly");
          if(rule.daysOfWeek) setSelectedWeekDays(rule.daysOfWeek);
        }
        else if (type === 'monthly_by_date') {
          setSelectedFreq("Monthly");
          setMonthMode("date");
          if(rule.dayOfMonth) setDayOfMonth(rule.dayOfMonth);
        }
        else if (type === 'monthly_by_weekday') {
          setSelectedFreq("Monthly");
          setMonthMode("weekday");
          if(rule.weekOfMonth) setWeekOfMonth(rule.weekOfMonth);
          if(rule.weekdayOfMonth) setWeekdayOfMonth(rule.weekdayOfMonth);
        }
        else if (type === 'yearly') {
          setSelectedFreq("Yearly");
          if(rule.intervalYears) setYearInterval(rule.intervalYears);
        }
        else {
          setSelectedFreq("Does not repeat");
        }
      } catch (e) {
        console.error("Failed to parse recurrence rule", e);
      }
    }
  }, [recurrenceRule]);

  // Update Recurrence Rule State
  useEffect(() => {
    let rule = null;
    if (selectedFreq === "Daily") rule = { type: "daily" };
    else if (selectedFreq === "Weekly") {
      if (selectedWeekDays.length > 0) {
        const sortedDays = [...selectedWeekDays].sort((a,b) => a-b);
        rule = { type: "weekly", daysOfWeek: sortedDays };
      }
    }
    else if (selectedFreq === "Monthly") {
      if (monthMode === "date") rule = { type: "monthly_by_date", dayOfMonth: dayOfMonth };
      else rule = { type: "monthly_by_weekday", weekOfMonth: weekOfMonth, weekdayOfMonth: weekdayOfMonth };
    }
    else if (selectedFreq === "Yearly") rule = { type: "yearly", intervalYears: yearInterval };

    setRecurrenceRule(rule);
  }, [selectedFreq, selectedWeekDays, monthMode, dayOfMonth, weekOfMonth, weekdayOfMonth, yearInterval, setRecurrenceRule]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dueRef.current && !dueRef.current.contains(event.target as Node)) setShowDueCalendar(false);
      if (startRef.current && !startRef.current.contains(event.target as Node)) setShowStartCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await fetchFilterData("users");
      const normalized = Array.isArray(data) && data.length
          ? data.map((u: any) => ({ id: u.id, name: u.fullName || u.name || "Unnamed User" }))
          : [];
      
      setUsers((prev) => {
         const existingIds = new Set(prev.map(u => u.id));
         const newUsers = normalized.filter((u: any) => !existingIds.has(u.id));
         return [...prev, ...newUsers];
      });
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (idx: number) => {
    setSelectedWeekDays((prev) => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
  };

  const getYearlyDateLabel = () => {
    if (!startDate) return "the start date";
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return "the start date";
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${month}/${day}`;
  };

  return (
    <>
      {/* ✅ Assigned To - using DynamicSelect */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Assigned To</h3>
        <DynamicSelect
          name="assignees"
          placeholder="Select assignees..."
          options={users}
          loading={isLoading}
          value={selectedUsers}
          onSelect={(val) => setSelectedUsers(val as string[])}
          onFetch={fetchUsers}
          ctaText="+ Invite New Member"
          onCtaClick={onOpenInviteModal}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          className="w-full"
        />
      </div>

      {/* Due Date & Time */}
      <div className="mt-6" ref={dueRef}>
        <h3 className="mb-4 text-base font-medium text-gray-900">Due Date</h3>
        <div style={{ display: "flex", gap: "12px", width: "100%", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input 
              type="text" 
              readOnly 
              value={dueDate} 
              onClick={() => setShowDueCalendar(!showDueCalendar)} 
              placeholder="Select date" 
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer transition-all shadow-sm placeholder-gray-400" 
            />
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
               <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            {showDueCalendar && (
              <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100">
                  <DayPicker 
                      mode="single" 
                      selected={dueDate ? new Date(dueDate) : undefined} 
                      onSelect={(date) => { 
                          if (date) { 
                              setDueDate(date.toLocaleDateString("en-US")); 
                              setShowDueCalendar(false); 
                          } 
                      }} 
                  />
              </div>
            )}
          </div>
          {showDueTimeInput ? (
            <div style={{ position: "relative", width: "140px" }}>
              <TimePickerInput 
                value={currentDueTime}
                onChange={handleDueTimeChange}
                className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-md text-gray-900 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDueTimeInput(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors whitespace-nowrap h-12 flex items-center"
            >
              + Add time
            </button>
          )}
        </div>
      </div>

      {/* Start Date & Time */}
      <div className="mt-6" ref={startRef}>
        <h3 className="mb-4 text-base font-medium text-gray-900">Start Date</h3>
        <div style={{ display: "flex", gap: "12px", width: "100%", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input 
              type="text" 
              readOnly 
              value={startDate} 
              onClick={() => setShowStartCalendar(!showStartCalendar)} 
              placeholder="Select date" 
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer transition-all shadow-sm placeholder-gray-400" 
            />
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
               <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            {showStartCalendar && (
              <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100">
                  <DayPicker 
                      mode="single" 
                      selected={startDate ? new Date(startDate) : undefined} 
                      onSelect={(date) => { 
                          if (date) { 
                              setStartDate(date.toLocaleDateString("en-US")); 
                              setShowStartCalendar(false); 
                          } 
                      }} 
                  />
              </div>
            )}
          </div>
          {showStartTimeInput ? (
            <div style={{ position: "relative", width: "140px" }}>
              <TimePickerInput 
                value={currentStartTime}
                onChange={handleStartTimeChange}
                className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-md text-gray-900 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowStartTimeInput(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors whitespace-nowrap h-12 flex items-center"
            >
              + Add time
            </button>
          )}
        </div>
      </div>

      {/* RECURRENCE (Using DynamicSelect) */}
      <div className="mt-8">
        <h3 className="mb-4 text-base font-medium text-gray-900">Recurrence</h3>
        <div className="grid grid-cols-2 gap-4">
          
          {/* Frequency Dropdown */}
          <DynamicSelect
            name="recurrence-freq"
            placeholder="Select frequency"
            options={recurrenceOptions}
            loading={false}
            value={selectedFreq}
            onSelect={(val) => {
              setSelectedFreq(val as string);
              if (val === "Monthly") { setMonthMode("date"); setDayOfMonth(1); }
            }}
            onFetch={() => {}} // No fetch needed for static options
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            className="w-full"
          />

          {/* Work Type Dropdown */}
          <DynamicSelect
            name="work-type"
            placeholder="Select work type"
            options={workTypes}
            loading={false}
            value={selectedWorkType}
            onSelect={(val) => setSelectedWorkType(val as string)}
            onFetch={() => {}}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            className="w-full"
          />
        </div>

        {selectedFreq === "Daily" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100 text-sm text-gray-600">
            Repeats daily after completion.
          </div>
        )}

        {selectedFreq === "Weekly" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3 font-medium">
              Repeat on:
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
              {daysOfWeek.map((day, idx) => {
                const isSelected = selectedWeekDays.includes(idx);
                return (
                  <button key={day} type="button" onClick={() => toggleDay(idx)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-colors border ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {selectedFreq === "Monthly" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex gap-6 mb-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" checked={monthMode === "date"} onChange={() => setMonthMode("date")} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-gray-700 group-hover:text-gray-900">By Date</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" checked={monthMode === "weekday"} onChange={() => setMonthMode("weekday")} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-gray-700 group-hover:text-gray-900">By Weekday</span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
              <span>Repeat on the</span>

              {monthMode === "date" ? (
                <div className="flex items-center gap-2">
                  <select value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))} className="h-9 border border-gray-300 rounded px-2 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer">
                    {monthDaysList.map((d) => (
                      <option key={d} value={d}>{d}{[1, 21, 31].includes(d) ? "st" : [2, 22].includes(d) ? "nd" : [3, 23].includes(d) ? "rd" : "th"}</option>
                    ))}
                  </select>
                  <span>day of month</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select value={weekOfMonth} onChange={(e) => setWeekOfMonth(Number(e.target.value))} className="h-9 border border-gray-300 rounded px-2 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer">
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                    <option value={5}>Last</option>
                  </select>
                  <select value={weekdayOfMonth} onChange={(e) => setWeekdayOfMonth(Number(e.target.value))} className="h-9 border border-gray-300 rounded px-2 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer">
                    {daysOfWeek.map((d, i) => (
                      <option key={d} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedFreq === "Yearly" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
              <span>Every</span>
              <input type="number" min="1" value={yearInterval} onChange={(e) => setYearInterval(Number(e.target.value))} className="w-16 border-b-2 border-gray-300 text-center outline-none focus:border-blue-500 bg-transparent pb-1 font-medium" />
              <span>year(s)</span>
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100 inline-block">
              Will repeat on <span className="font-medium text-blue-700">{getYearlyDateLabel()}</span> every {yearInterval} year(s).
            </p>
          </div>
        )}
      </div>
    </>
  );
}