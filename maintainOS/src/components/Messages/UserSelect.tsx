import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import { clearSearchResults, searchUsers } from "../../store/messages";
import type { User } from "../../store/messages";
import { DynamicSelect } from "../../components/vendors/VendorsForm/DynamicSelect";

type UserSelectProps = {
  // an array of selected User objects
  onUsersSelect: (users: User[]) => void;
};

export function UserSelect({ onUsersSelect }: UserSelectProps) {
  const dispatch = useDispatch();

  const { searchResults, searchStatus } = useSelector(
    (state: RootState) => state.messaging
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(searchUsers(currentUser.id) as any);
    } else {
      console.log(
        "UserSelect mounted - No currentUser.id available:",
        currentUser
      );
    }
  }, [dispatch, currentUser?.id]);

  useEffect(() => {
  }, [searchResults, searchStatus]);

  // unmount 
  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  useEffect(() => {
    const selectedUsers = searchResults.filter((user) =>
      selectedUserIds.includes(user.id)
    );
    onUsersSelect(selectedUsers);
  }, [selectedUserIds, searchResults]); // Removed onUsersSelect from dependencies

  const handleFetchUsers = () => {
    if (currentUser?.id && searchStatus === "idle") {
      console.log("DynamicSelect - Fetching users on dropdown open");
      dispatch(searchUsers(currentUser.id) as any);
    }
  };

  return (
    <div className="relative w-full">
      <DynamicSelect
        // A unique name is required to manage the active dropdown state
        name="user-selector"
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        options={searchResults}
        loading={searchStatus === "loading"}
        onFetch={handleFetchUsers}
        placeholder="Select one or more users"
        value={selectedUserIds}
        onSelect={(selectedIds) => setSelectedUserIds(selectedIds as string[])}
      />
    </div>
  );
}
