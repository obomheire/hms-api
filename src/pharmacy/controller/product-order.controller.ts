import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PharmacyPrescriptionEntity } from 'src/patients/schema/pharmacyPrescription.schema';
import { PrescriptionService } from 'src/patients/service/precription.service';
import { PaymentEventEnum } from 'src/payment/event/payment.event';
import { TransactionTypeNameEnum } from 'src/transaction-types/enums/transaction-type.enum';
import { TransactionTypeService } from 'src/transaction-types/services/transaction-type.service';
import { IResponse } from 'src/utils/constants/constant';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ProductOrderDto } from '../dto/product-order.dto';
import { PharmacyEventsEnum } from '../events/pharmacy.event';
import { UpdateProductOrderGuard } from '../guards/product-order.guard';
import {
  ProductOrderDocument,
  ProductOrderEntity,
} from '../schema/product-order.schema';
import { ProductOrderService } from '../service/product-order.service';
import { ProductService } from '../service/product.service';

@ApiBearerAuth('Bearer')
@ApiTags('Pharmacy Product Order')
@Controller('product-order')
export class ProductOrderController {
  constructor(
    private readonly productOrderService: ProductOrderService,
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionTypeService: TransactionTypeService,
    private readonly prescriptionService: PrescriptionService,
    private readonly productService: ProductService
  ) {}

  @ApiBody({
    type: ProductOrderDto,
    description: 'creates a product order request body',
  })
  @Post('mobile')
  async createDrugOrder(
    @Body() body: ProductOrderDto,
    @Req() req: Request,
  ): Promise<IResponse> {
   
    const data = await this.prescriptionService.createIndividualPrescription(body, req.user as unknown as string)
    //now calculate the totalCost by looping through the products in the items array and multiplying the quantity by the salesPrice
    let totalCost = 0;
    for (const item of data.items) {
      const product = await this.productService.getOneProdcuct(item.product);
      totalCost += item.quantity * product.salesPrice;
    }
    if (data) {
      const payload = {
        patient: req.user as unknown as string,
        itemToPayFor: data.id,
        model: PharmacyPrescriptionEntity.name,
        transactionType: TransactionTypeNameEnum.PHARMACY,
        reference: body.reference,
        totalCost,
      };
      this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED_FOR_PHARMACY, payload);
    }

    return {
      status: HttpStatus.CREATED,
      message: 'Product order created successfully',
      data,
    };
  }

  @Get('mobile/all')
  async getAllDrugOrder(
    @Query() query: PaginationDto,
    @Req() req: Request,
  ): Promise<IResponse> {
    const data = await this.prescriptionService.getPrescriptionsByPatient(
      
      req.user as unknown as string,
      query
    );
    return {
      status: HttpStatus.OK,
      message: 'Product order retrieved successfully',
      data,
    };
  }

  @Put(':id')
  @UseGuards(UpdateProductOrderGuard)
  async updateDrugOrder(
    @Body() body: ProductOrderDto,
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<IResponse> {
    const data = await this.productOrderService.update(id, body);
    return {
      status: HttpStatus.OK,
      message: 'Product order updated successfully',
      data,
    };
  }

  @ApiBody({
    type: ProductOrderDto,
    required: false,
    description: 'creates a product order request body',
  })
  @Post('get-paid-orders-for-pharmacy')
  async getPaidOrdersForPharmacy(@Body() pg:PaginationDto): Promise<IResponse> {
    const data = await this.productOrderService.getPaidOrdersForPharmacy(pg);
    return {
      status: 200,
      message: 'Paid orders fetched successfully',
      data,
    };
  }
}
