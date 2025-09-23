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
export declare class CategoriesService extends BaseInMemoryService<CategoryDetails> {
    createCategory(payload: CreateCategoryDto): CategoryEntity;
    updateCategory(id: string, payload: UpdateCategoryDto): CategoryEntity;
    removeCategory(id: string): CategoryEntity;
    findAllCategories(): CategoryEntity[];
    findCategoryById(id: string): CategoryEntity;
}
