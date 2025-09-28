import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  MoreHorizontal,
  Plus,
  Search,
  LayoutGrid,
  Rows3,
  Users as UsersIcon,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { SAMPLE_TEAMS, SAMPLE_USERS, type TeamRow, type UserRow, type ViewMode } from "./types.users";
import { UserHeaderComponent } from "./UserHeader";



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

      {/* Body */}
      {viewMode === "users" ? (
        <UsersTable rows={filteredUsers} />
      ) : (
        <TeamsList rows={SAMPLE_TEAMS} />
      )}

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
      <CardContent className="p-0">
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
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{initials(u.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.fullName}</div>
                      {u.email && <div className="text-sm text-muted-foreground">{u.email}</div>}
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

function TeamsList({ rows }: { rows: TeamRow[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-orange-100 text-orange-700 grid place-items-center font-semibold">
                  {initials(t.name)}
                </div>
                <div>
                  <div className="font-medium">{t.name}</div>
                  {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>{initials(t.admin.name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">{t.admin.name}</div>
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <UsersIcon className="size-4" />
                  {t.membersCount} {t.membersCount === 1 ? "Member" : "Members"}
                </div>

                <RowMenu kind="team" onAction={(a) => console.log(a, t.id)} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------------------- Row menu --------------------------------------- */

function RowMenu({
  kind,
  onAction,
}: {
  kind: "user" | "team";
  onAction: (action: string) => void;
}) {
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
            <DropdownMenuItem onClick={() => onAction("send_message")}>Send Message</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("see_account")}>See Account</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onAction("leave_org")}>
              Leave Organization
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => onAction("see_details")}>See Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("invite_members")}>Invite Members</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("send_message")}>Send Message</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onAction("delete_team")}>
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------- helpers -------------------------------------- */

function initials(name?: string) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
