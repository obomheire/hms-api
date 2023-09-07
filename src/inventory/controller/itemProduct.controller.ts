import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateItemBatchDto } from '../dto/batch.dto';
import { ItemProductDto, UpdateItemProductDto } from '../dto/itemProduct.dto';
import { ItemProductService } from '../service/itemProdcut.service';

@ApiBearerAuth('Bearer')
@ApiTags('Inventory Item Product')
@Controller('itemproduct')
export class ItemProductController {
  constructor(private readonly itemProductService: ItemProductService) {}

  @ApiBody({
    type: ItemProductDto,
    description: 'creates a new item product request body',
  })
  //We want to create new item product
  @Post('create-item-product')
  async createItemProduct(
    @Body() itemProduct: ItemProductDto,
  ): Promise<ItemProductDto> {
    return await this.itemProductService.createItemProduct(itemProduct);
  }

  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit number',
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search string',
  })

  // We want to get all item product
  @Get('getall')
  async getAllItemProduct(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return await this.itemProductService.getAllItemProduct(page, limit, search);
  }

  // We want to update an item product by id
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single item product by id',
  })
  @ApiBody({
    type: UpdateItemProductDto,
    description: 'update a single item product by id',
  })
  @Patch('edit/:id')
  async updateItemProductById(
    @Param('id') itemProductId: string,
    @Body() updateItemProductDto: UpdateItemProductDto,
  ): Promise<ItemProductDto> {
    return await this.itemProductService.updateItemProductById(
      itemProductId,
      updateItemProductDto,
    );
  }

  // We want to delete an item product by id
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single item product by id',
  })
  @Delete('delete/:id')
  async deleteItemProductById(
    @Param('id') itemProductId: string,
  ): Promise<ItemProductDto> {
    return await this.itemProductService.deleteItemProductById(itemProductId);
  }

  // We want to get an item product by id
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single item product by id',
  })
  @Get('getone/:id')
  async getItemProductById(
    @Param('id') itemProductId: string,
  ): Promise<ItemProductDto> {
    return await this.itemProductService.getItemProductById(itemProductId);
  }

  // We want to get an item product by itemName search, non case sensitive
  @ApiParam({
    name: 'itemName',
    type: 'string',
    description: 'gets a single item product by itemName',
  })
  @Get('getone/itemname/:itemName')
  async getItemProductByName(
    @Param('itemName') itemName: string,
  ): Promise<ItemProductDto> {
    return await this.itemProductService.getItemProductByName(itemName);
  }

  // We want to get all item product and be able to search with a search string by itemName, itemType, brandName or itemDescription
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search string',
  })
  @Get('search')
  async getAllItemProductAndSearch(
    @Query('search') search: string,
  ): Promise<ItemProductDto[]> {
    return await this.itemProductService.getAllItemProductAndSearch(search);
  }

  //enter new batch 
  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'gets a single item batch by id',
  })
  @ApiBody({
    type: [CreateItemBatchDto],
    description: 'creates a new item batch request body',
  })
    @Post('create-item-batch/:requisitionId')
  async createItemBatch(
    @Param('requisitionId') requisitionId: string,
    @Body() itemBatch: CreateItemBatchDto[],
  ) {
    return await this.itemProductService.addBatchToProduct(itemBatch, requisitionId);
  }

  //add existing batch to item product
  @ApiBody({
    type: [CreateItemBatchDto],
    description: 'creates a new item batch request body',
  })
  @Post('add-existing-batch')
  async addBatchToItemProduct(
    @Body() itemBatch: CreateItemBatchDto[],
  ) {
    return await this.itemProductService.addBatchToProduct(itemBatch);
  }

  //get all item batch
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit number',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single item batch by id',
  })
  @Get('get-item-batches/:id')
  async getAllItemBatch(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string
  ) {
    return await this.itemProductService.getAllBatchesOfItemProduct(id, page, limit, search);
  }

  //get single item batch
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single item batch by id',
  })
  @Get('get-batch/:id')
  async getSingleItemBatch(
    @Param('id') id: string,
  ) {
    return await this.itemProductService.getSingleBatch(id);
  }

  //get all batches
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit number',
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search string',
  })
  @Get('get-all-batches')
  async getAllBatches(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.itemProductService.getAllBatches(page, limit, search);
  }

  //get all transactions of a product
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets all transactions of a product by id',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit number',
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search string',
  })

  @Get('get-transactions-item/:id')
  async getAllTransactionsOfItem(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return await this.itemProductService.getOrdersOfItem(id, page, limit, search);
  }

}
