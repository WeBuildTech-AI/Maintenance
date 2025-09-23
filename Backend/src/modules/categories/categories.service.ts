import { Injectable } from '@nestjs/common';
import { BaseInMemoryService, StoredEntity } from '../../common/base-in-memory.service';
import { CreateCategoryDto, CategoryIcon } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface CategoryDetails {
  organizationId: string;
  name: string;
  categoryIcon?: CategoryIcon;
  description?: string;
}

export type CategoryEntity = StoredEntity<CategoryDetails>;

@Injectable()
export class CategoriesService extends BaseInMemoryService<CategoryDetails> {
  createCategory(payload: CreateCategoryDto): CategoryEntity {
    return super.create(payload);
  }

  updateCategory(id: string, payload: UpdateCategoryDto): CategoryEntity {
    return super.update(id, payload);
  }

  removeCategory(id: string): CategoryEntity {
    return super.remove(id);
  }

  findAllCategories(): CategoryEntity[] {
    return super.findAll();
  }

  findCategoryById(id: string): CategoryEntity {
    return super.findOne(id);
  }
}
