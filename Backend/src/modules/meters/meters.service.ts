import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateMeterDto, MeterType } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';

export interface MeterDetails {
  organizationId: string;
  name: string;
  meterType?: MeterType;
  description?: string;
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
}

export type MeterEntity = StoredEntity<MeterDetails>;

@Injectable()
export class MetersService extends BaseInMemoryService<MeterDetails> {
  createMeter(payload: CreateMeterDto): MeterEntity {
    return super.create(payload);
  }

  updateMeter(id: string, payload: UpdateMeterDto): MeterEntity {
    return super.update(id, payload);
  }

  findAllMeters(): MeterEntity[] {
    return super.findAll();
  }

  findMeterById(id: string): MeterEntity {
    return super.findOne(id);
  }
}
