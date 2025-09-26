export interface TeamMemberResponse {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberData {
  teamId: string;
  users: string[];
}

export interface UpdateTeamMemberData {
  role?: string;
}

export interface TeamMembersState {
  teamMembers: TeamMemberResponse[];
  selectedTeamMember: TeamMemberResponse | null;
  loading: boolean;
  error: string | null;
}
