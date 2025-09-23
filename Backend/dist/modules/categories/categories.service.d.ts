import { Category } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createCategory(payload: CreateCategoryDto): Promise<Category>;
    updateCategory(id: string, payload: UpdateCategoryDto): Promise<Category>;
    removeCategory(id: string): Promise<Category>;
    findAllCategories(): Promise<Category[]>;
    findCategoryById(id: string): Promise<Category>;
}
