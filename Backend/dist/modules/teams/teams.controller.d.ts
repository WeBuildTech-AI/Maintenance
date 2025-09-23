import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    findAll(_pagination: PaginationQueryDto): import("./teams.service").TeamEntity[];
    findOne(id: string): import("./teams.service").TeamEntity;
    create(body: CreateTeamDto): import("./teams.service").TeamEntity;
    update(id: string, body: UpdateTeamDto): import("./teams.service").TeamEntity;
    remove(id: string): import("./teams.service").TeamEntity;
}
