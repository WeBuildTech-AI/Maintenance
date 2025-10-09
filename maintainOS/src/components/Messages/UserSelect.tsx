import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import { clearSearchResults, searchUsers } from "../../store/messages";
import type { User } from "../../store/messages";

type UserSelectProps = {
  // This component will now call a function when a user is selected
  onUserSelect: (user: User) => void;
};

export function UserSelect({ onUserSelect }: UserSelectProps) {
  const dispatch = useDispatch();

  const { searchResults, searchStatus } = useSelector(
    (state: RootState) => state.messaging
  );

  // get current user
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  // When the component mounts, fetch users
  useEffect(() => {
    if (currentUser?.id) {
      console.log(
        "UserSelect mounted - Dispatching searchUsers for currentUserId:",
        currentUser.id
      );
      dispatch(searchUsers(currentUser.id) as any);
    } else {
      console.log(
        "UserSelect mounted - No currentUser.id available:",
        currentUser
      );
    }
  }, [dispatch, currentUser?.id]);

  // Log whenever searchResults or searchStatus changes
  useEffect(() => {
    console.log("UserSelect - Redux state changed:", {
      searchResults,
      searchStatus,
    });
  }, [searchResults, searchStatus]);

  // When the component unmounts, clear the previous search results
  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    onUserSelect(user); // Notify parent component
    setOpen(false);
    console.log("User selected:", user);
    console.log("Current Redux state:", { searchResults, searchStatus });
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full border border-border rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50"
      >
        <span>{selectedUser?.name || "Select a user from the dropdown"}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {searchStatus === "loading" && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </li>
          )}

          {searchStatus === "succeeded" && searchResults.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No users found.
            </li>
          )}

          {searchStatus === "succeeded" &&
            searchResults.map((user: User) => {
              return (
                <li
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="flex items-center cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-orange-600 text-white font-bold text-sm border-2 border-gray-300">
                      {user.name && user.name.trim().length > 0
                        ? user.name.trim().charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  )}
                  <span>{user.name}</span>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
