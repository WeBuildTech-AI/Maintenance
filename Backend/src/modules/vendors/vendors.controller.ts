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
import { CreateVendorDto, VendorType } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";
import { VendorsService } from "./vendors.service";

@ApiTags("vendors")
@Controller({ path: "vendors", version: "1" })
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @ApiOperation({ summary: "Get all vendors" })
  @ApiResponse({ status: 200, description: "Vendors retrieved successfully" })
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.vendorsService.findAllVendors();
  }

  @Get("by-type/:type")
  @ApiOperation({ summary: "Get vendors by type" })
  @ApiParam({ name: "type", enum: VendorType, description: "Vendor type" })
  @ApiResponse({ status: 200, description: "Vendors retrieved successfully" })
  findByType(@Param("type") type: string) {
    return this.vendorsService.findVendorsByType(type);
  }

  @Get("by-location/:locationId")
  @ApiOperation({ summary: "Get vendors by location" })
  @ApiParam({ name: "locationId", description: "Location ID" })
  @ApiResponse({ status: 200, description: "Vendors retrieved successfully" })
  findByLocation(@Param("locationId") locationId: string) {
    return this.vendorsService.findVendorsByLocation(locationId);
  }

  @Get("by-asset/:assetId")
  @ApiOperation({ summary: "Get vendors by asset" })
  @ApiParam({ name: "assetId", description: "Asset ID" })
  @ApiResponse({ status: 200, description: "Vendors retrieved successfully" })
  findByAsset(@Param("assetId") assetId: string) {
    return this.vendorsService.findVendorsByAsset(assetId);
  }

  @Get("by-part/:partId")
  @ApiOperation({ summary: "Get vendors by part" })
  @ApiParam({ name: "partId", description: "Part ID" })
  @ApiResponse({ status: 200, description: "Vendors retrieved successfully" })
  findByPart(@Param("partId") partId: string) {
    return this.vendorsService.findVendorsByPart(partId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get vendor by ID" })
  @ApiParam({ name: "id", description: "Vendor ID" })
  @ApiResponse({ status: 200, description: "Vendor retrieved successfully" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  findOne(@Param("id") id: string) {
    return this.vendorsService.findVendorById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new vendor" })
  @ApiResponse({ status: 201, description: "Vendor created successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or related entities not found",
  })
  create(@Body() body: CreateVendorDto) {
    return this.vendorsService.createVendor(body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a vendor" })
  @ApiParam({ name: "id", description: "Vendor ID" })
  @ApiResponse({ status: 200, description: "Vendor updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or related entities not found",
  })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  update(@Param("id") id: string, @Body() body: UpdateVendorDto) {
    return this.vendorsService.updateVendor(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a vendor" })
  @ApiParam({ name: "id", description: "Vendor ID" })
  @ApiResponse({ status: 200, description: "Vendor deleted successfully" })
  @ApiResponse({ status: 404, description: "Vendor not found" })
  remove(@Param("id") id: string) {
    return this.vendorsService.removeVendor(id);
  }
}
