import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { CreateRequestDto, PharmacyPrescriptionDto, UpdatePharmacyPrescriptionDto } from 'src/patients/dto/pharmacyPrescription.dto';
import { PaymentEventEnum } from 'src/payment/event/payment.event';
import { IResponse } from 'src/utils/constants/constant';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { DispensePrescription, ProductBatchDto } from '../dto/batch.dto';
import { CreateProductDto, ProductListDto, UpdateProductDto } from '../dto/product.dto';
import { ProductService } from '../service/product.service';

@ApiBearerAuth('Bearer')
@ApiTags('Pharmacy Product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly eventEmitter: EventEmitter2,
    ) {}

  @ApiBody({
    type: CreateProductDto,
    description: 'creates a product request body',
  })
  // We want to create a new product
  @Post('create')
  @UseInterceptors(FileInterceptor('filename'))
  async createProduct(
    @Body() product: CreateProductDto,
    @UploadedFile() filename: Express.Multer.File,
  ) {
    return await this.productService.createProduct(product, filename);
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
  // We want to get all products
  @Get('getall')
  async getAllProducts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.productService.getAllProducts(page, limit, search);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single product by id',
  })
  // We want to get a product by id
  @Get('getone/:id')
  async getOneProdcuct(@Param('id') productId: string) {
    return await this.productService.getOneProdcuct(productId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single product by id',
  })
  @ApiBody({
    type: UpdateProductDto,
    description: 'update a product request body',
  })
  // We wanty to edit a product
  @Patch('edit/:id')
  async updateProduct(
    @Param('id') productId: string,
    @Body() product: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(productId, product);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single product by id',
  })
  // We want to delete a product
  @Delete('remove/:id')
  async deleteProduct(@Param('id') productId: string) {
    return await this.productService.deleteProduct(productId);
  }

  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'requisition by id',
  })
  @ApiBody({
    type: ProductBatchDto,
    isArray: true,
    description: 'add batch to product request body',
  })
  //add batch to products
  @Post('add-batch/:requisitionId')
  async addBatch(@Param('requisitionId') requisitionId: string, @Body() batch: ProductBatchDto[]) {
    return await this.productService.addBatchToProduct(batch, requisitionId);
  }

  @ApiBody({
    type: ProductBatchDto,
    isArray: true,
    description: 'add batch to product request body',
  })
  @Post('add-existing-batch')
  async addExistingBatchToProduct(@Body() batch: ProductBatchDto[]) {
    return await this.productService.addBatchToProduct(batch);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'get batches by product id',
  })
  //get batches by product id
  @Get('get-batch-product/:id')
  async getBatches(@Param('id') id: string) {
    return await this.productService.getBatchesByProduct(id);
  }

  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'filter by page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'filter by limit number',
  })
  @Get('get-expiry')
  async getAllExpiredProductBatches(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.productService.getAllExpiredProductBatches(page, limit);
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
  @Get('about-to-expire')
  async getAllExpiringProductBatches(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.productService.getAllExpiringProductBatches(page, limit);
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
  @Get('available-stock')
  async getAvailableProducts(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.productService.getAvailableProducts(search, page, limit);
  }

  @ApiBody({
    type: PharmacyPrescriptionDto,
    description: 'create prescription request body',
  })
  //create prescription
  @Post('create-prescription')
  async createPrescription(
    @Body() body: PharmacyPrescriptionDto,
    @Req() req: any,
  ) {
    return await this.productService.createPescription(body, req);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'get prescription by id',
  })
  @Get('get-prescription/:id')
  async getPrescription(@Param('id') id: string) {
    return await this.productService.getPrescription(id);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'get pending requests request body',
  })
  @Get('get-pending-requests')
  async getPendingRequests(@Body() body: FilterPatientDto) {
    return await this.productService.getPendingRequests(body);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'get completed requests request body',
  })
  @Post('get-dispensed-list')
  async getCompletedRequests(@Body() body: FilterPatientDto) {
    return await this.productService.getCompletedRequests(body);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update prescription by id',
  })
  @ApiBody({
    type: PharmacyPrescriptionDto,
    description: 'update prescription request body',
  })
  @Patch('update-prescription/:id')
  async updatePrescription(
    @Param('id') id: string,
    @Body() body: PharmacyPrescriptionDto,
  ) {
    return await this.productService.updatePrescription(id, body);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete prescription by id',
  })
  @Delete('delete-prescription/:id')
  async deletePrescription(@Param('id') id: string) {
    return await this.productService.deletePrescription(id);
  }

 
  @ApiBody({
    type: CreateRequestDto,
    description: 'create a new prescription request body',
  })
  @Post('create-request')
  async dispensePrescription(
    @Param('id') id: string,
    @Body()  data: CreateRequestDto,
    @Req() req: any,
    // @Body('toalCost') totalCost?: number,
  ) {
    // console.log(body, 'body')
    const res = await this.productService.billPrescription(
      data,
      req,
    );
    const payload = {
      patient: res.patient,
      transactionType: 'PHARMACY',
      totalCost: res.totalCost,
      itemToPayFor: res.id,
      model: 'PharmacyPrescriptionEntity'
    }
    this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED, payload);
    return res;

  }
  //dispense exising prescription
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'bill existing prescription by id',
  })
  @ApiBody({
    type: CreateRequestDto,
    description: 'update existing prescription request body',
  })
  @Patch('bill-prescription/:id')
  async dispenseExistingPrescription(
    @Param('id') id: string,
    @Body() data: CreateRequestDto,
    @Req() req: any,
  ) {
    const {prescription, finishedItems} = await this.productService.dispenseExistingPrescription(
      id,
      data,
      req,
    );
    const payload = {
      patient: prescription.patient,
      transactionType: 'PHARMACY',
      totalCost: prescription.totalCost,
      itemToPayFor: prescription.id,
      model: 'PharmacyPrescriptionEntity'
    }
    this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED, payload);
    return {prescription, finishedItems};
  }
  //dispense prescription
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'dispense prescription by id',
  })
  @Patch('dispense-prescription/:id')
  async dispensePrescriptionById(
    @Param('id') id: string,
  ) {
    return await this.productService.dispensePrescription(
      id,
    );
  }

  @Get('total-dispensed')
  async getTotalDispensedPrescriptions() {
    return await this.productService.getTotalDispensedPrescriptions();
  }

  @ApiBody({
    type: ProductListDto,
    required: false,
  })
  @Post('mobile/product-list')
  async getProductList(@Body() query: ProductListDto): Promise<IResponse> {
    const data = await this.productService.getProductList(query);
    return {
      status: 200,
      message: 'Product list fetched successfully',
      data,
    };
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'dispense product order by id',
  })
  @Post('dispense-product-order/:id')
  async dispenseProductOrder(@Param('id') id: string, @Req() req: Request): Promise<IResponse> {
    const data = await this.productService.dispenseProductOrder(id, req.user as unknown as string);
    return {
      status: 200,
      message: 'Product order dispensed successfully',
      data,
    };
  }




}
