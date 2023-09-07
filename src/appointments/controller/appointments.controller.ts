import {
  Controller,
  Patch,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { string } from 'joi';
import { FilterQuery } from 'mongoose';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { PaymentEventEnum } from 'src/payment/event/payment.event';
import { TransactionTypeService } from 'src/transaction-types/services/transaction-type.service';
import { UserService } from 'src/user/services/user.service';
import {
  CreateAppointmentDto,
  FollowUpAppointmentDto,
  RescheduleAppointmentDto,
} from '../dto/appointment.dto';
import {
  FilterAppointmentDto,
  UpcomingDoctorDto,
} from '../dto/filterAppointment.dto';
import { AppointmentsService } from '../service/appointments.service';

@ApiBearerAuth('Bearer')
@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentService: AppointmentsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionTypeService: TransactionTypeService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({
    type: 'string',
    description: 'creates a generalist appointment for a patient',
  })
  @Post('create-generalist-appointment')
  async createGeneralistAppointment(@Body('patientId') patientId: string) {
    const data = await this.appointmentService.createGeneralistAppointment(
      patientId,
    );
    const getTransactionType =
      await this.transactionTypeService.getTransactionTypeByName(
        'General Consultation',
      );
    const paymentPayload = {
      patient: patientId,
      transactionType: getTransactionType.type,
      totalCost: getTransactionType.amount,
      itemToPayFor: data.id,
      model: 'AppointmentEntity',
    };
    this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED, paymentPayload);
    return data;
  }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'gets a single appointment for a patient',
  })
  @Get('get-appointment/:appointmentId')
  async getAppointment(@Param('appointmentId') appointmentId: string) {
    return await this.appointmentService.getAppointmentById(appointmentId);
  }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'update a single appointment for a patient',
  })
  @Patch('update-appointment/:appointmentId')
  async updateAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() body: string,
  ) {
    return await this.appointmentService.updateAppointmentStatus(
      appointmentId,
      body,
    );
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
  // @ApiQuery({
  //   name: 'query',
  //   type: 'string',
  //   description: 'query string',
  // })
  @Get('get-all-appointments')
  async getAllAppointments(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() query: FilterQuery<string>,
  ) {
    return await this.appointmentService.getAllAppointments(query, page, limit);
  }

  @ApiParam({
    name: 'patientId',
    type: 'string',
    description: 'get all appointments for a patient',
  })
  @ApiBody({
    type: FilterPatientDto,
    description: 'filter appointments for a patient',
  })
  @Post('get-all-appointments-by-patient/:patientId')
  getAppointmentByPatient(
    @Param('patientId') patientId: string,
    @Body() body?: FilterPatientDto,
  ) {
    return this.appointmentService.getAppointmentByPatient(patientId, body);
  }

  @ApiParam({
    name: 'doctorId',
    type: 'string',
    description: 'get all appointments for a doctor',
  })
  @Post('get-all-appointments-by-doctor/:doctorId')
  getAppointmentByDoctor(
    @Param('doctorId') doctorId: string,
    @Body() body: FilterAppointmentDto,
  ) {
    return this.appointmentService.getAppointmentsByDoctor(doctorId, body);
  }

  @ApiParam({
    name: 'departmentId',
    type: 'string',
    description: 'get all appointments for a department',
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
  @Get('get-all-appointments-by-department/:departmentId')
  getAppointmentByDepartment(
    @Param('departmentId') departmentId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.appointmentService.getAppointmentByDepartment(
      departmentId,
      page,
      limit,
    );
  }

  @Get('get-appointment-by-date')
  getAppointmentsByDate(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Body() body?: FilterAppointmentDto,
  ) {
    return this.appointmentService.getAppointmentsByDate(page, limit, body);
  }

  @ApiBody({
    type: CreateAppointmentDto,
    description: 'creates a specialist appointment for a patient',
  })
  @Post('create-appointment')
  async createAppointment(@Body() body: CreateAppointmentDto) {
    const data: any = await this.appointmentService.createAppointment(body);
    // const getTransactionType = await this.transactionTypeService.getTransactionTypeByName('Specialist Consultation');
    //get the doctor's designation
    const doctor = await this.userService.getStaff(body.doctor);
    //get the doctor's designation
    const designation = doctor.designation.name;
    const getTransactionType =
      await this.transactionTypeService.getTransactionTypeByName(designation);
    //if data is of type array, loop through and create payment for each appointment
    if (Array.isArray(data)) {
      data.forEach((appointment) => {
        const paymentPayload = {
          patient: body.patient,
          transactionType: getTransactionType.type,
          totalCost: getTransactionType.amount,
          itemToPayFor: appointment.id,
          model: 'AppointmentEntity',
        };
        this.eventEmitter.emit(
          PaymentEventEnum.PAYMENT_CREATED,
          paymentPayload,
        );
      });
    }
    //if data is of type object, create payment for the appointment
    const paymentPayload = {
      patient: body.patient,
      transactionType: getTransactionType.type,
      totalCost: getTransactionType.amount,
      itemToPayFor: data.id,
      model: 'AppointmentEntity',
    };
    this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED, paymentPayload);
    return data;
  
  }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'reschedules a specialist appointment for a patient',
  })
  @ApiBody({
    type: RescheduleAppointmentDto,
    description: 'reschedules a specialist appointment for a patient',
  })
  @Patch('reschedule-appointment/:appointmentId')
  async rescheduleAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() body: RescheduleAppointmentDto,
  ) {
    return await this.appointmentService.rescheduleAppointment(
      appointmentId,
      body,
    );
  }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'cancels a specialist appointment for a patient',
  })
  @Patch('cancel-appointment/:appointmentId')
  async cancelAppointment(@Param('appointmentId') appointmentId: string) {
    return await this.appointmentService.deleteAppointment(appointmentId);
  }

  @ApiBody({
    type: FilterAppointmentDto,
    description: 'filter upcoming appointments for a specialist',
  })
  @Post('get-specialist-appointments')
  async filterUpcomingAppointments(@Body() body: FilterAppointmentDto) {
    return await this.appointmentService.filterUpcomingAppointments(body);
  }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'marks a specialist appointment as completed',
  })
  @Patch('start-appointment/:appointmentId')
  markAppointmentAsCompleted(@Param('appointmentId') appointmentId: string) {
    return this.appointmentService.startAppointment(appointmentId);
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
  @Get('get-generalist-appointments')
  async getGeneralistAppointments(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return await this.appointmentService.getGeneralistAppointments(
      page,
      limit,
      search,
    );
  }

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
  // @Get('filter-upcoming-generalist')
  // async filterUpcomingGeneralistAppointments(
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  // ) {
  //   return await this.appointmentService.filterUpcomingGeneralistAppointments(
  //     page,
  //     limit,
  //   );
  // }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'marks a generalist appointment as completed',
  })
  @Patch('open-appointment/:appointmentId/:doctorId')
  async updateAppointmentIsOpenedBy(
    @Param('appointmentId') appointmentId: string,
    @Req() req: any,
  ) {
    return await this.appointmentService.updateAppointmentIsOpenedBy(
      appointmentId,
      req,
    );
  }

  @ApiParam({
    name: 'appointmentId',
    type: 'string',
    description: 'marks a generalist appointment as completed',
  })
  @Patch('close-appointment/:appointmentId')
  async updateAppointmentIsSeenCompleted(
    @Param('appointmentId') appointmentId: string,
    @Req() req: any,
  ) {
    return await this.appointmentService.updateAppointmentIsSeenCompleted(
      appointmentId,
      req,
    );
  }

  @ApiBody({
    type: UpcomingDoctorDto,
    description: 'doctor appointments req body',
  })
  @Post('upcoming-specialist-doctor')
  async getUpcomingSpecialistAppointments(
    @Req() req: any,
    @Body() data: UpcomingDoctorDto,
  ) {
    return await this.appointmentService.getUpcomingSpecialistAppointments(
      req,
      data,
    );
  }

  @ApiBody({
    type: UpcomingDoctorDto,
    description: 'doctor get history',
  })
  @Post('history-appointments-of-doctor')
  async getHistoryAppointments(
    @Req() req: any,
    @Body() data?: UpcomingDoctorDto,
  ) {
    console.log(data);
    return await this.appointmentService.getHistoryAppointments(req, data);
  }

  @ApiParam({
    name: 'doctorId',
    type: 'string',
    description: 'doctor id',
  })
  @Get('get-doctor-stat/:doctorId')
  async getTotalPatientsSeenByDoctor(@Param('doctorId') doctorId: string) {
    return await this.appointmentService.getTotalPatientsSeenByDoctor(doctorId);
  }

  @Get('logged-in-doctor-stat')
  async getLoggedInDoctorStat(@Req() req: any) {
    return await this.appointmentService.getLoggedInDoctorStat(req);
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
    description: 'search query',
  })
  @Get('get-upcoming-generalist-doctor-appointment')
  async getUpcomingGeneralistDoctorAppointments(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.appointmentService.getUpcomingGeneralistAppointments(
      page,
      limit,
      search,
    );
  }

  @Get('get-total-patients-seen')
  async totalPatientsSeen() {
    return await this.appointmentService.getTotalPatientsSeenByAllDoctors();
  }

  @ApiParam({
    type: string,
    name: 'appointmentId',
  })
  @Patch('end-appointment/:appointmentid')
  async endAppointment(
    @Param('appointmentId') appointmentId: string,
    @Req() req: any,
  ) {
    return await this.appointmentService.updateAppointmentIsSeenCompleted(
      appointmentId,
      req,
    );
  }

  @ApiParam({
    type: string,
    name: 'appointmentId',
  })
  @Patch('open-appointment/:appointmentid')
  async openAppointment(
    @Param('appointmentId') appointmentId: string,
    @Req() req: any,
  ) {
    return await this.appointmentService.updateAppointmentIsOpenedBy(
      appointmentId,
      req,
    );
  }

  @ApiParam({
    type: string,
    name: 'patientId',
  })
  @Get('get-running-appointment/:patientId')
  async getRunningAppointment(@Param('patientId') patientId: string) {
    return await this.appointmentService.getRunningAppointmentByPatient(
      patientId,
    );
  }

  @ApiParam({
    type: FilterPatientDto,
    name: 'filterPatientDto',
  })
  @Post('pending-patient-appointments/:patientId')
  async getPendingPatientAppointments(
    @Param('patientId') patientId: string,
    @Body() filterPatientDto: FilterPatientDto,
  ) {
    return await this.appointmentService.getPendingAppointmentByPatient(
      patientId,
      filterPatientDto,
    );
  }

  @ApiParam({
    type: FilterPatientDto,
    name: 'filterPatientDto',
  })
  @Post('history-patient-appointments/:patientId')
  async getHistoryPatientAppointments(
    @Param('patientId') patientId: string,
    @Body() filterPatientDto: FilterPatientDto,
  ) {
    return await this.appointmentService.getAppointmentHistoryByPatient(
      patientId,
      filterPatientDto,
    );
  }

  @Post('mobile/book-self-generalist-appointment')
  async bookSelfGeneralistAppointment(@Req() req: any) {
    return await this.appointmentService.bookGeneralistAppointment(req);
  }

  //get self appointment
  @Get('mobile/get-self-appointment')
  async getSelfAppointment(@Req() req: any) {
    return await this.appointmentService.getLoggedInUserBookedAppointments(req);
  }

  @Get('mobile/get-upcoming-appointment')
  async getUpcomingAppointment(@Req() req: any) {
    return await this.appointmentService.loggedInUpcomingSpecialistAppointments(
      req,
    );
  }

  @ApiBody({
    type: FollowUpAppointmentDto,
    description: 'follow up appointment',
  })
  @ApiParam({
    name: 'followUpId',
    type: 'string',
    description: 'follow up id',
  })
  @Post('create-follow-up-appointment/:followUpId')
  async createFollowUpAppointment(
    @Param('followUpId') followUpId: string,
    @Body() followUpAppointmentDto: CreateAppointmentDto,
  ) {
    const data = await this.appointmentService.createFollowUpAppointment(
      followUpId,
      followUpAppointmentDto,
    );
 
     const doctor = await this.userService.getStaff(followUpAppointmentDto.doctor);
    //get the doctor's designation
    const designation = doctor.designation.name;
    const getTransactionType =
      await this.transactionTypeService.getTransactionTypeByName(designation);
    //if data is of type array, loop through and create payment for each appointment
    if (Array.isArray(data)) {
      data.forEach((appointment) => {
        const paymentPayload = {
          patient: followUpAppointmentDto.patient,
          transactionType: getTransactionType.type,
          totalCost: getTransactionType.amount,
          itemToPayFor: appointment.id,
          model: 'AppointmentEntity',
        };
        this.eventEmitter.emit(
          PaymentEventEnum.PAYMENT_CREATED,
          paymentPayload,
        );
      });
    }
    //if data is of type object, create payment for the appointment
    const paymentPayload = {
      patient: followUpAppointmentDto.patient,
      transactionType: getTransactionType.type,
      totalCost: getTransactionType.amount,
      itemToPayFor: data.id,
      model: 'AppointmentEntity',
    };
    this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED, paymentPayload);
    return data
  }
}
