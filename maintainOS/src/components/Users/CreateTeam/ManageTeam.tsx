
import { useState, useEffect, useRef } from "react"; // useRef import kiya gaya hai
import { StepBack, X, Search, EllipsisVerticalIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { teamService } from "../../../store/teams";
import Loader from "../../Loader/Loader";
import AddMemberModal from "./AddMemberModal";
import { renderInitials } from "../../utils/renderInitials";

export default function ManageTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<any>(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState("");
  const [dropdownModalOpen, setDropDownModalOpen] = useState(false);
  const [isAddMemberModelOpen, setIsAddMemberModelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown ke liye naya state
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  // Dropdown ke liye Ref
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Dropdown ke naye functions
  const toggleActionsDropdown = () => {
    setIsActionsDropdownOpen((prev) => !prev);
  };

  const handleEditTeam = () => {
    console.log("Edit team clicked");
    // Yahan aap edit page par navigate kar sakte hain ya edit modal open kar sakte hain
    setIsActionsDropdownOpen(false); // Dropdown band karein
  };

  const handleDeleteTeam = () => {
    console.log("Delete team clicked");
    // Yahan delete logic aur confirmation modal add karein
    if (window.confirm("Are you sure you want to delete this team?")) {
      // Yahan delete API call karein
    }
    setIsActionsDropdownOpen(false); // Dropdown band karein
  };

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

  // Dropdown ke bahar click karne par use band karne ke liye useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsActionsDropdownOpen(false);
      }
    };
    // Event listener add karein
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionsDropdownRef]);

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

  const handleOpenModal = () => setIsAddMemberModelOpen(true);
  const handleCloseModal = () => {
    setIsAddMemberModelOpen(false);
    setSearchQuery("");
  };

  const handleOpenDropdownModal = () => {
    setDropDownModalOpen(true);
  };

  const handleCloseDropdownModal = () => {
    setDropDownModalOpen(false);
  };

  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <>
      {loading && !team ? (
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
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

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Team info */}
            <div className="flex items-start justify-between w-full">
              {/* Left Section - Avatar and Description */}
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className="h-16 w-16 flex items-center justify-center rounded-full text-white text-3xl font-semibold"
                    style={{ backgroundColor: team?.color || "#f59e0b" }}
                  >
                    {team?.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {team?.name || "Team Name"}
                  </h2>

                  {/* Description Section */}
                  <div className="mt-1 relative">
                    {!isEditingDesc ? (
                      <>
                        <p
                          className={`text-sm ${
                            description ? "text-gray-700" : "text-blue-600"
                          }`}
                        >
                          {description || "No description yet"}
                        </p>
                        <button
                          type="button"
                          className="text-sm text-blue-600 mt-1 hover:underline"
                          onClick={() => setIsEditingDesc(true)}
                        >
                          Edit Description
                        </button>
                      </>
                    ) : (
                      <div className="mt-2 w-full">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingDesc(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateDescription}
                            className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Three Dots (Updated with dropdown) */}
              <div
                ref={actionsDropdownRef}
                className="relative flex items-start"
              >
                <button
                  onClick={toggleActionsDropdown}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <EllipsisVerticalIcon />
                </button>

                {/* Conditional dropdown (left-aligned) */}
                {isActionsDropdownOpen && (
                  <div className="absolute left-100 mt-8 w-48 bg-white border rounded-md shadow-lg z-50">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={handleEditTeam}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleDeleteTeam}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
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
              <div className="h-64 overflow-x-auto">
                {team?.members?.map((m: any) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-3 items-center text-sm py-2 border-b last:border-none"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.avatar} />
                        <AvatarFallback>
                          {renderInitials(m.user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      {m.user.fullName}
                    </div>
                    <div>{m.role}</div>
                    <div>{m.lastVisit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="flex justify-center my-6">
              <div className="w-full bg-gray-50 border rounded-md p-4 text-center space-y-2">
                <p className="text-orange-600 font-medium">One person Team</p>
                <p className="text-sm text-muted-foreground">
                  Invite people to join the Team and organize your workflows.
                </p>
                <Button
                  className=" cursor-pointer bg-orange-600 text-black"
                  onClick={handleOpenModal}
                >
                  Add Members
                </Button>
              </div>
            </div>

            {/* Locations & Assets */}
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div>
                <h4 className="font-medium">
                  Locations ({team?.locations?.length || 0})
                </h4>
                <p className="text-sm text-muted-foreground">
                  Which locations is the Team responsible for?
                </p>
                <button
                  onClick={handleOpenDropdownModal}
                  className="cursor-pointer text-orange-600 text-sm "
                >
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
                <button className=" cursor-pointer text-orange-600 text-sm">
                  Assign assets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModelOpen && (
        <AddMemberModal
          handleCloseModal={handleCloseModal}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Assign Location Modal */}
      {dropdownModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50"
        >
          <div className="bg-card rounded-lg shadow-md w-130 max-w-lg flex flex-col border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-normal text-foreground">
                Add Members to the Team
              </h2>
              <button
                onClick={handleCloseDropdownModal}
                aria-label="Close add members"
                className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[48px] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/50">
                  {/* Yahan aapka search/dropdown logic aayega */}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseDropdownModal}>
                Cancel
              </Button>
              <Button className="bg-orange-600 text-black">Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
