import { IsInt, IsOptional, IsPositive, Min } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Number of items to return per page",
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Page number (1-based)",
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items to skip (alternative to page)",
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  // Computed property to get offset from page and limit
  getOffset(): number {
    if (this.offset !== undefined) {
      return this.offset;
    }
    const pageNum = this.page || 1;
    const limitNum = this.limit || 10;
    return (pageNum - 1) * limitNum;
  }

  // Computed property to get limit with default
  getLimit(): number {
    return this.limit || 10;
  }
}
