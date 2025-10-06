import { useState } from "react";
import { ChevronDown, X, Calendar } from "lucide-react";

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
}: Props) {
  // ... full code from previous answer
  const [assignedOpen, setAssignedOpen] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [workTypeOpen, setWorkTypeOpen] = useState(false);

  const users = [{ id: 1, name: "Sumit" }, { id: 2, name: "Sumit Sahani" }];
  const workTypes = ["Reactive", "Preventive", "Other"];
  
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(assignedSearch.toLowerCase()));

  const toggleUser = (name: string) => {
    setSelectedUsers((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  return (
    <>
      {/* Assigned To Section */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Assigned To</h3>
        <div className="relative">
          <div
            onClick={() => setAssignedOpen(!assignedOpen)}
            className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-2 min-h-[44px] cursor-pointer"
          >
            {selectedUsers.map((name) => (
              <span key={name} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-800 text-sm pl-1 pr-2 py-1 rounded-sm">
                <div className="w-6 h-6 rounded-full bg-blue-300 text-white flex items-center justify-center text-xs font-semibold">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{name}</span>
                <X
                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUser(name);
                  }}
                />
              </span>
            ))}
            <input
              value={assignedSearch}
              onChange={(e) => setAssignedSearch(e.target.value)}
              placeholder={selectedUsers.length === 0 ? "Type name or email address" : ""}
              className="flex-1 border-0 outline-none text-sm py-1 px-1"
            />
            <ChevronDown className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${assignedOpen ? "rotate-180" : ""}`} />
          </div>
          {assignedOpen && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50" style={{ overflow: "visible" }}>
              <div onClick={() => { onOpenInviteModal(); setAssignedOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-blue-600 font-medium text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite New Member
              </div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">Users</div>
              <div className="max-h-56 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <label key={u.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${selectedUsers.includes(u.name) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-900">{u.name}</span>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.name)}
                      onChange={() => toggleUser(u.name)}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Estimated Time section */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Estimated Time</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Hours</label>
            <input type="number" defaultValue={1} className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Minutes</label>
            <input type="number" defaultValue={0} className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Due Date section */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Due Date</h3>
        <div className="grid grid-cols-2 gap-4">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Calendar style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6", width: "20px", height: "20px", pointerEvents: "none" }} />
          </div>
          <div></div>
        </div>
      </div>
      
      {/* Start Date section */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Start Date</h3>
        <div className="grid grid-cols-2 gap-4">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Calendar style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6", width: "20px", height: "20px", pointerEvents: "none" }} />
          </div>
          <div></div>
        </div>
      </div>
      
      {/* Recurrence */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Recurrence</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <select className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-md text-gray-900 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
              <option>Does not repeat</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="relative">
            <div onClick={() => setWorkTypeOpen(!workTypeOpen)} className="flex items-center justify-between cursor-pointer text-gray-900 h-12">
              <span>
                Work Type: <span className="font-semibold">{selectedWorkType}</span>
              </span>
              <ChevronDown className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${workTypeOpen ? "rotate-180" : ""}`} />
            </div>
            {workTypeOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
                {workTypes.map((type) => (
                  <div key={type} onClick={() => { setSelectedWorkType(type); setWorkTypeOpen(false); }} className={`px-4 py-2 cursor-pointer text-sm ${selectedWorkType === type ? "text-blue-600 font-semibold bg-blue-50 flex justify-between" : "text-gray-700 hover:bg-gray-100"}`}>
                    <span>{type}</span>
                    {selectedWorkType === type && <span className="text-blue-600">✔</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}