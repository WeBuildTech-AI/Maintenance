import { Location } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLocation(payload: CreateLocationDto): Promise<Location>;
    updateLocation(id: string, payload: UpdateLocationDto): Promise<Location>;
    findAllLocations(): Promise<Location[]>;
    findLocationById(id: string): Promise<Location>;
    removeLocation(id: string): Promise<Location>;
}
