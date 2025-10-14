import { Card, CardContent } from "../ui/card";
import { Badge, Table } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Link } from "react-router-dom";
import React from "react";
import { renderInitials } from "../utils/renderInitials";

const UserTable = ({ RowMenu, rows }) => {
  if (!rows.length) {
    return (
      <div className="text-center text-muted-foreground py-6">
        No users found
      </div>
    );
  }

  return (
    <>
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
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {/* <AvatarImage src={u.avatarUrl || undefined} /> */}
                        <AvatarFallback>
                          {u.fullName ? renderInitials(u.fullName) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        to={`/users/profile/${encodeURIComponent(
                          u.id || "unknown"
                        )}`}
                        className="font-medium hover:underline cursor-pointer"
                      >
                        {u.fullName || "Unknown"}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{u.role || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(u.teams || []).map((t) => (
                        <Badge key={t}>
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.lastVisit || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowMenu
                      kind="user"
                      onAction={(a) => console.log(a, u.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default UserTable;
