import { useState, useEffect } from "react";
import { StepBack, X, Search } from "lucide-react"; // X aur Search icons import karein
import { Button } from "../../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { teamService } from "../../../store/teams";
import Loader from "../../Loader/Loader";
import AddMemberModal from "./AddMemberModal";

export default function ManageTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<any>(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState("");
  const [dropdownModalOpen, setDropDownModalOpen] = useState(false);

  // Step 1: Modal ke liye states add karein
  const [isAddMemberModelOpen, setIsAddMemberModelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Step 2: Modal ko open aur close karne ke liye functions banayein
  const handleOpenModal = () => setIsAddMemberModelOpen(true);
  const handleCloseModal = () => {
    setIsAddMemberModelOpen(false);
    setSearchQuery(""); // Modal band hone par search query reset karein
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
            {/* Team info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 text-white text-xl">
                <AvatarImage src={team?.avatar || ""} />
                <AvatarFallback style={{ backgroundColor: team?.color }}>
                  {team?.name?.[0] || "T"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{team?.name}</h2>

                {/* Description */}
                <div className="mt-1 relative">
                  <div className="group relative">
                    {!isEditingDesc ? (
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
                          className="absolute cursor-pointer top-0 mt-2 right-0 text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => setIsEditingDesc(true)}
                        >
                          Edit the Description
                        </button>
                      </>
                    ) : (
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
                            className=" cursor-pointer text-sm text-orange-600"
                          >
                            Cancel
                          </button>
                          <Button
                            size="sm"
                            className=" cursor-pointer bg-orange-600 text-black"
                            onClick={handleUpdateDescription}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
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
                <p className="text-orange-600 font-medium">One person Team</p>
                <p className="text-sm text-muted-foreground">
                  Invite people to join the Team and organize your workflows.
                </p>
                {/* Step 3: Button par onClick handler lagayein */}
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

      {isAddMemberModelOpen && (
        <AddMemberModal
          handleCloseModal={handleCloseModal}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

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

            {/* Step 4: Dropdown ka UI banayein */}
            <div className="p-6">
              <div className="relative">
                {/* Input aur selected user tags ke liye container */}
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[48px] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/50">
                  {/* Selected Users ke Tags */}
                  {/* {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="flex items-center gap-2 bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded"
                    >
                      {user.name}
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))} */}

                  {/* Search Input */}
                  {/* <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsDropdownVisible(true)}
                    onBlur={() =>
                      setTimeout(() => setIsDropdownVisible(false), 150)
                    } // Click handle karne ke liye thoda delay
                    placeholder="Search by name..."
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  /> */}
                </div>

                {/* Search Results Dropdown */}
                {/* {isDropdownVisible && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-card border rounded-md shadow-lg z-10 max-h-56 overflow-y-auto">
                    <ul>
                      {searchResults.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="px-4 py-3 cursor-pointer hover:bg-muted/50 text-foreground"
                        >
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )} */}
                {/* {isDropdownVisible &&
                  searchQuery &&
                  searchResults.length === 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-card border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                      No user found.
                    </div>
                  )} */}
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
