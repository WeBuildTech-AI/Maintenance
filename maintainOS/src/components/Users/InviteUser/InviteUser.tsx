import { useState } from "react";


import { ChevronDown, StepBack, X } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";

type InviteUser = {
  fullName: string;
  contact: string;
  accountType: string;
};

export default function InviteUsers() {
  const [users, setUsers] = useState<InviteUser[]>([
    { fullName: "", contact: "", accountType: "Requester Only" },
  ]);

  const addUser = () => {
    setUsers([...users, { fullName: "", contact: "", accountType: "Requester Only" }]);
  };

  const removeUser = (index: number) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
  };

  const updateUser = (index: number, field: keyof InviteUser, value: string) => {
    const updated = [...users];
    updated[index][field] = value;
    setUsers(updated);
  };

  const sendInvites = () => {
    console.log("Invites sent:", users);
  };

  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {/* Clickable header row */}
            <div
              onClick={() => navigate(-1)}
              className="flex items-center gap-4 cursor-pointer select-none"
            >
              <StepBack className="h-4 w-4" /> {/* smaller icon */}
              <h1 className="text-2xl font-semibold">Invite Users</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-col h-full p-6 mt-6 gap-4 border border-dashed border-border">

        <div className="mb-6">
          {users.map((user, i) => (
            <div key={i} className="flex items-center gap-4 mb-4">
            <Input
                placeholder="Full Name"
                value={user.fullName}
                onChange={(e) => updateUser(i, "fullName", e.target.value)}
                className="flex-1"
            />
            <Input
                placeholder="Mobile Phone Number or Email"
                value={user.contact}
                onChange={(e) => updateUser(i, "contact", e.target.value)}
                className="flex-1"
            />
            <div className="relative flex-1">
                <select
                value={user.accountType}
                onChange={(e) => updateUser(i, "accountType", e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white pr-8 appearance-none"
                >
                <option>Requester Only</option>
                <option>Admin</option>
                <option>Manager</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {users.length > 1 && (
                <button
                onClick={() => removeUser(i)}
                className="text-muted-foreground hover:text-red-500"
                >
                <X className="h-4 w-4" />
                </button>
            )}
            </div>
        ))}
        </div>
        

        <Button
            variant="outline"
            onClick={addUser}
            className="mb-6 text-blue-600 border-blue-600 hover:bg-blue-50"
        >
            + Add another
        </Button>

        <Button
            disabled={users.every((u) => !u.fullName && !u.contact)}
            onClick={sendInvites}
            className="w-full p-6 mb-4 mt-6"
        >
            Send Invites
        </Button>

        <p className="mt-6 text-sm text-blue-600 cursor-pointer hover:underline text-center">
            Get an invite link to share
        </p>
      </div>

      
    </div>
  );
}
