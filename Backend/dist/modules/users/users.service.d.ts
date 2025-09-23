import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export interface UserDetails {
    organizationId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    passwordHash?: string;
}
export type UserEntity = StoredEntity<UserDetails>;
export declare class UsersService extends BaseInMemoryService<UserDetails> {
    createUser(payload: CreateUserDto, passwordHash?: string): UserEntity;
    updateUser(id: string, payload: UpdateUserDto): UserEntity;
    removeUser(id: string): UserEntity;
    findAllUsers(): UserEntity[];
    findUserById(id: string): UserEntity;
    findByEmail(email: string): UserEntity | undefined;
}
