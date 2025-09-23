import { Injectable } from '@nestjs/common';
import { Location } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  createLocation(payload: CreateLocationDto): Promise<Location> {
    return this.prisma.location.create({ data: payload });
  }

  updateLocation(id: string, payload: UpdateLocationDto): Promise<Location> {
    return this.prisma.location.update({ where: { id }, data: payload });
  }

  findAllLocations(): Promise<Location[]> {
    return this.prisma.location.findMany();
  }

  findLocationById(id: string): Promise<Location> {
    return this.prisma.location.findUniqueOrThrow({ where: { id } });
  }

  removeLocation(id: string): Promise<Location> {
    return this.prisma.location.delete({ where: { id } });
  }
}
