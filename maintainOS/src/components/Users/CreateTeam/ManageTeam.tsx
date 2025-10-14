import { useState, useEffect } from "react";
import { StepBack } from "lucide-react";
import { Button } from "../../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { teamService } from "../../../store/teams";
import Loader from "../../Loader/Loader";

export default function ManageTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<any>(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState("");

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch team data
  const fetchTeam = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await teamService.fetchTeamById(id);
      setTeam(res);
      setDescription(res.description || "");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  // Update description
  const handleUpdateDescription = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const updatedTeam = await teamService.updateTeam(id, { description });
      setTeam(updatedTeam);
      setIsEditingDesc(false);
    } catch (err) {
      console.error("Failed to update description:", err);
      setError("Failed to update description");
    } finally {
      setLoading(false);
    }
  };

  // if (loading && !team) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <StepBack className="h-4 w-4" />
              <h1 className="text-2xl font-semibold">{team?.name}</h1>
            </div>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex-1 border h-screen overflow-y-auto p-6 space-y-6">
              {/* Team info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16  text-white text-xl">
                  <AvatarImage src={team?.avatar || ""} />
                  <AvatarFallback style={{ backgroundColor: team?.color }}>
                    {team?.name?.[0] || "T"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{team?.name}</h2>

                  {/* Description */}
                  <div className="mt-1 relative">
                    {/* Step 1: Hover to show edit button */}
                    <div
                      className="group relative"
                      onMouseEnter={() => setIsEditingDesc(false)}
                    >
                      {!isEditingDesc && (
                        <>
                          {description ? (
                            <p className="text-sm text-muted-foreground">
                              {description}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground text-blue-600">
                              No description yet
                            </p>
                          )}

                          <button
                            type="button"
                            className="absolute top-0 mt-2 right-0 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition"
                            onClick={() => setIsEditingDesc(true)}
                          >
                            Edit the Description
                          </button>
                        </>
                      )}
                    </div>

                    {/* Step 2: Click "Edit" to show textarea */}
                    {isEditingDesc && (
                      <div className="mt-2">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full border rounded-md p-2 text-sm"
                          rows={2}
                        />
                        <div className="flex gap-4 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingDesc(false)}
                            className="text-sm text-blue-600"
                          >
                            Cancel
                          </button>
                          <Button size="sm" onClick={handleUpdateDescription}>
                            Update
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Members */}
              <div>
                <h3 className="font-medium border-b pb-2 mb-3">
                  Members ({team?.members?.length || 0})
                </h3>
                <div className="grid grid-cols-3 mt-2 text-sm font-medium text-muted-foreground mb-2">
                  <span>Full Name</span>
                  <span>Role</span>
                  <span>Last Visit</span>
                </div>
                {team?.members?.map((m: any) => (
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

              {/* Info Card */}
              <div className="flex justify-center my-6">
                <div className="w-full bg-gray-50 border rounded-md p-4 text-center space-y-2">
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
                    Locations ({team?.locations?.length || 0})
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Which locations is the Team responsible for?
                  </p>
                  <button className="text-blue-600 text-sm hover:underline">
                    Assign locations
                  </button>
                </div>
                <div>
                  <h4 className="font-medium">
                    Assets ({team?.assets?.length || 0})
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Which assets is the Team responsible for?
                  </p>
                  <button className="text-blue-600 text-sm hover:underline">
                    Assign assets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
