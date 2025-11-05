import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { StepBack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { teamService } from "../../../store/teams";
import type { RootState } from "../../../store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const colors = [
  "#3B82F6",
  "#22C55E",
  "#EAB308",
  "#14B8A6",
  "#EC4899",
  "#A855F7",
  "#F97316",
];

export default function CreateTeamForm() {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [teamColor, setTeamColor] = useState(colors[0]);
  const [criticalParts, setCriticalParts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEscalationTeam, setIsEscalationTeam] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamService.createTeam({
        // organizationId: user?.organizationId,
        name: teamName,
        description,
        color: teamColor,
        criticalParts,
        isEscalationTeam,
      });
      navigate(-1);
      toast.success("Team created successfully!");
    } catch (err) {
      console.error("Error creating team:", err);
      toast.error("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ✅ Fixed Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <StepBack className="h-4 w-4" />
          <h1 className="text-2xl font-semibold">Create Team</h1>
        </div>
      </header>

      {/* ✅ Scrollable Middle Section */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      >
        {/* Avatar */}
        <div className="flex justify-center mt-4">
          <div className="relative h-16 w-16 mt-2  rounded-full bg-blue-100 flex items-center justify-center cursor-pointer">
            <span className="text-blue-600 text-xl">📷</span>
          </div>
        </div>

        {/* Team Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Team Name <span className="text-red-500">(Required)</span>
          </label>
          <Input
            placeholder="Enter Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="bg-white border border-orange-600 mt-2 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none bg-white border border-orange-600 mt-2 focus:outline-none"
          />
        </div>

        {/* Team Color Picker */}
        <div>
          <label className="block text-sm font-medium mb-2">Team Color</label>
          <div className="flex gap-3 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`h-6 w-6 rounded-full border-2 transition ${
                  teamColor === c
                    ? "border-black scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setTeamColor(c)}
              />
            ))}
          </div>
        </div>

        {/* Escalation & Critical Parts */}
        <div className="mt-4 border-t pt-4 mb-4">
          <p className="font-medium">Set as Escalation Team</p>
          <p className="text-sm text-gray-600 mt-2">
            Should this team be automatically notified about certain events?
          </p>
          <div className="flex ">
            <div className="flex items-center mt-4">
              <input
                id="criticalParts"
                type="checkbox"
                checked={criticalParts}
                onChange={(e) => setCriticalParts(e.target.checked)}
                className="h-4 w-4 accent-orange-600 cursor-pointer"
              />
              <label
                htmlFor="criticalParts"
                className="ml-2 text-sm font-medium cursor-pointer"
              >
                Critical Parts
              </label>
            </div>
            <div>
              {criticalParts && (
                <p className="text-sm text-gray-600 mt-4 ml-6">
                  ( only when assigned:
                  <span className="mt-1">
                    <input
                      type="checkbox"
                      readOnly
                      className="ml-1 pt-3  mr-1 border-b border-gray-300 text-center"
                    />
                  </span>
                  )
                </p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* ✅ Fixed Footer */}
      <footer className="border-t bg-white px-6 py-4 flex justify-end gap-4 sticky bottom-0 shadow-md">
        <Button
          type="button"
          variant="ghost"
          className="text-blue-600"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-600"
          disabled={!teamName || loading}
          onClick={handleSubmit}
        >
          {loading ? "Creating..." : "Create Team"}
        </Button>
      </footer>
    </div>
  );
}
