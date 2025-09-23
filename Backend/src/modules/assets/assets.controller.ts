import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";

@ApiTags("assets")
@Controller({ path: "assets", version: "1" })
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: "Get all assets" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiResponse({ status: 200, description: "Assets retrieved successfully" })
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.assetsService.findAllAssets();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get asset by ID" })
  @ApiParam({ name: "id", description: "Asset ID" })
  @ApiResponse({ status: 200, description: "Asset retrieved successfully" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  findOne(@Param("id") id: string) {
    return this.assetsService.findAssetById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new asset" })
  @ApiResponse({ status: 201, description: "Asset created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  create(@Body() body: CreateAssetDto) {
    return this.assetsService.createAsset(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an asset" })
  @ApiParam({ name: "id", description: "Asset ID" })
  @ApiResponse({ status: 200, description: "Asset updated successfully" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  update(@Param("id") id: string, @Body() body: UpdateAssetDto) {
    return this.assetsService.updateAsset(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.assetsService.removeAsset(id);
  }
}
