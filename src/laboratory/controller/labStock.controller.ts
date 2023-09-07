import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query
} from '@nestjs/common';
import { CreateLabStockDto, UpdateLabStockDto } from '../dto/labStock.dto';
import { CreateTestDto, UpdateTestDto } from '../dto/test.dto';
import { LabStockService } from '../service/labStock.service';
import { Request } from 'express'
import { CreateOrderDto, UpdateOrderDto } from 'src/utils/dtos/laboratory/order.dto';
import { ApiBody, ApiParam, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { RecordUsageDto } from '../dto/recordUsage.dto';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { ToggleStatusEnum } from '../enum/lab.enum';

@ApiBearerAuth("Bearer")
@ApiTags('Laboratory Lab Stock')
@Controller('lab-stock')
export class LabStockController {
  constructor(private readonly labStockService: LabStockService) {}

  @ApiBody({
    type: CreateLabStockDto,
    description: 'Create lab stock request body',
  })
  //create lab stock
  @Post()
  async createLabStock(@Body() labStock: CreateLabStockDto) {
    return await this.labStockService.createLabStock(labStock);
  }

  @ApiBody({
    type: CreateOrderDto,
    description: 'Create test request body',
  })
  //submit requisition order
  @Post('submit-requisition-order')
  async submitRequisitionOrder(
    @Body() labStock: CreateOrderDto,
    @Req() req: any,
  ) {
    return await this.labStockService.submitRequisitionOrder(labStock, req);
  }

  // @ApiParam({
  //   name: 'orderId',
  //   type: String,
  //   description: 'Approve requisition order by id',
  // })
  // //approve requisition order
  // @Patch('approve-requisition-order/:orderId')
  // async approveRequisitionOrder(
  //   @Param('orderId') orderId: string,
  //   @Req() req: any,
  // ) {
  //   return await this.labStockService.approveRequisitionOrder(orderId, req);
  // }

  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Update requisition by id',
  })
  @ApiBody({
    type: String,
    description: 'approval keyword',
  })
  //update order
  // @Patch('update-order/:orderId')
  // async updateOrder(
  //   @Param('orderId') orderId: string,
  //   @Body('approval') approval: ApprovalEnum,
  //   @Req() req: Request,
  // ) {
  //   return await this.labStockService.updateOrder(orderId,approval, req);
  // }

  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Updatew lab stock by id',
  })
  @ApiBody({
    type: UpdateLabStockDto,
    description: 'Update lab stock request body',
  })
  //update lab stock
  @Patch('update-lab-stock/:labStockId')
  async updateLabStock(
    @Param('labStockId') labStockId: string,
    @Body() labStock: UpdateLabStockDto,
  ) {
    return await this.labStockService.updateLabStock(labStockId, labStock);
  }

  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Get lab stock pagenation, set the number of pages',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Get lab stock pagenation, set limit per page',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'Get lab stock pagenation, the search query string',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Get lab stock, set the date filter',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'Get lab stock, set the date filter',
  })
  //get lab stock
  @Get()
  async getLabStock(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.labStockService.getLabStock(page, limit, search, startDate, endDate);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'get completed orders',
})
  //get order history
  @Post('order-history')
  async getOrderHistory(
    @Body() data?: FilterPatientDto,
  ) {
    return await this.labStockService.getOrderHistory(data);
  }

  //use lab stock
  @Post('use-lab-stock/:investigationId')
  async useLabStock(@Param('investigationId') investigationId: string,  @Body() labStock: RecordUsageDto[], @Req() req: any) {
    return await this.labStockService.useLabStock(labStock, investigationId, req);
  }


  //fulfill lab stock
  @Patch('fulfill-approved-order/:orderId')
  async fulfillApprovedOrder(@Param('orderId') orderId: string, @Body('status') status: ToggleStatusEnum, @Req() req: any) {
    return await this.labStockService.fulfillApprovedOrder(orderId, status, req);
  }
  

  //get usage history
  @ApiParam({
    name: 'labStockId',
    type: String,
    description: 'Get usage history by lab stock id',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Get usage history pagenation, set the number of pages',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Get usage history pagenation, set limit per page',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description: 'Get usage history pagenation, set the date filter',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description: 'Get usage history pagenation, set the date filter',
  })
  @Get('usage-history/:labStockId')
  async getUsageHistory(
    @Param('labStockId') labStockId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
   
  ) {
    return await this.labStockService.getUsageHistory(labStockId, page, limit);
  }
  

}