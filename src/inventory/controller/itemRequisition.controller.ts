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
} from '@nestjs/common';
import {
  itemRequisitionDto,
  UpdateItemRequisitionDto,
  approveRequisitionDto,
  FilterBodyDto,
} from '../dto/itemRequisition.dto';
import { headApprovalDto } from 'src/utils/dtos/headApproval.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ItemRequisitionService } from '../service/itemRequisition.service';
import { RequisitionDisputeDto } from 'src/pharmacy/dto/requisition.dto';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';

@ApiTags('Inventory Requisition')
@ApiBearerAuth('Bearer')
@Controller('itemrequisition')
export class ItemRequisitionController {
  constructor(
    private readonly itemRequisitionService: ItemRequisitionService,
  ) {}

  // We want to create a new item requisition so that grandTotal is equals to sum of subTotalCost, shippingCost and otherCost multiply by salestax
  @ApiBody({
    type: itemRequisitionDto,
    description: 'creates a item requisition request body',
  })
  @Post('create')
  async createItemRequisition(
    @Body() itemRequisition: itemRequisitionDto,
    @Req() req: Request,
  ) {
    return await this.itemRequisitionService.createItemRequisition(
      itemRequisition,
      req,
    );
  }

  // // We want to get all item requisitions and be able to search by title and location
  // @ApiQuery({
  //   name: 'page',
  //   type: 'number',
  //   description: 'page number',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   type: 'number',
  //   description: 'limit number',
  // })
  // @ApiQuery({
  //   name: 'search',
  //   type: 'string',
  //   description: 'search string',
  // })
  // @Get('getall')
  // async getItemRequisitionsHistory(
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  //   @Query('search') search: string,
  // ) {
  //   return await this.itemRequisitionService.getItemRequisitionsHistory(
  //     page,
  //     limit,
  //     search,
  //   );
  // }

  // We want to get a requisition by id
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @Get('getone/:id')
  async getItemRequisitionById(@Param('id') id: string) {
    return await this.itemRequisitionService.getItemRequisitionById(id);
  }

  // We want to update a requisition by id
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @ApiBody({
    type: UpdateItemRequisitionDto,
    description: 'updates a requisition request body',
  })
  @Patch('edit/:id')
  async updateItemRequisitionById(
    @Param('id') id: string,
    @Body() updateItemRequisitionDto: UpdateItemRequisitionDto,
  ) {
    return await this.itemRequisitionService.updateItemRequisitionById(
      id,
      updateItemRequisitionDto,
    );
  }

  // We want to update only the headApproval field in the item recuisition document using the headApprovalDto
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @ApiBody({
    type: headApprovalDto,
    description: 'updates a requisition request body',
  })
  @Patch('headapproval/:id')
  async headApprovalById(
    @Param('id') id: string,
    @Body() headApprovalDto: headApprovalDto,
  ) {
    return await this.itemRequisitionService.headApprovalById(
      id,
      headApprovalDto,
    );
  }

  // We want to update only the item requisitionStatus field in the recuisition document using the approveRequisitionDto
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @ApiBody({
    type: approveRequisitionDto,
    description: 'updates a requisition request body',
  })
  @Patch('approve/:id')
  async approveRequisition(
    @Param('id') id: string,
    @Body() approveRequisitionDto: approveRequisitionDto,
  ) {
    return await this.itemRequisitionService.approveRequisition(
      id,
      approveRequisitionDto,
    );
  }

  // We want to update only the item requisitionStatus field in the recuisition document using the approveRequisitionDto for all the records
  @ApiBody({
    type: approveRequisitionDto,
    description: 'updates a requisition request body',
  })
  @Patch('approveall')
  async approveAllRequisitions(
    @Body() approveRequisitionDto: approveRequisitionDto,
  ) {
    return await this.itemRequisitionService.approveAllRequisitions(
      approveRequisitionDto,
    );
  }

  // We want to delete a item requisition by id
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @Delete('delete/:id')
  async deleteItemRequisitionById(@Param('id') id: string) {
    return await this.itemRequisitionService.deleteItemRequisitionById(id);
  }

  // We want to get all requisitions by a user and be able to search by title and location
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requester',
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
  @Get('getallbyrequester/:id')
  async getItemRequisitionsByUserIdAndSearch(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.itemRequisitionService.getItemRequisitionsByUserIdAndSearch(
      id,
      page,
      limit,
      search,
    );
  }

  //create item requisition dispute
  @ApiBody({
    type: RequisitionDisputeDto,
    description: 'creates a item requisition dispute request body',
  })
  @Post('create-dispute/:id')
  async createItemRequisitionDispute(
    @Param('id') id: string,
    @Body() itemRequisitionDispute: RequisitionDisputeDto,
    @Req() req: Request,
  ) {
    return await this.itemRequisitionService.createRequisitionDispute(
      id,
      itemRequisitionDispute,
      req,
    );
  }

  // We want to get all item requisitions and be able to search by title and location
  @ApiBody({
    type: FilterPatientDto,
    description: 'filter appointments for a patient',
  })
  @Post('getall')
  async getAllRequisitions(
    @Body() data?: FilterBodyDto,
  ) {
    return await this.itemRequisitionService.getAllRequisitions(data);
  }

  //
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @Patch('mark-inspecting/:id')
  async markInspecting(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return await this.itemRequisitionService.markRequisitionAsInspecting(id, req);
  }

  //requsiition for a product
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the requisition',
  })
  @ApiBody({
    type: FilterBodyDto,
    description: 'filter appointments for a patient',
  })

  @Get('single-product-requisition/:productId')
  async getSingleProductRequisition(
    @Param('productId') productId: string,
    @Query('search') search?: string,
  ) {
    return await this.itemRequisitionService.getAllRequisitionsForProductType(productId, search);
  }

  //get hsitory requisition for a product
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'id of the product',
  })
  @ApiBody({
    type: FilterBodyDto,
    description: 'filter body for a requsition',
  })
  @Post('single-product-requisition-history/:productId')
  async getSingleProductRequisitionHistory(
    @Param('productId') productId: string,
    @Body() data?: FilterBodyDto,
  ) {
    return await this.itemRequisitionService.getAllRequisitionHistoryForProductType(productId, data);
  }
}
