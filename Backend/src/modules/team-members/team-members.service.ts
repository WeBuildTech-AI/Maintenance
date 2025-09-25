import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import {
  AddUsersToTeamDto,
  RemoveUsersFromTeamDto,
} from "./dto/team-member-operations.dto";

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamMemberDto: CreateTeamMemberDto) {
    const { teamId, users } = createTeamMemberDto;

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with id '${teamId}' not found`);
    }

    // Check if users exist
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: users } },
    });

    if (existingUsers.length !== users.length) {
      const foundUserIds = existingUsers.map((user) => user.id);
      const missingUsers = users.filter((id) => !foundUserIds.includes(id));
      throw new BadRequestException(
        `Users not found: ${missingUsers.join(", ")}`
      );
    }

    // Check if team members entry already exists for this team
    const existingTeamMember = await this.prisma.teamMember.findFirst({
      where: { teamId },
    });

    if (existingTeamMember) {
      throw new BadRequestException(
        `Team members already exist for team '${teamId}'. Use update or add users instead.`
      );
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        users,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.teamMember.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!teamMember) {
      throw new NotFoundException(`Team member with id '${id}' not found`);
    }

    return teamMember;
  }

  async findByTeamId(teamId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { teamId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!teamMember) {
      throw new NotFoundException(`No team members found for team '${teamId}'`);
    }

    return teamMember;
  }

  async getUsersInTeam(teamId: string) {
    const teamMember = await this.findByTeamId(teamId);

    // Fetch user details
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: teamMember.users },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    return {
      teamId,
      teamName: teamMember.team.name,
      users,
    };
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto) {
    const teamMember = await this.findOne(id);

    if (updateTeamMemberDto.users) {
      // Validate users exist
      const existingUsers = await this.prisma.user.findMany({
        where: { id: { in: updateTeamMemberDto.users } },
      });

      if (existingUsers.length !== updateTeamMemberDto.users.length) {
        const foundUserIds = existingUsers.map((user) => user.id);
        const missingUsers = updateTeamMemberDto.users.filter(
          (id) => !foundUserIds.includes(id)
        );
        throw new BadRequestException(
          `Users not found: ${missingUsers.join(", ")}`
        );
      }
    }

    return this.prisma.teamMember.update({
      where: { id },
      data: updateTeamMemberDto,
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async addUsersToTeam(teamId: string, addUsersDto: AddUsersToTeamDto) {
    const teamMember = await this.findByTeamId(teamId);

    // Validate users exist
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: addUsersDto.users } },
    });

    if (existingUsers.length !== addUsersDto.users.length) {
      const foundUserIds = existingUsers.map((user) => user.id);
      const missingUsers = addUsersDto.users.filter(
        (id) => !foundUserIds.includes(id)
      );
      throw new BadRequestException(
        `Users not found: ${missingUsers.join(", ")}`
      );
    }

    // Add new users to existing array (avoid duplicates)
    const currentUsers = teamMember.users;
    const newUsers = addUsersDto.users.filter(
      (userId) => !currentUsers.includes(userId)
    );
    const updatedUsers = [...currentUsers, ...newUsers];

    return this.prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { users: updatedUsers },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeUsersFromTeam(
    teamId: string,
    removeUsersDto: RemoveUsersFromTeamDto
  ) {
    const teamMember = await this.findByTeamId(teamId);

    // Remove users from array
    const currentUsers = teamMember.users;
    const updatedUsers = currentUsers.filter(
      (userId) => !removeUsersDto.users.includes(userId)
    );

    return this.prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { users: updatedUsers },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const teamMember = await this.findOne(id);

    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async removeByTeamId(teamId: string) {
    const teamMember = await this.findByTeamId(teamId);

    return this.prisma.teamMember.delete({
      where: { id: teamMember.id },
    });
  }
}
