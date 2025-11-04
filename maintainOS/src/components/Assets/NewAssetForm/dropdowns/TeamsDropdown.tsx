import { ChevronDown, Search } from "lucide-react";
import type { RefObject, Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../Loader/Loader";
import { teamService } from "../../../../store/teams";

// This interface is reusable
interface SelectableItem {
  id: number | string;
  name: string;
}

// Interface matches your parent's props — now accepts objects instead of id arrays
interface TeamsDropdownProps {
  teamOpen: boolean;
  setteamsOpen: (open: boolean) => void;
  teamRef: RefObject<HTMLDivElement | null>;
  selectTeamInCharge: SelectableItem[]; // array of selected objects
  setSelectTeamInCharge: Dispatch<SetStateAction<SelectableItem[]>>;
}

export function TeamsDropdown({
  teamOpen,
  setteamsOpen,
  teamRef,
  selectTeamInCharge,
  setSelectTeamInCharge,
}: TeamsDropdownProps) {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState<SelectableItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep a list of currently selected ids for quick checks
  const currentIds = Array.isArray(selectTeamInCharge)
    ? selectTeamInCharge.map((s) => s.id)
    : [];

  const handleFetchTeams = async () => {
    if (teamData.length > 0) return;
    setLoading(true);
    try {
      const res = await teamService.fetchTeamsName();
      if (Array.isArray(res)) {
        setTeamData(res);
      } else {
        console.error("API did not return an array:", res);
        setTeamData([]);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  // Click-outside logic (uses your props)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(event.target as Node)) {
        setteamsOpen(false);
      }
    };
    if (teamOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [teamOpen, setteamsOpen, teamRef]);

  // useEffect for loading data in "edit" mode (uses cleaned currentIds)
  useEffect(() => {
    if (currentIds.length > 0 && teamData.length === 0) {
      handleFetchTeams();
    }
  }, [currentIds, teamData.length]); // Switched dependency to currentIds

  // Multi-select logic (now works correctly)
  const handleSelectTeam = (team: SelectableItem) => {
    const isSelected = currentIds.includes(team.id);
    let newItems: SelectableItem[] = [];

    if (isSelected) {
      newItems = selectTeamInCharge.filter((t) => t.id !== team.id);
    } else {
      newItems = [...selectTeamInCharge, team];
    }

    setSelectTeamInCharge(newItems);
  };

  // Display logic (uses cleaned currentIds)
  // Render based on objects supplied by parent when available
  const displayValue =
    selectTeamInCharge && selectTeamInCharge.length > 0
      ? selectTeamInCharge.map((t) => t.name).join(", ")
      : "Select...";

  return (
    <div className="relative mt-4" ref={teamRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">Teams</h3>

      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => {
          setteamsOpen(!teamOpen);
          handleFetchTeams();
        }}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600 truncate">{displayValue}</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {teamOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader />
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {teamData.length > 0 ? (
                teamData.map((team) => (
                  <li
                    key={team.id}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                      currentIds.includes(team.id)
                        ? "font-semibold bg-gray-100"
                        : ""
                    }`}
                    onClick={() => handleSelectTeam(team)}
                  >
                    {team.name}
                    {currentIds.includes(team.id) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No teams found</li>
              )}
            </ul>
          )}
          <div
            onClick={() => navigate("/teams/create")}
            className="relative flex items-center px-4 py-2 rounded-b-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
            <span className="ml-3">Create Team</span>
          </div>
        </div>
      )}
    </div>
  );
}
