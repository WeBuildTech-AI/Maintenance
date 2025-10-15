import { ChevronLeft, StepBack, StepForward } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useEffect, useState } from "react";
import { userService } from "../../../store/users"; // Assuming you have an updateUser method here
import { renderInitials } from "../../utils/renderInitials";
import Loader from "../../Loader/Loader";
import { teamService } from "../../../store/teams";
import EditUser from "./EditUser";
import toast from "react-hot-toast";

// Assuming your userService has a method like this.
// You'll need to create it if it doesn't exist.
// Example:
// const updateUser = (id, data) => api.put(`/users/${id}`, data);
// userService.updateUser = updateUser;

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
  // ✨ FIX 1: Changed state to hold a single user object, not an array. Initialized to null.
  const [userData, setUserData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);
  const [showAllUpdates, setShowAllUpdates] = useState(true);
  const [showWorkOrderHistory, setShowWorkOrderHistory] = useState(false);

  const { id } = useParams<{ id: string }>();

  // ✨ FIX 2: This state is now the single source of truth for the form.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });

  const fetchUserById = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await userService.fetchUserById(id);
      setUserData(res); // This will trigger the useEffect below
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserById();
    }
  }, [id]);

  // ✨ FIX 3: This useEffect syncs the API data with your form's state.
  // It runs whenever `userData` is successfully fetched.
  useEffect(() => {
    if (userData) {
      // Split fullName into firstName and lastName if they aren't separate fields
      const nameParts = userData.fullName
        ? userData.fullName.split(" ")
        : ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: userData.firstName || firstName, // Prefer specific field if available
        lastName: userData.lastName || lastName, // Otherwise, derive from fullName
        phoneNumber: userData.phoneNumber || "",
        email: userData.email || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResend = () => {
    // Add resend logic here
    console.log("Resending verification to:", formData.email);
  };

  // ✨ FIX 4: Implemented the update logic with an API call.
  const handleUpdate = async () => {
    if (!id) {
      setError("User ID is missing.");
      return;
    }
    setLoading(true);
    setError(null);

    // 1. Create the payload object from your form's state
    const updatePayload = {
      // Combine first and last name into a single fullName field
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    };

    try {
      // 2. Pass the payload to your update service function
      await userService.updateUser(id, updatePayload);

      toast.success("User updated successfully!"); // Or use a toast notification
      fetchUserById(); // Refetch the data to show the latest changes
      setViewMode("RecentActivity"); // Go back to the activity view
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("Failed to update user. Please try again.");
      toast.error("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering anything until we have the user data
  if (loading && !userData) {
    return <Loader />;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!userData) {
    return null; // or a "User not found" message
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="border-border bg-card px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div
                onClick={() => navigate(-1)}
                className="flex items-center gap-4 cursor-pointer select-none"
              >
                <StepBack className="h-4 w-4" />
                <h1 className="text-2xl font-semibold">Manage Users</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-full p-6 gap-2 ">
          <div className="flex-col w-half ">
            {/* User Details  */}
            <div className="flex-col border border-border p-3 mb-3">
              {/* Avatar & name */}
              <div className="flex items-center justify-start">
                <Avatar className="size-40 p-4 bg-gray-100 rounded-full">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>
                    {renderInitials(userData.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 p-6">
                  <div className="text-lg font-medium">{userData.fullName}</div>
                  <div className="text-sm capitalize text-muted-foreground">
                    {userData.role || "No Role Assigned"}
                  </div>
                </div>
              </div>

              <div className="px-6 py-1 flex justify-between">
                <div className="text-sm">Email</div>
                <div className="text-muted-foreground text-sm">
                  {userData.email || "N/A"}
                </div>
              </div>
              <div className="px-6 py-1 flex justify-between">
                <div className="text-sm">Phone Number</div>
                <div className="text-muted-foreground text-sm">
                  {userData.phoneNumber || "N/A"}
                </div>
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

            <div className="flex-col pt-6 mt-2 border border p-6 mb-6">
              <div
                onClick={() => navigate("/messages")}
                className="flex justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                Send Message
                <StepForward className="h-4 w-4" />
              </div>
              <div
                onClick={() => setViewMode("EditAccount")}
                className="flex justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                Edit Account
                <StepForward className="h-4 w-4" />
              </div>
              <div
                onClick={() => setViewMode("EditRolesAndPermissions")}
                className="flex justify-between px-4 py-2 text-sm border-b hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                Edit Roles/Permissions
                <StepForward className="h-4 w-4" />
              </div>
              <div
                onClick={() => setViewMode("LeaveOrganization")}
                className="flex text-destructive justify-between px-4 py-2 text-sm border-b hover:text-red-600 hover:bg-red-50 cursor-pointer"
              >
                Leave Organization
                <StepForward className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="w-half ">
            {viewMode === "EditAccount" && (
              <>
                <EditUser
                  formData={formData}
                  setViewMode={setViewMode}
                  handleInputChange={handleInputChange}
                  handleResend={handleResend}
                  handleUpdate={handleUpdate}
                  loading={loading}
                />
              </>
            )}

            {viewMode === "EditRolesAndPermissions" && (
              <div>Edit Roles and Permissions</div>
            )}
            {viewMode === "RecentActivity" && (
              <>
                <div className="flex-col border p-4 bg-white  mb-3">
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

                      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                        <div className="text-yellow-300 mb-4">
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
                          <span className="font-medium">
                            {userData.fullName}
                          </span>{" "}
                          will show up here.
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-col border border-border p-4 bg-white"></div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageUser;
