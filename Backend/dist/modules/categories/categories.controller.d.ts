import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(_pagination: PaginationQueryDto): import("./categories.service").CategoryEntity[];
    findOne(id: string): import("./categories.service").CategoryEntity;
    create(body: CreateCategoryDto): import("./categories.service").CategoryEntity;
    update(id: string, body: UpdateCategoryDto): import("./categories.service").CategoryEntity;
    remove(id: string): import("./categories.service").CategoryEntity;
}
