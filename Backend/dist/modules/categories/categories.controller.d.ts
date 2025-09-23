import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(_pagination: PaginationQueryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryIcon: import(".prisma/client").$Enums.CategoryIcon | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryIcon: import(".prisma/client").$Enums.CategoryIcon | null;
    }>;
    create(body: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryIcon: import(".prisma/client").$Enums.CategoryIcon | null;
    }>;
    update(id: string, body: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryIcon: import(".prisma/client").$Enums.CategoryIcon | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryIcon: import(".prisma/client").$Enums.CategoryIcon | null;
    }>;
}
