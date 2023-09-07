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
  requisitionDto,
  UpdaterequisitionDto,
  approveRequisitionDto,
  RequisitionDisputeDto,
} from '../dto/requisition.dto';
import { headApprovalDto } from 'src/utils/dtos/headApproval.dto';
import { RequisitionService } from '../service/requisition.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Pharmacy Requisition')
@ApiBearerAuth('Bearer')
@Controller('requisition')
export class RequisitionController {
  constructor(private readonly requisitionService: RequisitionService) {}

  @ApiBody({
    type: requisitionDto,
    description: 'creates a requisition request body',
  })
  // We want to create a new requisition
  @Post('create')
  async createRequisition(
    @Body() requisition: requisitionDto,
    @Req() req: Request,
  ) {
    return await this.requisitionService.createRequisition(requisition, req);
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
  // We want to get all requisitions and be able to search by title and location
  @Get('getall')
  async getRequisitionsHistory(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return await this.requisitionService.getRequisitionsHistory(
      page,
      limit,
      search,
    );
  }

  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'get requisition by id',
  })
  // We want to get a requisition by id
  @Get('getone/:requisitionId')
  async getOneRequisition(@Param('requisitionId') requisitionId: string) {
    return await this.requisitionService.getRequisitionById(requisitionId);
  }

  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'update requisition by id',
  })
  @ApiBody({
    type: UpdaterequisitionDto,
    description: 'update requisition request body',
  })
  // We want to update a requisition by id
  @Patch('edit/:requisitionId')
  async updateRequisition(
    @Param('requisitionId') requisitionId: string,
    @Body() requisition: UpdaterequisitionDto,
  ) {
    return await this.requisitionService.updateRequisitionById(
      requisitionId,
      requisition,
    );
  }

  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'head approval with id',
  })
  @ApiBody({
    type: headApprovalDto,
    description: 'head approval request body',
  })
  // We want to update only the headApproval field in the recuisition document using the headApprovalDto
  @Patch('headapproval/:requisitionId')
  async headApprovalById(
    @Param('requisitionId') requisitionId: string,
    @Body() headApprovalDto: headApprovalDto,
  ) {
    return await this.requisitionService.headApprovalById(
      requisitionId,
      headApprovalDto,
    );
  }

  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'approve requisition with id',
  })
  @ApiBody({
    type: approveRequisitionDto,
    description: 'approve requisition request body',
  })
  // We want to update only the requisitionStatus field in the recuisition document using the approveRequisitionDto
  @Patch('approve/:requisitionId')
  async approveRequisition(
    @Param('requisitionId') requisitionId: string,
    @Body() approveRequisitionDto: approveRequisitionDto,
  ) {
    return await this.requisitionService.approveRequisition(
      requisitionId,
      approveRequisitionDto,
    );
  }

  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'delete requisition with id',
  })
  // We want to delete a requisition by id
  @Delete('remove/:requisitionId')
  async deleteRequisition(@Param('requisitionId') requisitionId: string) {
    return await this.requisitionService.deleteRequisitionById(requisitionId);
  }

  // We want to get all requisitions by a requester and be able to search by title and location
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
  async getRequisitionsByUserIdAndSearch(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.requisitionService.getRequisitionsByUserIdAndSearch(
      id,
      page,
      limit,
      search,
    );
  }

  //mark requisition as inspecting
  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'mark requisition as inspecting',
  })
  @Patch('inspecting/:requisitionId')
  async markAsInspecting(@Param('requisitionId') requisitionId: string, @Req() req: Request) {
    return await this.requisitionService.markAsInspecting(requisitionId, req);
  }
  
  //create requisition dispute
  @ApiParam({
    name: 'requisitionId',
    type: 'string',
    description: 'create requisition dispute',
  })
  @ApiBody({
    type: RequisitionDisputeDto,
    description: 'create requisition dispute request body',
  })
  @Post('create-dispute/:requisitionId')
  async createDispute(
    @Param('requisitionId') requisitionId: string,
    @Body() createDisputeDto: RequisitionDisputeDto,
    @Req() req: Request,
  ) {
    return await this.requisitionService.createRequisitionDispute(requisitionId, createDisputeDto, req);
  }

}
