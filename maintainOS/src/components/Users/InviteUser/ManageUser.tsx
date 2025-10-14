import { StepBack, StepForward } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useEffect, useRef, useState } from "react";
import { userService } from "../../../store/users";
import { renderInitials } from "../../utils/renderInitials";
import Loader from "../../Loader/Loader";

const teams = ["Full Team", "One More Team"];

const viewModes = [
  "EditAccount",
  "EditRolesAndPermissions",
  "RecentActivity",
  "WorkOrdersHistory",
  "LeaveOrganization",
];

function ManageUser() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<string>("RecentActivity");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const [showComments, setShowComments] = useState(true);
  const [showAllUpdates, setShowAllUpdates] = useState(true);
  const [showWorkOrderHistory, setShowWorkOrderHistory] = useState(false);

  const { id } = useParams<{ id: string }>(); // 👈 id comes from your route
  console.log("User ID from URL:", id);

  const fetchUsersById = async () => {
    if (!id) return; // extra safety
    setLoading(true);
    try {
      const res = await userService.fetchUserById(id);
      setUserData(res);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return; // wait until id is available
    fetchUsersById();
  }, [id]);

  console.log(userData, "userData");

  return (
    <>
      {loading ? (
        <Loader  />
      ) : (
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
                  <h1 className="text-2xl font-semibold">Manage Users</h1>
                </div>
              </div>
            </div>
          </header>

          <div className="flex h-full p-6 gap-2 ">
            <div className="flex-col ml-2 w-half ">
              {/* User Details  */}
              <div className="flex-col border border-border p-3 mb-3">
                {/* Avatar & name */}
                <div className="flex items-center justify-start">
                  <Avatar className="size-40 p-4 bg-gray-100 rounded-full">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback>
                      {/* {renderInitials(userData.fullName)} */}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 p-6">
                    <div className="text-lg font-medium">
                      {userData.fullName}
                    </div>
                    <div className="text-sm  capitalize text-muted-foreground">
                      {" "}
                      {userData.role || "No Role Assigned"}
                    </div>

                    {/* Teams Component */}
                    {/* <div className="mt-2 flex gap-4">
                  {teams.map((team, i) => (
                    <div
                      key={i}
                      className="px-2 py-2 border border-border bg-card text-xs"
                    >
                      {team}
                    </div>
                  ))}
                </div> */}
                  </div>
                </div>

                <div className="px-6 py-1 flex justify-between">
                  <div className="text-sm">Email</div>
                  {userData.email && (
                    <div className="text-muted-foreground text-sm">
                      {userData.email === null ? "N/A" : userData.email}
                    </div>
                  )}
                </div>
                <div className="px-6 py-1 flex justify-between">
                  <div className="text-sm">Phone Number</div>
                  {userData.phoneNumber && (
                    <div className="text-muted-foreground text-sm">
                      {userData.phoneNumber}
                    </div>
                  )}
                </div>
                <div className="px-6 py-1 flex justify-between">
                  <div className="text-sm">Last Visit</div>
                  <div className="text-muted-foreground text-sm">Today</div>
                </div>
                <div className="px-6 py-1 flex justify-between">
                  <div className="text-sm">Authentication Type</div>
                  <div className="text-muted-foreground text-sm">
                    Verification code
                  </div>
                </div>
                <div className="px-6 py-1 flex justify-between">
                  <div className="text-sm">Work Orders Assigned</div>
                  <div className="text-muted-foreground text-sm">8</div>
                </div>
                <div className="px-6 py-1 flex justify-between">
                  <div className="text-sm">% Completed</div>
                  <div className="text-muted-foreground text-sm">75%</div>
                </div>
              </div>

              <div className="flex-colborder border p-6 mb-3">
                <div
                  onClick={() => navigate("/messages")}
                  className="flex justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer hover:bg-blue-100"
                >
                  Send Message
                  <StepForward className="h-4 w-4" />
                </div>
                <div
                  onClick={() => setViewMode("EditAccount")}
                  className="flex justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer hover:bg-blue-100"
                >
                  Edit Account
                  <StepForward className="h-4 w-4" />
                </div>
                <div
                  onClick={() => setViewMode("EditRolesAndPermissions")}
                  className="flex justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer hover:bg-blue-100"
                >
                  Edit Roles/Permissions
                  <StepForward className="h-4 w-4" />
                </div>
                <div
                  onClick={() => setViewMode("LeaveOrganization")}
                  className="flex text-destructive justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer hover:bg-blue-100"
                >
                  Leave Organization
                  <StepForward className="h-4 w-4" />
                </div>
              </div>

              {/* <div className="mr-3 p-3 w-half">
            {viewMode === "EditAccount" && <div>Edit Account</div>}
          </div> */}
            </div>
            <div className="w-half">
              <div className="flex-col border p-4 bg-white  mb-3">
                {/* Tabs */}
                <div className="flex items-center justify-center  gap-6 border-gray-200 mb-4">
                  <button
                    onClick={() => setShowWorkOrderHistory(false)}
                    className={`px-4 py-2 font-medium cursor-pointer ${
                      !showWorkOrderHistory
                        ? "border-orange-500 text-orange-500 border-b"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    Recent Activity
                  </button>

                  <button
                    onClick={() => setShowWorkOrderHistory(true)}
                    className={`px-4 py-2 font-medium cursor-pointer ${
                      showWorkOrderHistory
                        ? "border-orange-500 text-orange-500 border-b"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    Work Order History
                  </button>
                </div>

                {showWorkOrderHistory === true ? (
                  <>
                    <div>
                      <div className="flex items-center gap-6 mb-6">
                        No work order history to show
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Toggles */}
                    <div className="flex items-center gap-6 mb-6">
                      <h1>Recent Activity</h1>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showComments}
                          onChange={() => setShowComments(!showComments)}
                          className="toggle-checkbox"
                        />
                        <span>Show Comments</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showAllUpdates}
                          onChange={() => setShowAllUpdates(!showAllUpdates)}
                          className="toggle-checkbox"
                        />
                        <span>Show All Updates</span>
                      </label>
                    </div>

                    {/* Empty state */}
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                      <div className="text-yellow-300 mb-4">
                        {/* ⚡ icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      <p className="text-sm">
                        Actions performed by{" "}
                        <span className="font-medium">{userData.fullName}</span>{" "}
                        will show up here.
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex-col border border-border p-4 bg-white"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageUser;
