import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilterQuery } from 'mongoose';
import { FilterAppointmentDto } from 'src/appointments/dto/filterAppointment.dto';
import { AdmissionStatusEnum } from 'src/patients/enum/admissionStatus.enum';
import { PatientDocument } from 'src/patients/schema/patients.schema';
import { DesignationEventEnum } from 'src/role/event/role.event';
import {
  TransactionTypeNameEnum,
  TransactionTypeStatusEnum,
} from 'src/transaction-types/enums/transaction-type.enum';
import { UserDocument } from 'src/user/schema/user.schema';
import { getDiffereceInDays } from 'src/utils/constants/constant';
import { CreateWardDto, UpdateWardDto } from '../dto/ward.dto';
import { WardEventEnum } from '../events/ward.event';
import { WardsService } from '../service/wards.service';

@ApiBearerAuth('Bearer')
@ApiTags('Wards')
@Controller('wards')
export class WardsController {
  constructor(
    private readonly wardService: WardsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiBody({
    type: CreateWardDto,
    description: 'creates a ward request body',
  })
  //we want to create wards
  @Post('create-ward')
  async createWard(@Body() body: CreateWardDto) {
    const data = await this.wardService.create(body);
    const payload = {
      ward: data,
      type: TransactionTypeNameEnum.ADMISSION,
      status: TransactionTypeStatusEnum.ACTIVE,
      amount: body.amount,
    };
    this.eventEmitter.emit(
      DesignationEventEnum.TRANSACTION_TYPE_CREATED,
      payload,
    );
    return data;
  }

  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search query',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page query',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit query',
  })
  //we want to get all wards
  @Get('get-all-wards')
  async findAll(
    @Query('search') search: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.wardService.findAll(page, limit, search);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'updates a ward by id',
  })
  @ApiBody({
    type: UpdateWardDto,
    description: 'updates a ward request body',
  })
  @Patch('edit-ward/:id')
  async update(@Param('id') id: string, @Body() body: UpdateWardDto) {
    const wardBeforeUpdate = await this.wardService.getWardById(id);
    const designationName = wardBeforeUpdate.name;
    const data = await this.wardService.update(id, body);
    const payloadAfterUpdate = {
      ward: data,
      type: TransactionTypeNameEnum.ADMISSION,
      status: TransactionTypeStatusEnum.ACTIVE,
      amount: body.amount,
      previousSpecialty: designationName,
    };
    this.eventEmitter.emit(
      DesignationEventEnum.DESIGNATION_AFTER_UPDATE,
      payloadAfterUpdate,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'admit patient to ward by id',
  })
  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'admit patient to ward by patient id',
  })
  @Patch('admit-patient-to-ward/:id/:patientId')
  async admitPatientToWard(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
  ) {
    return await this.wardService.admitPatientToWard(id, patientId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'discharge patient from ward by id',
  })
  @ApiBody({
    type: 'string',
    description: 'discharge patient from ward request body',
  })
  @Patch('discharge-patient-from-ward/:id')
  async dischargePatientFromWard(
    @Param('id') id: string,
    @Body() body: { date: string; patientId: string },
  ) {
    const response = await this.wardService.dischargePatientFromWard(
      id,
      body.patientId,
      body.date,
    );
    //emit an event with payload of patientId and number of days spent in the hospital
    const admissionDate = response.admissionDate;
    const dischargeDate = response.dischargeDate;
   
    const diffInDays = getDiffereceInDays(new Date(admissionDate), new Date(dischargeDate));
    //get ward name
    const ward = await this.wardService.getWardById(id);

    const payload = {
      patient: body.patientId,
      numberOfDays: diffInDays,
      ward: ward,
    };
    this.eventEmitter.emit(WardEventEnum.PATIENT_DISCHARGED, payload);
    return response.updatedWard;
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'transfer patient fromOneWard to another by id',
  })
  @ApiBody({
    type: 'string',
    description: 'transfer patient fromOneWard to another request body',
  })
  @Patch('transfer-patient/:id')
  async transferPatientFromOneWardToAnother(
    @Param('id') id: string,
    @Body() body: { patientId: string; wardId: string },
  ) {
    const response = await this.wardService.transferPatientFromOneWardToAnother(
      id,
      body.patientId,
      body.wardId,
    );
     //emit an event with payload of patientId and number of days spent in the hospital
     const admissionDate = response.admissionDate;
    
    const diffInDays = getDiffereceInDays(new Date(admissionDate), new Date());
      //get ward name
    const ward = await this.wardService.getWardById(id);
     const payload = {
       patient: body.patientId,
       numberOfDays: diffInDays,
        ward: ward,
     };
     this.eventEmitter.emit(WardEventEnum.PATIENT_DISCHARGED, payload);
    return response.updatedWard;
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete ward by id',
  })
  @Delete('delete-ward/:id')
  async deleteWard(@Param('id') id: string) {
    return await this.wardService.deleteWard(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'discharge patient for death by id',
  })
  @ApiBody({
    type: 'string',
    description: 'discharge patient for death request body',
  })
  @Patch('record-death/:id')
  async dischargePatientForDeath(
    @Param('id') id: string,
    @Body() body: { patientId: string; reasonForDeath: string },
  ) {
    const response = await this.wardService.dischargePatientForDeath(
      id,
      body.patientId,
      body.reasonForDeath,
    );
     //emit an event with payload of patientId and number of days spent in the hospital
     const admissionDate = response.admissionDate;
     const dischargeDate = response.dischargeDate;
    
     const diffInDays = getDiffereceInDays(new Date(admissionDate), new Date(dischargeDate));
     //get ward name
    const ward = await this.wardService.getWardById(id);
     const payload = {
       patient: body.patientId,
       numberOfDays: diffInDays,
        ward: ward.name,
     };
     this.eventEmitter.emit(WardEventEnum.PATIENT_DISCHARGED, payload);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'get patients in single ward by id',
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search query',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page query',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit query',
  })
  @Get('get-single-ward/:id')
  async getPatientsInSingleWard(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() query: FilterQuery<PatientDocument>,
  ) {
    return await this.wardService.getPatientsInSingleWard(
      id,
      page,
      limit,
      query,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'get staff in single ward by id',
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search query',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'page query',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'limit query',
  })
  //get staff in single ward
  @Get('get-staff-in-single-ward/:id')
  async getStaffInSingleWard(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return await this.wardService.getStaffInSingleWard(id, page, limit, search);
  }

  //delete ward
  // @Delete('delete-ward/:id')
  // async deleteWard(@Param('id') id: string) {
  //   return await this.wardService.deleteWardIfEmpty(id);
  // }
}
