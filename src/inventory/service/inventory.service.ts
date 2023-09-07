import { Injectable } from '@nestjs/common';
import { LabStockService } from 'src/laboratory/service/labStock.service';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { GrantorRejectDto, UpdateOrderDto } from 'src/utils/dtos/laboratory/order.dto';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { ItemProductService } from './itemProdcut.service';
import { ItemRequisitionService } from './itemRequisition.service';
import { NewVendorService } from './newVendor.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly itemProductService: ItemProductService,
    private readonly itemRequisitionService: ItemRequisitionService,
    private readonly labStockService: LabStockService,
    private readonly vendorService: NewVendorService,
  ) {}

  async getInventory(data?: FilterPatientDto): Promise<any> {
    try {
      const [
        itemCount,
        totalRequesitions,
        totalCostOfRequesitions,
        expiringItems,
        totalVendors,
        lowInStockItems,
        expiredItems,
        pendingRequests,
        totalRequesitionsCount,
      ] = await Promise.all([
        this.itemProductService.getCountOfAllItemProducts(),
        this.itemRequisitionService.getCountOfAllRequisitions(),
        this.itemRequisitionService.getTotalCostOfAllRequisitions(),
        this.itemProductService.getAllExpiringBatches(),
        this.vendorService.getNewVendorCount(),
        this.itemProductService.getAllLowStockBatches(),
        this.itemProductService.getAllExpiredBatches(),
        this.labStockService.getPendingOrders(data),
        this.labStockService.getTotalRequisitions(),
      ]);
      return {
        itemCount,
        totalRequesitions,
        totalCostOfRequesitions,
        expiringItems,
        totalVendors,
        lowInStockItems,
        expiredItems,
        pendingRequests,
        totalRequesitionsCount,
      };
    } catch (error) {
      throw error
    }
  }

  //grant multiple reuqests
  // async grantMultipleRequests(
  //   order: GrantorRejectDto,
  //   req: any,
  // ): Promise<any> {
  //   try {
  //     const orders = await this.labStockService.grantOrRejectMultipleOrders(
  //       order,
  //       req,
  //     );
  //     return orders;
  //   } catch (error) {
  //     throw error
  //   }
  // }

  //grant single request
    async grantSingleRequest(
        orderId: string,
        order: UpdateOrderDto,
        req: any,
        ): Promise<any> {
        try {
            return await this.labStockService.updateOrderFromLab(orderId, order, req)
        } catch (error) {
            throw error
        }
    }

    //update order
    // async updateOrder(orderId: string, data: any, req: any): Promise<any> {
    //     try {
    //         const order = await this.labStockService.updateOrder(orderId, data, req)
    //         return order
    //     } catch (error) {
    //         throw new Error(error.message)
    //     }
    // }

    //
}
