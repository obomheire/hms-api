import { Body, Controller, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { CreateOrderDto, GrantorRejectDto, UpdateOrderDto } from 'src/utils/dtos/laboratory/order.dto';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { InventoryService } from '../service/inventory.service';
import { ItemProductService } from '../service/itemProdcut.service';

@ApiTags('Inventory')
@ApiBearerAuth('Bearer')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService, private readonly itemProductService: ItemProductService) {}

  @ApiBody({
    type: FilterPatientDto,
    description: 'Filter inventory by date',
  })
  @Post('get-inventory')
  async getInventory(@Body() data?: FilterPatientDto) {
    return await this.inventoryService.getInventory(data);
  }

  // @ApiBody({
  //   type: GrantorRejectDto,
  //   description: 'req body',
  // })
  // @ApiBody({
  //   type: String,
  //   description: 'Approval status',
  // })
  // @Post('grant-multiple-requests')
  // async grantMultipleRequests(
  //   @Body() order: GrantorRejectDto,
  //   @Req() req: any,
  // ) {
  //   return await this.inventoryService.grantMultipleRequests(
  //     order,
  //     req,
  //   );
  // }

  @ApiBody({
    type: CreateOrderDto,
    description: 'Update order',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order id',
  })
  @Post('grant-request/:orderId')
  async grantSingleRequest(
    @Param('orderId') orderId: string,
    @Body() order: UpdateOrderDto,
    @Req() req: any,
  ) {
    return await this.itemProductService.updateOrderFromLab(orderId, order, req);
  }

  //update order
  // @Post('update-order')
  // async updateOrder(
  //   @Body('orderId') orderId: string,
  //   @Body() data: any,
  //   @Req() req: any,
  // ) {
  //   return await this.inventoryService.updateOrder(orderId, data, req);
  // }
}
