import { Controller, Get, Post, Patch, Param, Query, Body, Delete } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateStockDto, UpdateStockDto } from '../dto/stock.dto';
import { StockService } from '../service/stock.service';

@ApiBearerAuth("Bearer")
@ApiTags('Inventory Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @ApiBody({
    type: CreateStockDto,
    description: 'Create stock request body',
  })
  //create stock
  @Post()
  async createStock(@Body() stock: CreateStockDto) {
    return await this.stockService.createStock(stock);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Update stock by id',
  })
  @ApiBody({
    type: UpdateStockDto,
    description: 'Update stock request body',
  })
  //edit stock
  @Patch(':stockId')
  async editStock(
    @Param('stockId') stockId: string,
    @Body() stock: UpdateStockDto,
  ) {
    return await this.stockService.editStock(stockId, stock);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Delete stock by id',
  })
  //delete stock
  @Delete(':stockId')
  async deleteStock(@Param('stockId') stockId: string) {
    return await this.stockService.deleteStock(stockId);
  }
}
