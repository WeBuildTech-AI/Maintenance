import { useState } from "react";
import { ChevronDown } from "lucide-react";

type User = {
  id: string | number;
  name: string;
};

export function UserSelect({ users, currentUser }: { users: User[]; currentUser: User }) {
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full border border-border rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50"
      >
        <span>{selectedUser?.name || "Select a user"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
