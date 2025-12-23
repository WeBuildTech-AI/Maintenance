import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Calendar } from "lucide-react";
import { fetchFilterData } from "../../utils/filterDataFetcher";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
  
  // Legacy props (can be ignored if not used elsewhere, but good to keep for compatibility)
  recurrence?: string;
  setRecurrence?: (value: string) => void;

  // ✅ NEW PROP: Pass pre-loaded assignees here
  initialAssignees?: { id: string; name: string }[];
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
  initialAssignees = [], // ✅ Default to empty array
}: Props) {
  const [assignedOpen, setAssignedOpen] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [selectedFreq, setSelectedFreq] = useState("Does not repeat");

  // ✅ FIX: Initialize users state with initialAssignees
  const [users, setUsers] = useState<{ id: string; name: string }[]>(initialAssignees);
  
  const [isLoading, setIsLoading] = useState(false);
  const workTypes = ["Reactive", "Preventive", "Other"];

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

  // ✅ FIX: Update users list if initialAssignees prop changes (e.g., after API load in parent)
  useEffect(() => {
    if (initialAssignees.length > 0) {
      setUsers((prev) => {
        // Create a Set of existing IDs for faster lookup
        const existingIds = new Set(prev.map(u => u.id));
        // Filter out initial assignees that are already in the state
        const newUsers = initialAssignees.filter(u => !existingIds.has(u.id));
        // Merge previous users with new unique ones
        return [...prev, ...newUsers];
      });
    }
  }, [initialAssignees]);

  // Initialize Recurrence UI from Rule
  useEffect(() => {
    if (recurrenceRule) {
      try {
        const rule = typeof recurrenceRule === 'string' ? JSON.parse(recurrenceRule) : recurrenceRule;
        const type = rule.type?.toLowerCase();

        if (type === 'daily') {
            setSelectedFreq("Daily");
        }
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
  }, [recurrenceRule]); // Added recurrenceRule as dependency to update on load

  // Update Recurrence Rule State when UI changes
  useEffect(() => {
    let rule = null;

    if (selectedFreq === "Daily") {
      rule = { type: "daily" };
    } 
    else if (selectedFreq === "Weekly") {
      if (selectedWeekDays.length > 0) {
        const sortedDays = [...selectedWeekDays].sort((a,b) => a-b);
        rule = { type: "weekly", daysOfWeek: sortedDays };
      }
    }
    else if (selectedFreq === "Monthly") {
      if (monthMode === "date") {
        rule = { type: "monthly_by_date", dayOfMonth: dayOfMonth };
      } else {
        rule = { type: "monthly_by_weekday", weekOfMonth: weekOfMonth, weekdayOfMonth: weekdayOfMonth };
      }
    }
    else if (selectedFreq === "Yearly") {
      rule = { type: "yearly", intervalYears: yearInterval };
    }

    setRecurrenceRule(rule);
  }, [
    selectedFreq, selectedWeekDays, 
    monthMode, dayOfMonth, weekOfMonth, weekdayOfMonth, 
    yearInterval, setRecurrenceRule // Added setRecurrenceRule to dependency array
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dueRef.current && !dueRef.current.contains(event.target as Node)) setShowDueCalendar(false);
      if (startRef.current && !startRef.current.contains(event.target as Node)) setShowStartCalendar(false);
      
      // Close dropdowns if clicking outside (simple implementation, might need specific refs)
      // setRecurrenceOpen(false); // This might conflict with the dropdown itself if not ref-bounded
      // setWorkTypeOpen(false); 
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
      
      // Merge fetched users with initial ones to preserve selection names and avoid duplicates
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

  useEffect(() => {
    // Fetch users only when dropdown opens AND we don't have many users (optimization)
    // Or you can fetch every time to be safe.
    if (assignedOpen) {
        fetchUsers();
    }
  }, [assignedOpen]);

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(assignedSearch.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const getUserName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : "Unknown";
  };

  const toggleDay = (idx: number) => {
    setSelectedWeekDays((prev) => {
      if (prev.includes(idx)) return prev.filter(d => d !== idx);
      return [...prev, idx];
    });
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
      {/* Assigned To */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Assigned To</h3>
        <div className="relative">
          <div onClick={() => setAssignedOpen(!assignedOpen)} className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-2 min-h-[44px] cursor-pointer">
            {selectedUsers.map((id) => (
              <span key={id} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-800 text-sm pl-1 pr-2 py-1 rounded-sm">
                <div className="w-6 h-6 rounded-full bg-blue-300 text-white flex items-center justify-center text-xs font-semibold">
                  {getUserName(id).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{getUserName(id)}</span>
                <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" onClick={(e) => { e.stopPropagation(); toggleUser(id); }} />
              </span>
            ))}
            <input 
              value={assignedSearch} 
              onChange={(e) => setAssignedSearch(e.target.value)} 
              placeholder={selectedUsers.length === 0 ? "Type name or email address" : ""} 
              className="flex-1 border-0 outline-none text-sm py-1 px-1 min-w-[150px]" 
              onClick={(e) => {
                  e.stopPropagation();
                  setAssignedOpen(true);
              }}
            />
            <ChevronDown className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${assignedOpen ? "rotate-180" : ""}`} />
          </div>

          {assignedOpen && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div onClick={() => { onOpenInviteModal(); setAssignedOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-blue-600 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b">
                <span>+</span> Invite New Member
              </div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">Users</div>
              <div className="overflow-y-auto" style={{ maxHeight: "200px", scrollbarWidth: "thin" }}>
                {isLoading ? <div className="p-4 text-center text-gray-500 text-sm">Loading...</div> : 
                 filteredUsers.length === 0 ? <div className="p-4 text-center text-gray-500 text-sm">No users found</div> :
                 filteredUsers.map((u) => (
                    <div key={u.id} onClick={() => toggleUser(u.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${selectedUsers.includes(u.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                        {(u.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-900">{u.name}</span>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(u.id)} 
                        readOnly
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Due Date */}
      <div className="mt-4" ref={dueRef}>
        <h3 className="mb-4 text-base font-medium text-gray-900">Due Date</h3>
        <div style={{ position: "relative" }}>
          <input 
            type="text" 
            readOnly 
            value={dueDate} 
            onClick={() => setShowDueCalendar(!showDueCalendar)} 
            placeholder="mm/dd/yyyy" 
            className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 text-sm outline-none focus:border-blue-500 cursor-pointer" 
          />
          <Calendar onClick={() => setShowDueCalendar(!showDueCalendar)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6", width: "20px", cursor: "pointer" }} />
          {showDueCalendar && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2">
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
      </div>

      {/* Start Date */}
      <div className="mt-4" ref={startRef}>
        <h3 className="mb-4 text-base font-medium text-gray-900">Start Date</h3>
        <div style={{ position: "relative" }}>
          <input 
            type="text" 
            readOnly 
            value={startDate} 
            onClick={() => setShowStartCalendar(!showStartCalendar)} 
            placeholder="mm/dd/yyyy" 
            className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 text-sm outline-none focus:border-blue-500 cursor-pointer" 
          />
          <Calendar onClick={() => setShowStartCalendar(!showStartCalendar)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6", width: "20px", cursor: "pointer" }} />
          {showStartCalendar && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2">
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
      </div>

      {/* RECURRENCE */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Recurrence</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <div onClick={() => { setRecurrenceOpen(!recurrenceOpen); setWorkTypeOpen(false); }} className={`flex items-center justify-between w-full h-12 px-4 border rounded-md bg-white cursor-pointer text-gray-900 ${recurrenceOpen ? "border-yellow-400 ring-2 ring-yellow-300" : "border-gray-300"}`}>
              <span>{selectedFreq}</span>
              <ChevronDown className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${recurrenceOpen ? "rotate-180" : ""}`} />
            </div>
            {recurrenceOpen && (
              <div onMouseDown={(e) => e.stopPropagation()} className="absolute left-0 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-xl z-40">
                {["Does not repeat", "Daily", "Weekly", "Monthly", "Yearly"].map((r) => (
                  <div key={r} onClick={() => {
                      setSelectedFreq(r);
                      setRecurrenceOpen(false);
                      // Reset sub-options if needed for clarity
                      if(r === "Monthly") { 
                        setMonthMode("date"); setDayOfMonth(1); 
                      }
                    }} className={`px-4 py-3 cursor-pointer text-sm ${selectedFreq === r ? "text-blue-600 font-semibold bg-blue-50 flex justify-between" : "text-gray-700 hover:bg-gray-100"}`}>
                    <span>{r}</span>
                    {selectedFreq === r && <span className="text-blue-600">✔</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div onClick={() => { setWorkTypeOpen(!workTypeOpen); setRecurrenceOpen(false); }} className={`flex items-center justify-between w-full h-12 px-4 border rounded-md bg-white cursor-pointer text-gray-900 ${workTypeOpen ? "border-blue-400 ring-2 ring-blue-300" : "border-gray-300"}`}>
              <span>Work Type: <span className="font-semibold">{selectedWorkType}</span></span>
              <ChevronDown className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${workTypeOpen ? "rotate-180" : ""}`} />
            </div>
            {workTypeOpen && (
              <div onMouseDown={(e) => e.stopPropagation()} className="absolute left-0 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-xl z-50">
                {workTypes.map((type) => (
                  <div key={type} onClick={() => { setSelectedWorkType(type); setWorkTypeOpen(false); }} className={`px-4 py-3 cursor-pointer text-sm ${selectedWorkType === type ? "text-blue-600 font-semibold bg-blue-50 flex justify-between" : "text-gray-700 hover:bg-gray-100"}`}>
                    <span>{type}</span>
                    {selectedWorkType === type && <span className="text-blue-600">✔</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedFreq === "Daily" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Repeats daily after completion.</p>
          </div>
        )}

        {selectedFreq === "Weekly" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
              <span>Repeat on:</span>
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
            <div className="flex gap-4 mb-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={monthMode === "date"} onChange={() => setMonthMode("date")} className="text-blue-600 focus:ring-blue-500" />
                <span>By Date</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={monthMode === "weekday"} onChange={() => setMonthMode("weekday")} className="text-blue-600 focus:ring-blue-500" />
                <span>By Weekday</span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
              <span>Repeat on the</span>

              {monthMode === "date" ? (
                <div className="flex items-center gap-1">
                  <select value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 bg-white text-sm">
                    {monthDaysList.map((d) => (
                      <option key={d} value={d}>{d}{[1, 21, 31].includes(d) ? "st" : [2, 22].includes(d) ? "nd" : [3, 23].includes(d) ? "rd" : "th"}</option>
                    ))}
                  </select>
                  <span>day of month</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <select value={weekOfMonth} onChange={(e) => setWeekOfMonth(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 bg-white text-sm">
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                    <option value={5}>Last</option>
                  </select>
                  <select value={weekdayOfMonth} onChange={(e) => setWeekdayOfMonth(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 bg-white text-sm">
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
              <input type="number" value={yearInterval} onChange={(e) => setYearInterval(Number(e.target.value))} className="w-12 border-b border-gray-400 text-center outline-none focus:border-blue-500 bg-transparent" />
              <span>year(s)</span>
            </div>
            <p className="text-xs text-gray-500">
              Will repeat on {getYearlyDateLabel()} every {yearInterval} year(s).
            </p>
          </div>
        )}
      </div>
    </>
  );
}