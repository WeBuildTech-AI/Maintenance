import { StepBack } from "lucide-react";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useState } from "react";

export default function ManageTeam() {
  const team = {
    name: "Small World",
    description: "",
    members: [
      {
        id: 1,
        name: "Ashwini Chauhan",
        role: "Team Administrator",
        lastVisit: "Today",
        avatar: "/avatar.png",
      },
    ],
    locations: 0,
    assets: 0,
  };

  const navigate = useNavigate();
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState(team.description);

  const handleUpdate = () => {
    console.log("Updated description:", description);
    setIsEditingDesc(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-4 cursor-pointer select-none"
          >
            <StepBack className="h-4 w-4" />
            <h1 className="text-2xl font-semibold">Manage Team</h1>
          </div>
        </div>
      </header>

      <div className="flex h-full p-6 gap-4 border border-dashed border-border">
        <div className="flex-col ml-3 p-3 w-full">
          {/* Team Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-teal-400 text-white text-xl">
                <AvatarImage src="" />
                <AvatarFallback>SW</AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-xl font-semibold">{team.name}</h2>

                {/* Toggle between view + edit */}
                {isEditingDesc ? (
                  <div className="mt-2 flex-1">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                      rows={1}
                    />
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => setIsEditingDesc(false)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Cancel
                      </button>
                      <Button size="sm" onClick={handleUpdate}>
                        Update
                      </Button>
                    </div>
                  </div>
                ) : description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : (
                  <button
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    Add a description
                  </button>
                )}
              </div>
            </div>

            <button className="text-muted-foreground">⋮</button>
          </div>

          {/* Members */}
          <div className="mt-6">
            <h3 className="font-medium border-b pb-2 mb-3">
              Member ({team.members.length})
            </h3>
            <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground mb-2">
              <span>Full Name</span>
              <span>Role</span>
              <span>Last Visit</span>
            </div>
            {team.members.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-3 items-center text-sm py-2 border-b last:border-none"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback>{m.name[0]}</AvatarFallback>
                  </Avatar>
                  {m.name}
                </div>
                <div>{m.role}</div>
                <div>{m.lastVisit}</div>
              </div>
            ))}
          </div>

          {/* Info card */}
          <div className="flex w-full justify-center my-6 mt-8 mb-8">
            <div className="w-half bg-gray-50 border rounded-md p-4 text-center space-y-2">
              <p className="text-blue-600 font-medium">One person Team</p>
              <p className="text-sm text-muted-foreground">
                Invite people to join the Team and organize your workflows.
              </p>
              <Button>Add Members</Button>
            </div>
          </div>

          {/* Locations & Assets */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium">
                Locations ({team.locations})
              </h4>
              <p className="text-sm text-muted-foreground">
                Which locations is the Team responsible for?
              </p>
              <button className="text-blue-600 text-sm hover:underline">
                Assign locations to the Team
              </button>
            </div>
            <div>
              <h4 className="font-medium">
                Assets ({team.assets})
              </h4>
              <p className="text-sm text-muted-foreground">
                Which assets is the Team responsible for?
              </p>
              <button className="text-blue-600 text-sm hover:underline">
                Assign assets to the Team
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
