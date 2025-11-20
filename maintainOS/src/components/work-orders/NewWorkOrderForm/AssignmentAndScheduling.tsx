import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Calendar } from "lucide-react";
import { fetchFilterData } from "../../utils/filterDataFetcher";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  dueDate: string;
  setDueDate: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  selectedWorkType: string;
  setSelectedWorkType: (value: string) => void;
  onOpenInviteModal: () => void;
  recurrence: string;
  setRecurrence: (value: string) => void;
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
  recurrence,
  setRecurrence,
}: Props) {
  const [assignedOpen, setAssignedOpen] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const workTypes = ["Reactive", "Preventive", "Other"];

  const [showDueCalendar, setShowDueCalendar] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const dueRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);

  // Days of week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // WEEKLY + DAILY shared state
  const [interval, setInterval] = useState(1);
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>(daysOfWeek);

  // MONTHLY STATES
  const [monthInterval, setMonthInterval] = useState(1);
  const [monthDay, setMonthDay] = useState("1st");

  const monthDaysList = [
    "1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th",
    "11th","12th","13th","14th","15th","16th","17th","18th","19th","20th",
    "21st","22nd","23rd","24th","25th","26th","27th","28th","29th","30th","31st",
  ];

  // YEARLY STATE
  const [yearInterval, setYearInterval] = useState(1);

  // Close dropdowns / calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dueRef.current && !dueRef.current.contains(event.target as Node)) {
        setShowDueCalendar(false);
      }
      if (startRef.current && !startRef.current.contains(event.target as Node)) {
        setShowStartCalendar(false);
      }
      setRecurrenceOpen(false);
      setWorkTypeOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await fetchFilterData("users");
      const normalized =
        Array.isArray(data) && data.length
          ? data.map((u: any) => ({
              id: u.id,
              name: u.fullName || u.name || "Unnamed User",
            }))
          : [];
      setUsers(normalized);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assignedOpen && users.length === 0) fetchUsers();
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

  // Shared handler for day clicks (Daily & Weekly)
  const handleDayClick = (day: string) => {
    setSelectedWeekDays((prev) => {
      let next: string[];
      if (prev.includes(day)) {
        next = prev.filter((d) => d !== day);
      } else {
        next = [...prev, day];
      }

      // If user is on Daily and unselects any day -> switch to Weekly
      if (recurrence === "Daily" && next.length < daysOfWeek.length) {
        setRecurrence("Weekly");
      }

      return next;
    });
  };

  // Yearly text based on startDate
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
          <div
            onClick={() => setAssignedOpen(!assignedOpen)}
            className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-2 min-h-[44px] cursor-pointer"
          >
            {selectedUsers.map((id) => (
              <span
                key={id}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-800 text-sm pl-1 pr-2 py-1 rounded-sm"
              >
                <div className="w-6 h-6 rounded-full bg-blue-300 text-white flex items-center justify-center text-xs font-semibold">
                  {getUserName(id).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{getUserName(id)}</span>
                <X
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUser(id);
                  }}
                />
              </span>
            ))}
            <input
              value={assignedSearch}
              onChange={(e) => setAssignedSearch(e.target.value)}
              placeholder={
                selectedUsers.length === 0 ? "Type name or email address" : ""
              }
              className="flex-1 border-0 outline-none text-sm py-1 px-1"
            />
            <ChevronDown
              className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${
                assignedOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {assignedOpen && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div
                onClick={() => {
                  onOpenInviteModal();
                  setAssignedOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 text-blue-600 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Invite New Member
              </div>

              <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">
                Users
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: "200px", scrollbarWidth: "thin" }}
              >
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                        selectedUsers.includes(u.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                        {(u.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-900">
                        {u.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">
          Estimated Time
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Hours
            </label>
            <input
              type="number"
              defaultValue={1}
              className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Minutes
            </label>
            <input
              type="number"
              defaultValue={0}
              className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Due Date */}
      <div className="mt-4" ref={dueRef}>
        <h3 className="mb-4 text-base font-medium text-gray-900">Due Date</h3>
        <div className="grid grid-cols-2 gap-4 relative">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              readOnly
              value={dueDate}
              onClick={() => setShowDueCalendar(!showDueCalendar)}
              placeholder="mm/dd/yyyy"
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 text-sm placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Calendar
              onClick={() => setShowDueCalendar(!showDueCalendar)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#3b82f6",
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
            />
            {showDueCalendar && (
              <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                <DayPicker
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = date.toLocaleDateString("en-US");
                      setDueDate(formatted);
                      setShowDueCalendar(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start Date */}
      <div className="mt-4" ref={startRef}>
        <h3 className="mb-4 text-base font-medium text-gray-900">Start Date</h3>
        <div className="grid grid-cols-2 gap-4 relative">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              readOnly
              value={startDate}
              onClick={() => setShowStartCalendar(!showStartCalendar)}
              placeholder="mm/dd/yyyy"
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 text-sm placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Calendar
              onClick={() => setShowStartCalendar(!showStartCalendar)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#3b82f6",
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
            />
            {showStartCalendar && (
              <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                <DayPicker
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = date.toLocaleDateString("en-US");
                      setStartDate(formatted);
                      setShowStartCalendar(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECURRENCE */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Recurrence</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Recurrence dropdown */}
          <div className="relative">
            <div
              onClick={() => {
                setRecurrenceOpen(!recurrenceOpen);
                setWorkTypeOpen(false);
              }}
              className={`flex items-center justify-between w-full h-12 px-4 
                border rounded-md bg-white cursor-pointer text-gray-900
                ${
                  recurrenceOpen
                    ? "border-yellow-400 ring-2 ring-yellow-300"
                    : "border-gray-300"
                }`}
            >
              <span>{recurrence}</span>
              <ChevronDown
                className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${
                  recurrenceOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {recurrenceOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute left-0 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-xl z-40"
              >
                {["Does not repeat", "Daily", "Weekly", "Monthly", "Yearly"].map(
                  (r) => (
                    <div
                      key={r}
                      onClick={() => {
                        if (r === "Daily") {
                          // Daily = all days selected
                          setSelectedWeekDays(daysOfWeek);
                        }
                        setRecurrence(r);
                        setRecurrenceOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer text-sm ${
                        recurrence === r
                          ? "text-blue-600 font-semibold bg-blue-50 flex justify-between"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{r}</span>
                      {recurrence === r && (
                        <span className="text-blue-600">✔</span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Work Type dropdown */}
          <div className="relative">
            <div
              onClick={() => {
                setWorkTypeOpen(!workTypeOpen);
                setRecurrenceOpen(false);
              }}
              className={`flex items-center justify-between w-full h-12 px-4 
                border rounded-md bg-white cursor-pointer text-gray-900
                ${
                  workTypeOpen
                    ? "border-blue-400 ring-2 ring-blue-300"
                    : "border-gray-300"
                }`}
            >
              <span>
                Work Type:{" "}
                <span className="font-semibold">{selectedWorkType}</span>
              </span>
              <ChevronDown
                className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${
                  workTypeOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {workTypeOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute left-0 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-xl z-50"
              >
                {workTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setSelectedWorkType(type);
                      setWorkTypeOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer text-sm ${
                      selectedWorkType === type
                        ? "text-blue-600 font-semibold bg-blue-50 flex justify-between"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{type}</span>
                    {selectedWorkType === type && (
                      <span className="text-blue-600">✔</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DAILY UI */}
        {recurrence === "Daily" && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    selectedWeekDays.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-blue-200 text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Repeats every day after completion of this Work Order.
            </p>
          </div>
        )}

        {/* WEEKLY UI */}
        {recurrence === "Weekly" && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
              <span>Every</span>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-12 border-b border-gray-400 text-center outline-none focus:border-blue-500"
              />
              <span>week on</span>
            </div>

            <div className="flex gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    selectedWeekDays.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-blue-200 text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Repeats every {interval} week{interval > 1 ? "s" : ""} on{" "}
              {selectedWeekDays.join(", ")} after completion of this Work Order.
            </p>
          </div>
        )}

        {/* MONTHLY UI */}
        {recurrence === "Monthly" && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
              <span>Every</span>

              <select
                value={monthInterval}
                onChange={(e) => setMonthInterval(Number(e.target.value))}
                className="border-b border-gray-400 outline-none focus:border-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <span>month on the</span>

              <select
                value={monthDay}
                onChange={(e) => setMonthDay(e.target.value)}
                className="border-b border-gray-400 outline-none focus:border-blue-500 bg-white"
              >
                {monthDaysList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Repeats every month on the {monthDay} day of the month after
              completion of this Work Order.
            </p>
          </div>
        )}

        {/* YEARLY UI */}
        {recurrence === "Yearly" && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
              <span>Every</span>
              <select
                value={yearInterval}
                onChange={(e) => setYearInterval(Number(e.target.value))}
                className="border-b border-gray-400 outline-none focus:border-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>year</span>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Repeats every {yearInterval} year
              {yearInterval > 1 ? "s" : ""} on {getYearlyDateLabel()} after
              completion of this Work Order.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
