import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Plus,
  Search,
  LayoutGrid,
  Rows3,
  Users as UsersIcon,
  User,
  Users,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { SAMPLE_TEAMS, SAMPLE_USERS, type RowMenuProps, type TeamRow, type UserRow, type ViewMode } from "./types.users";
import { UserHeaderComponent } from "./UserHeader";
import { renderInitials } from "../utils/renderInitials";
import { cn } from "../ui/utils";
import { useNavigate } from "react-router-dom";



export function TeamUsers() {
  const [viewMode, setViewMode] = useState<ViewMode>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SAMPLE_USERS;
    return SAMPLE_USERS.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.teams.some((t) => t.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {UserHeaderComponent(viewMode, setViewMode, searchQuery, setSearchQuery, setIsCreatingUser, setShowSettings)}

      <div className="flex border-b">
      <div className=" flex w-half">
          <Button
            onClick={() => setViewMode("users")}
            className={cn(
              "w-half mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
              viewMode === "users" && "text-orange-600 border-orange-600"
            )}
          >
            <User /> Users
          </Button>
          <Button
            onClick={() => setViewMode("teams")}
            className={cn(
              "w-half mb-2 mt-2 rounded-none bg-white text-black border-b-4 border-transparent",
              viewMode === "teams" && "text-orange-600 border-orange-600"
            )}
          >
            <Users /> Teams
          </Button>
      </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {viewMode === "users" ? (
          <UsersTable rows={filteredUsers} />
        ) : (
          <TeamsTable rows={SAMPLE_TEAMS} />
        )}
      </div>

      {/* Example “create user” placeholder */}
      {isCreatingUser && (
        <div className="mt-4 rounded-lg border p-4">
          <div className="text-sm mb-2 font-medium">Create New User</div>
          <div className="text-sm text-muted-foreground">Hook your modal or drawer here.</div>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setIsCreatingUser(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ Users: Table ------------------------------------ */

function UsersTable({ rows }: { rows: UserRow[] }) {
  return (
    <Card>
      <CardContent className="p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead className="text-right">Last Visit</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id} className="p-1">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatarUrl} />
                        <AvatarFallback>
                          {renderInitials(u.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    <div>
                      <Link
                        to={`/users/profile/${encodeURIComponent(u.fullName)}`}
                        className="font-medium hover:underline cursor-pointer"
                      >
                        {u.fullName}
                      </Link>
                      {/* <div className="font-medium">{u.fullName}</div> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-middle">{u.role}</TableCell>
                <TableCell className="align-middle">
                  <div className="flex flex-wrap gap-2">
                    {u.teams.map((t) => (
                      <Badge key={t} variant="secondary" className="whitespace-nowrap">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right align-middle">{u.lastVisit}</TableCell>
                <TableCell className="w-0 text-right">
                  <RowMenu kind="user" onAction={(a) => console.log(a, u.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}



/* -------------------------------------- Teams list -------------------------------------- */

function TeamsTable({ rows }: { rows: TeamRow[] }) {
  return (
    <Card>
      <CardContent className="p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead>Administrator</TableHead>
              <TableHead>Members</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id} className="p-1">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{renderInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        to={`/users/teams/${encodeURIComponent(u.name)}`}
                        className="font-medium hover:underline cursor-pointer"
                      >
                        {u.name}
                      </Link>
                      {/* <div className="font-medium">{u.name}</div> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={u.admin.avatarUrl} />
                      <AvatarFallback>{renderInitials(u.admin.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        to={`/users/profile/${encodeURIComponent(u.admin.name)}`}
                        className="font-medium hover:underline cursor-pointer"
                      >
                        {u.admin.name}
                      </Link>
                      {/* <div className="font-medium">{u.admin.name}</div> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center align-middle text-sm text-muted-background">{u.membersCount} Member</TableCell>
                <TableCell className="w-0 text-right">
                  <RowMenu kind="team" onAction={(a) => console.log(a, u.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


/* --------------------------------------- Row menu --------------------------------------- */

function RowMenu({ kind, onAction }: RowMenuProps) {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === "send_message") {
      navigate("/messages/new"); // 👈 navigate to your messages page
    }

    if (action === "invite_members" || action === "see_details"
    ) {
      navigate("/users/teams"); // 👈 navigate to your invite members page
    }

    // still call external handler if passed
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {kind === "user" ? (
          <>
            <DropdownMenuItem onClick={() => handleAction("send_message")}>Send Message</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handleAction("leave_org")}>
              Leave Organization
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => handleAction("see_details")}>See Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("invite_members")}>Invite Members</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("send_message")}>Send Message</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handleAction("delete_team")}>
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

