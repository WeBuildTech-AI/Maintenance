import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: CreateUserDto): Promise<User> {
    const { password, ...rest } = payload;
    const saltOrRounds = 10;

    let hashedPassword: string | undefined = undefined;

    // Hash the user's password if provided
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltOrRounds);
    }

    // Fetch organization defaults
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: payload.organizationId },
      select: {
        defaultWorkOrderVisibility: true,
        defaultHourlyRate: true,
        defaultRateVisibility: true,
        defaultWorkingDays: true,
        defaultHoursPerDay: true,
        defaultSchedulableUser: true,
      },
    });

    // Apply organization defaults for fields that are not explicitly provided
    const userData = {
      ...rest,
      passwordHash: hashedPassword,
      fullUserVisibility:
        rest.fullUserVisibility ?? organization.defaultWorkOrderVisibility,
      hourlyRate: rest.hourlyRate ?? organization.defaultHourlyRate,
      rateVisibility: rest.rateVisibility ?? organization.defaultRateVisibility,
      workingDays: rest.workingDays?.length
        ? rest.workingDays
        : organization.defaultWorkingDays,
      hoursPerDay: rest.hoursPerDay ?? organization.defaultHoursPerDay,
      schedulableUser:
        rest.schedulableUser ?? organization.defaultSchedulableUser,
    };

    return this.prisma.user.create({
      data: userData,
    });
  }

  async updateUser(id: string, payload: UpdateUserDto): Promise<User> {
    const { password, ...rest } = payload;
    const data: Prisma.UserUpdateInput = {
      ...rest,
    };

    if (password) {
      data.passwordHash = password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async removeUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findUserById(id: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
