import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ItemTypeDto, UpdateItemTypeDto } from '../dto/itemType.dto';
import { ItemTypeService } from '../service/itemType.service';

@ApiBearerAuth('Bearer')
@ApiTags('Inventory Item Type')
@Controller('itemtype')
export class ItemTypeController {
  constructor(private readonly itemTypeService: ItemTypeService) {}

  @ApiBody({
    type: ItemTypeDto,
    description: 'creates a item type request body',
  })
  //We want to create item type
  @Post('create')
  async createItemType(@Body() itemType: ItemTypeDto): Promise<ItemTypeDto> {
    return await this.itemTypeService.createItemType(itemType);
  }

  // We want to get all item type
  @Get('getall')
  async getAllItemType(): Promise<ItemTypeDto[]> {
    return await this.itemTypeService.getAllItemType();
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single item type by id',
  })
  // We want to get a item type by id
  @Get('getone/:id')
  async getItemTypeById(@Param('id') itemTypeId: string): Promise<ItemTypeDto> {
    return await this.itemTypeService.getItemTypeById(itemTypeId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single item type by id',
  })
  @ApiBody({
    type: UpdateItemTypeDto,
    description: 'update a item type request body',
  })
  // We want to update a item type by id
  @Patch('edit/:id')
  async updateItemTypeById(
    @Param('id') itemTypeId: string,
    @Body() itemType: UpdateItemTypeDto,
  ): Promise<ItemTypeDto> {
    return await this.itemTypeService.updateItemTypeById(itemTypeId, itemType);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single item type by id',
  })
  // We want to delete a item type by id
  @Delete('delete/:id')
  async deleteItemTypeById(
    @Param('id') itemTypeId: string,
  ): Promise<ItemTypeDto> {
    return await this.itemTypeService.deleteItemTypeById(itemTypeId);
  }
}
