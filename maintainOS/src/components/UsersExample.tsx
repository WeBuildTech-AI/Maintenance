import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearError,
} from "../store/api/usersSlice";

const UsersExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    // Fetch users when component mounts
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleCreateUser = async () => {
    try {
      await dispatch(
        createUser({
          organizationId: "550e8400-e29b-41d4-a716-446655440000", // Replace with actual org ID
          fullName: "John Doe",
          email: "john@example.com",
          role: "fulluser" as const,
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          hoursPerDay: 8,
        })
      ).unwrap();

      // Success - user was created
      console.log("User created successfully");
    } catch (error) {
      // Error handling
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      await dispatch(
        updateUser({
          id: userId,
          userData: { fullName: "Jane Doe Updated" },
        })
      ).unwrap();

      console.log("User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleRefreshUsers = () => {
    dispatch(fetchUsers());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="space-x-2">
          <button
            onClick={handleRefreshUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Users
          </button>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>Error: {error}</span>
            <button
              onClick={handleClearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phoneNumber && (
                    <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <span className="inline-block px-2 py-1 text-xs bg-blue-200 rounded-full">
                      {user.role}
                    </span>
                    {user.schedulableUser && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-200 rounded-full">
                        Schedulable
                      </span>
                    )}
                  </div>
                  {user.workingDays.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Works: {user.workingDays.join(", ")}
                      {user.hoursPerDay && ` (${user.hoursPerDay}h/day)`}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleUpdateUser(user.id)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersExample;
