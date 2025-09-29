import { StepBack, StepForward } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useState } from "react";

const teams = [
  "Full Team",
  "One More Team"
]

const viewModes =[
  "EditAccount",
  "EditRolesAndPermissions",
  "RecentActivity",
  "WorkOrdersHistory",
  "LeaveOrganization"
]

function ManageUser() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<string>("RecentActivity");
  return (
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

      <div className="flex h-full p-6 gap-4 border border-dashed border-border">
        <div className="flex-col ml-3 p-3 w-half ">
          
          {/* User Details  */}
          <div className="flex-col border border-border p-3 mb-3">
              {/* Avatar & name */}
              <div className="flex items-center justify-start">
                <Avatar className="size-40 p-4 bg-gray-100 rounded-full">
                        <AvatarImage src="/avatar.png" />
                        <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="ml-4 p-6">
                  <div className="text-lg font-medium">Ashwini Chauhan</div>
                  <div className="text-sm text-muted-foreground"> Administrator</div>

                  {/* Teams Component */}
                  <div className="mt-2 flex gap-4">
                    {teams.map((team, i) => (
                      <div
                        key={i}
                        className="px-2 py-2 border border-border bg-card text-xs"
                      >
                        {team}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-1 flex justify-between">
                <div className="text-sm">Email</div>
                <div className="text-muted-foreground text-sm">ashwini.11.chauhan@gmail.com</div>
              </div>
              <div className="px-6 py-1 flex justify-between">
                <div className="text-sm">Phone Number</div>
                <div className="text-muted-foreground text-sm">+91 84478 04765</div>
              </div>
              <div className="px-6 py-1 flex justify-between">
                <div className="text-sm">Last Visit</div>
                <div className="text-muted-foreground text-sm">Today</div>
              </div>
              <div className="px-6 py-1 flex justify-between">
                <div className="text-sm">Authentication Type</div>
                <div className="text-muted-foreground text-sm">Verification code</div>
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
          <div className="flex-colborder border-border p-6 mb-3">
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
        </div>

        <div className="mr-3 p-3 w-half">
          {/* View Mode Component */}
          {viewMode=== "EditAccount" && (
            <div>Edit Account</div>
          )}
        </div>
      </div>



    </div>
  )
}

export default ManageUser