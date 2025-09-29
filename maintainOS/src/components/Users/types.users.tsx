export type ViewMode = "users" | "teams";

export type UserRow = {
  id: string;
  fullName: string;
  email?: string;
  role: "Administrator" | "Full User" | string;
  teams: string[];
  lastVisit: string; // e.g. "Today", "2 days ago"
  avatarUrl?: string;
};

export type TeamRow = {
  id: string;
  name: string;
  description?: string;
  admin: { name: string; avatarUrl?: string };
  membersCount: number;
  avatarUrl?: string;
};

export type RowMenuProps = {
  kind: "user" | "team";
  onAction?: (action: string) => void; // keep optional if we want navigation only
};

export const SAMPLE_USERS: UserRow[] = [
  {
    id: "u1",
    fullName: "Ashwini Chauhan",
    email: "ashwini@webuildtech.in",
    role: "Administrator",
    teams: ["Full Team", "One More team"],
    lastVisit: "Today",
  },
  {
    id: "u2",
    fullName: "Rajesh Meena",
    email: "rajesh@webuildtech.in",
    role: "Full User",
    teams: ["One More team"],
    lastVisit: "Yesterday",
  },
];

export const SAMPLE_TEAMS: TeamRow[] = [
  {
    id: "t1",
    name: "Full Team",
    description: "This team is for HVAC Substation 1",
    admin: { name: "Ashwini Chauhan" },
    membersCount: 1,
  },
  {
    id: "t2",
    name: "One More team",
    description: "Meena and Me",
    admin: { name: "Ashwini Chauhan" },
    membersCount: 2,
  },
];