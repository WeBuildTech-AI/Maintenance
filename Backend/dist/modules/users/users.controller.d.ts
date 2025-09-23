import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        id: string;
        organizationId: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        organizationId: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: CreateUserDto): Promise<{
        id: string;
        organizationId: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: UpdateUserDto): Promise<{
        id: string;
        organizationId: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        organizationId: string;
        fullName: string;
        email: string;
        phoneNumber: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private sanitize;
}
