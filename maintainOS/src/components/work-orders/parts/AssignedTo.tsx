import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

export default function AssignedTo({ setPanel }: { setPanel: (p: any) => void }) {
  const [assignedOpen, setAssignedOpen] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const users = [{ id: 1, name: "Sumit" }, { id: 2, name: "Sumit Sahani" }];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(assignedSearch.toLowerCase())
  );

  const toggleUser = (name: string) => {
    setSelectedUsers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-base font-medium text-gray-900">Assigned To</h3>
      <div className="relative">
        {/* Input with chips */}
        <div
          onClick={() => setAssignedOpen(!assignedOpen)}
          className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-2 min-h-[44px] cursor-pointer"
        >
          {selectedUsers.map((name) => (
            <span
              key={name}
              className="flex items-center gap-2 bg-gray-100 border border-blue-300 rounded-sm px-3 py-1 text-sm text-gray-800"
            >
              {name}
              <X
                className="w-4 h-4 text-gray-500 cursor-pointer"
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
          <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
        </div>

        {/* Dropdown */}
        {assignedOpen && (
          <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-50">
            <div
              onClick={() => setPanel("invite")}
              className="px-4 py-2 text-blue-600 cursor-pointer hover:bg-blue-50"
            >
              + Invite New Member
            </div>

            {/* Users heading */}
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">
              Users
            </div>

            {filteredUsers.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.name)}
                  onChange={() => toggleUser(u.name)}
                />
                {u.name}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
