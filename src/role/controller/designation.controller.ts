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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionTypeNameEnum, TransactionTypeStatusEnum } from 'src/transaction-types/enums/transaction-type.enum';
import { CreateDesignationDto, UpdateDesignationDto } from '../dtos/designation.dto';
import { DesignationEventEnum } from '../event/role.event';
import { DesignationDocument } from '../schema/designation.schema';
import { DesignationService } from '../service/designation.service';


@ApiBearerAuth("Bearer")
@ApiTags('Role Designation')
@Controller('designation')
export class DesignationController {
  constructor(
    private readonly designationService: DesignationService,
    private readonly eventEmitter: EventEmitter2
    ) {}

  @ApiBody({
    type: CreateDesignationDto,
    description: 'Create Designation request body',
  })
  //create designation
  @Post()
  async createDesignation(
    @Body() designation: CreateDesignationDto,
  ): Promise<DesignationDocument> {
    const data = await this.designationService.createDesignation(designation);
    const payload = {
      specialty: data._id,
      type: TransactionTypeNameEnum.CONSULTATION,
      status: TransactionTypeStatusEnum.ACTIVE,
      amount: designation.amount ? designation.amount : 1000,
    };
    //find the designation by id
    const designationById: any = await this.designationService.getDesignationById(data._id);
    //if designation is found and name of role is DOCTOR, then create a transaction type
    if (designationById && designationById.role.name === 'DOCTOR') {

    this.eventEmitter.emit(DesignationEventEnum.TRANSACTION_TYPE_CREATED, payload);
    }
    return data;
  }

  @ApiParam({
    name: 'designationId',
    type: 'string',
    description: 'update designation by id',
  })
  @ApiBody({
    type: UpdateDesignationDto,
    description: 'update designation request body',
  })
  //edit designation
  @Patch(':designationId')
  async editDesignation(
    @Param('designationId') designationId: string,
    @Body() designation: UpdateDesignationDto,
  ): Promise<DesignationDocument> {
    const designationBeforeUpdate = await this.designationService.getDesignationById(designationId);
    const designationName = designationBeforeUpdate.name;
    const payloadBeforeUpdate = {
      specialty: designation.name,
      type: TransactionTypeNameEnum.CONSULTATION,
      status: TransactionTypeStatusEnum.ACTIVE,
    }
    this.eventEmitter.emit(DesignationEventEnum.DESIGNATION_BEFORE_UPDATE, payloadBeforeUpdate);
    const data = await this.designationService.editDesignation(
      designationId,
      designation,
    );
    const payloadAfterUpdate = {
      specialty: data.name,
      type: TransactionTypeNameEnum.CONSULTATION,
      status: TransactionTypeStatusEnum.ACTIVE,
      amount: 1000,
      previousSpecialty: designationName,
    }
    this.eventEmitter.emit(DesignationEventEnum.DESIGNATION_AFTER_UPDATE, payloadAfterUpdate);
    return data;
  }

  //get all designations
  @Get()
  async getDesignations(): Promise<DesignationDocument[]> {
    return await this.designationService.getDesignations();
  }

  @ApiParam({
    name: 'designationId',
    type: 'string',
    description: 'get designation by id',
  })
  //get designation by id
  @Get(':designationId')
  async getDesignationById(
    @Param('designationId') designationId: string,
  ): Promise<DesignationDocument> {
    return await this.designationService.getDesignationById(designationId);
  }

  @ApiParam({
    name: 'designationId',
    type: 'string',
    description: 'delete designation by id',
  })
  //delete designation
  @Delete(':designationId')
  async deleteDesignation(
    @Param('designationId') designationId: string,
  ): Promise<string> {
    return await this.designationService.deleteDesignation(designationId);
  }

  @ApiParam({
    name: 'roleId',
    type: 'string',
    description: 'get designation by role id',
  })
  //get designation by role id
  @Get('role/:roleId')
  async getDesignationsByRole(
    @Param('roleId') roleId: string,
  ): Promise<DesignationDocument[]> {
    return await this.designationService.getDesignationsByRole(roleId);
  }
}