import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  createCategory(payload: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: payload });
  }

  updateCategory(id: string, payload: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data: payload });
  }

  removeCategory(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  findAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  findCategoryById(id: string): Promise<Category> {
    return this.prisma.category.findUniqueOrThrow({ where: { id } });
  }
}
