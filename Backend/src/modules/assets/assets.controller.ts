import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller({ path: 'assets', version: '1' })
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query() _pagination: PaginationQueryDto) {
    return this.assetsService.findAllAssets();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findAssetById(id);
  }

  @Post()
  create(@Body() body: CreateAssetDto) {
    return this.assetsService.createAsset(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAssetDto) {
    return this.assetsService.updateAsset(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.removeAsset(id);
  }
}
