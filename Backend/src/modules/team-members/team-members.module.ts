import { Module } from "@nestjs/common";
import { TeamMembersService } from "./team-members.service";
import { TeamMembersController } from "./team-members.controller";
import { PrismaModule } from "../../database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
  exports: [TeamMembersService],
})
export class TeamMembersModule {}
