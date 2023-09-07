import {
  Body,
  Controller,
  Get,
  Req,
  Patch,
  Post,
  Query,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import {
  ChangePasswordDto,
  CreatePatientDto,
  CreatePatientLoginDto,
  ForgotPasswordDto,
  PatientLoginDto,
  PatientResetPasswordDto,
  UpdatePatientDto,
} from '../dto/patients.dto';
import { ReferPatientDto } from '../dto/referPatient.dto';
import { ScheduleDischargeDto } from '../dto/scheduleDischarge.dto';
import { TransferPatientDto } from '../dto/transferPatient.dto';
// import { UpdateVisitDto, VisitDto } from '../dto/visit-item.dto';
import { PatientEntity } from '../schema/patients.schema';
import { PatientsService } from '../service/patients.service';
import { Request } from 'express';
import {
  ApiBody,
  ApiParam,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('Bearer')
@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @ApiBody({
    type: CreatePatientDto,
    description: 'create patient request body',
  })
  @Post('add-patient')
  async addPatient(@Body() body: CreatePatientDto) {
    return await this.patientsService.createPatient(body);
  }

  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'gets a single patient with id',
  })
  @Get('get-patient/:patientId')
  async getPatient(@Param('patientId') patientId: string) {
    return await this.patientsService.getPatient(patientId);
  }

  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'update patient with id',
  })
  @ApiBody({
    type: UpdatePatientDto,
    description: 'update patient request body',
  })
  @Patch('update-patient/:patientId')
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() body: UpdatePatientDto,
  ) {
    return await this.patientsService.updatePatient(patientId, body);
  }

  // We want to get all patients and search through them, we want to return 10 pages at a time
  @ApiBody({
    type: FilterPatientDto,
    description: 'get all patients by filter request body',
  })
  @Post('get-all-patients')
  async getPatients(@Body() filterPatientDto: FilterPatientDto) {
    return await this.patientsService.getPatients(filterPatientDto);
  }

  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'delete patient with id',
  })
  @Delete('delete-patient/:patientId')
  async deletePatient(@Param('patientId') patientId: string) {
    return await this.patientsService.deletePatient(patientId);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'filter patients between two dates request body',
  })
  @Get('filter-by-date')
  async filterByDate(@Body() data: FilterPatientDto) {
    return await this.patientsService.filterPatientsBetweenTwoDates(data);
  }

  // @Get('filter-a-date')
  // async filterADate(@Body() data: FilterPatientDto) {
  //   return await this.patientsService.filterPatientsByDate(data);
  // }

  @ApiQuery({
    name: 'status',
    type: 'string',
    description: 'filter patients by status',
  })
  @Get('filter-by-status')
  async filterByStatus(@Query('status') status: string) {
    return await this.patientsService.filterPatientsByStatus(status);
  }

  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'refer patient with id',
  })
  @ApiBody({
    type: ReferPatientDto,
    description: 'refer patient request body',
  })
  @Patch('refer-patient/:id')
  async referPatient(@Param('id') id: string, @Body() body: ReferPatientDto) {
    return await this.patientsService.referPatient(id, body);
  }

  // @ApiParam({
  //   name: 'patientId',
  //   type: Types.ObjectId,
  //   description: 'get patient visit by patient id',
  // })
  // @ApiParam({
  //   name: 'visitId',
  //   type: Types.ObjectId,
  //   description: 'get patient visit by visit id',
  // })
  // @Get('get-visit/:patientId/:visitId')
  // async getVisit(
  //   @Param('patientId') patientId: Types.ObjectId,
  //   @Param('visitId') visitId: Types.ObjectId,
  // ) {
  //   return await this.patientsService.getPatientVisit(patientId, visitId);
  // }

  // @ApiBody({
  //   type: FilterPatientDto,
  //   description:
  //     'get all pending investigation request body, search by first name last name and patient id',
  // })
  // @Get('get-pending-investigations')
  // async getPendingInvestigations(
  //   @Body() filterInvestigationDto: FilterPatientDto,
  // ) {
  //   return await this.patientsService.getPendingInvestigations(
  //     filterInvestigationDto,
  //   );
  // }

  // @ApiParam({
  //   name: 'id',
  //   type: Types.ObjectId,
  //   description: 'get investigation by id',
  // })
  // @Get('get-investigation/:id')
  // async getInvestigation(@Param('id') id: Types.ObjectId) {
  //   return await this.patientsService.getInvestigation(id);
  // }

  // @ApiBody({
  //   type: FilterPatientDto,
  //   description: 'get all visits request body',
  // })
  // @Get('get-visits')
  // async getAllVisits(@Body() body: FilterPatientDto) {
  //   return await this.patientsService.getAllVisits(body);
  // }

  // @ApiParam({
  //   name: 'id',
  //   type: Types.ObjectId,
  //   description: 'delete investigation by id',
  // })
  // @Delete('delete-investigation/:id')
  // async deleteInvestigation(@Param('id') id: Types.ObjectId) {
  //   return await this.patientsService.deleteInvestigation(id);
  // }

  // @ApiParam({
  //   name: 'id',
  //   type: Types.ObjectId,
  //   description: 'get patient visits by id',
  // })
  // @ApiBody({
  //   type: FilterPatientDto,
  //   description: 'get patient visits request body',
  // })
  // @Post('filter-visits-patient/:id')
  // async getPatientVisits(
  //   @Param('id') id: Types.ObjectId,
  //   @Body() data: FilterPatientDto,
  // ) {
  //   return await this.patientsService.getPatientVisits(id, data);
  // }

  // @ApiParam({
  //   name: 'id',
  //   type: Types.ObjectId,
  //   description: 'get patient visits by id',
  // })
  // @ApiParam({
  //   name: 'visitId',
  //   type: Types.ObjectId,
  //   description: 'get patient visits by visitId',
  // })
  // @ApiBody({
  //   type: FilterPatientDto,
  //   description: 'get patient visits request body',
  // })
  // @Patch('update-visit/:id/:visitId')
  // async updateVisit(
  //   @Param('id') id: Types.ObjectId,
  //   @Param('visitId') visitId: Types.ObjectId,
  //   @Body() body: UpdateVisitDto,
  // ) {
  //   return await this.patientsService.updatePatientVisit(id, visitId, body);
  // }

  @ApiBody({
    type: FilterPatientDto,
    description: 'get emergency list request body',
  })
  @Post('get-emergency-list')
  async getEmergencyList(@Body() data?: FilterPatientDto) {
    return await this.patientsService.getEmergencyList(data);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'add emergency patient by id',
  })
  @Patch('add-emergency-patient/:id')
  async addEmergencyPatient(@Param('id') id: string) {
    return await this.patientsService.addEmergencyPatient(id);
  }

  @ApiBody({
    type: CreatePatientDto,
    description: 'create emergency patient request body',
  })
  @Post('create-emergency-patient')
  async createEmergencyPatient(@Body() body: CreatePatientDto) {
    return await this.patientsService.createEmergencyPatient(body);
  }

  @ApiQuery({
    name: 'page',
    type: 'number',
    description: 'get patient discharge list page',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'get patient discharge list limit',
  })
  @Get('get-discharge-list')
  async getPatientDischargeList(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return await this.patientsService.getPatientDischargeList(
      search,
      page,
      limit,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'schedule patient discharge by id',
  })
  @ApiBody({
    type: ScheduleDischargeDto,
    description: 'schedule patient discharge request body',
  })
  @Patch('schedule-discharge/:id')
  async scheduleDischarge(
    @Param('id') id: string,
    @Body() body: ScheduleDischargeDto,
  ) {
    return await this.patientsService.scheduleDischarge(id, body);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'get patient discharge list request body',
  })
  @Post('pending-discharge-list')
  async getPendingDischargeList(@Body() data?: FilterPatientDto) {
    return await this.patientsService.getPendingDischargePatients(data);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'get patient discharge list request body',
  })
  @Post('admission-list')
  async getAdmittedPatients(@Body() body?: FilterPatientDto) {
    return await this.patientsService.getAdmittedPatients(body);
  }

  //discharge patient
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'discharge patient by id',
  })
  @Patch('discharge-patient/:id')
  async dischargePatient(@Param('id') id: string) {
    return await this.patientsService.dischargePatient(id);
  }

  @Post('discharge')
  async dischargeAPatient(@Body('id') id: string) {
    return await this.patientsService.dischargePatient(id);
  }

  //create login credentials
  @ApiBody({
    type: CreatePatientLoginDto,
    description: 'create login credentials request body',
  })
  @Post('create-login-credentials')
  async createLoginCredentials(@Body() body: CreatePatientLoginDto) {
    return await this.patientsService.createLoginCredentials(body);
  }

  //patient login
  @ApiBody({
    type: PatientLoginDto,
    description: 'patient login request body',
  })
  @Post('mobile/patient-login')
  async patientLogin(@Body() body: PatientLoginDto) {
    return await this.patientsService.patientLogin(body);
  }

  //forgot password
  @ApiBody({
    type: PatientLoginDto,
    description: 'forgot password request body',
  })
  @Post('mobile/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.patientsService.forgotPassword(body);
  }

  // reset password
  @ApiBody({
    type: PatientResetPasswordDto,
    description: 'reset password request body',
  })
  @Post('mobile/reset-password')
  async resetPassword(@Body() body: PatientResetPasswordDto) {
    return await this.patientsService.resetPassword(body);
  }

  //change password
  @ApiBody({
    type: ChangePasswordDto,
    description: 'change password request body',
  })
  @Post('mobile/change-password')
  async changePassword(@Body() body: ChangePasswordDto, @Req() req: any) {
    return await this.patientsService.changePassword(body, req);
  }

  //get patient details
  // @ApiParam({
  //   name: 'id',
  //   type: 'string',
  //   description: 'get patient details by id',
  // })
  @Get('mobile/get-self')
  async getPatientDetails(@Req() req: any) {
    return await this.patientsService.getPatientDetails(req);
  }

  //update patient details
  @ApiBody({
    type: UpdatePatientDto,
    description: 'update patient details request body',
  })
  @UseInterceptors(FileInterceptor('filename'))
  @Post('mobile/update-self')
  async updatePatientDetails(
    @Body() body: UpdatePatientDto,
    @Req() req: any,
    @UploadedFile() filename?: Express.Multer.File,
  ) {
    console.log(req, 'req')
    console.log(req.user, 'req.user')
    return await this.patientsService.updatePatientDetails(body, req, filename);
  }
}
