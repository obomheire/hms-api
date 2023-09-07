import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';

import Api from 'twilio/lib/rest/Api';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import {
  CreateInvestigationDto,
  IndividualInvestigationDto,
  InvestigationDto,
  UpdateInvestigationDto,
} from '../dto/investigation.dto';
import { InvestigationService } from '../service/investigation.service';
import { CreateTestEventEnums } from '../events/patient.event';
import { IResponse } from 'src/utils/constants/constant';
import { PaymentEventEnum } from 'src/payment/event/payment.event';

@ApiBearerAuth('Bearer')
@ApiTags('Investigations')
@Controller('investigation')
export class InvestigationController {
  constructor(
    private readonly investigationService: InvestigationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  //create investigation
  @ApiBody({
    type: CreateInvestigationDto,
    description: 'create investigation request body',
  })
  @Post()
  async createInvestigation(@Body() body: InvestigationDto, @Req() req: any) {
    const data = await this.investigationService.createInvestigation(body, req);
    data.forEach((investigation) => {
    const payload = {
      patient: investigation.patient,
      transactionType: 'LABORATORY',
      totalCost: investigation.totalCost,
      itemToPayFor: investigation._id,
      model: 'InvestigationEntity',
    };
    console.log(payload, 'payload')
    this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED, payload);
    });
    return data;
  }

  //update investigation
  @ApiParam({
    name: 'investigationId',
    type: 'string',
    description: 'update investigation with id',
  })
  @ApiBody({
    type: UpdateInvestigationDto,
    description: 'update investigation request body',
  })
  @Patch(':investigationId')
  async updateInvestigation(
    @Param('investigationId') investigationId: string,
    @Body() body: UpdateInvestigationDto,
  ) {
    return await this.investigationService.updateInvestigation(
      body,
      investigationId,
    );
  }

  //delete investigation
  @ApiParam({
    name: 'investigationId',
    type: 'string',
    description: 'delete investigation with id',
  })
  @Delete(':investigationId')
  async deleteInvestigation(@Param('investigationId') investigationId: string) {
    return await this.investigationService.deleteInvestigation(investigationId);
  }

  //get investigation
  @ApiParam({
    name: 'investigationId',
    type: 'string',
    description: 'gets a single investigation with id',
  })
  @Get('get-investigation/:investigationId')
  async getInvestigation(@Param('investigationId') investigationId: string) {
    return await this.investigationService.getInvestigation(investigationId);
  }

  //get all investigations
  @Get('get-patient-investigations/:patientId')
  async getAllInvestigations(@Param('patientId') patientId: string) {
    console.log('hi');
    return await this.investigationService.getInvestigations(patientId);
  }

  //delete an investigation
  @ApiParam({
    name: 'investigationId',
    type: 'string',
    description: 'delete an investigation with id',
  })
  // @Delete(':investigationId')
  // async deleteAnInvestigation(
  //   @Param('investigationId') investigationId: string,
  // ) {
  //   return await this.investigationService.deleteInvestigation(investigationId);
  // }
  @ApiBody({
    type: FilterPatientDto,
    description: 'filter patient request body',
  })

  //get pending investigations
  @Post('pending')
  async getPendingInvestigations(@Body() body?: FilterPatientDto) {
    return await this.investigationService.getPendingInvestigations(body);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'filter patient request body',
  })
  @Post('completed')
  async getCompletedInvestigations(@Body() body?: FilterPatientDto) {
    return await this.investigationService.getCompletedInvestigations(body);
  }

  //get investigation stats
  @Get('test-stats')
  async getStats() {
    return await this.investigationService.getInvestigationStats();
  }

  //get pending investigations grouped by test
  @Get('pending-grouped')
  async getPendingGrouped() {
    return await this.investigationService.getPendingInvestigationsGroupedByTest();
  }

  //get investigations for a logged in patient
  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'search investigations by name',
  })
  @Get('mobile/patient-investigations')
  async getPatientInvestigations(
    @Req() req: any,
    @Query('search') search?: string,
  ) {
    return await this.investigationService.getInvestigationsByPatientLoggedIn(
      req,
      search,
    );
  }

  @ApiParam({
    name: 'investigationId',
    type: 'string',
    description: 'gets a single investigation with id',
  })
  @Get('mobile/patient-investigation-result/:investigationId')
  async getPatientInvestigationResult(
    @Param('investigationId') investigationId: string,
    @Res() res,
  ) {
    const pdf = await this.investigationService.getInvestigationResult(
      investigationId,
    );
    res.contentType('application/pdf');
    res.send(pdf);
  }

  @ApiParam({
    name: 'investigationId',
    type: 'string',
    description: 'gets a single investigation with id',
  })
  @Patch('fill-investigation-result/:investigationId')
  async fillInvestigationResult(
    @Param('investigationId') investigationId: string,
    @Body() dynamicFields: { [key: string]: string | number | boolean },
  ) {
    return await this.investigationService.updateInvestigationResult(
      investigationId,
      dynamicFields,
    );
  }

  //create individual investigation
  @ApiBody({
    type: IndividualInvestigationDto,
    description: 'create investigation request body',
  })
  @Post('mobile/individual')
  async createIndividualInvestigation(
    @Body() body: IndividualInvestigationDto,
    @Req() req: any,
  ): Promise<IResponse> {
    const { newInvestigations: data, errorResponse } =
      await this.investigationService.createInvestigationForIndividual(
        body,
        req,
      );
    const payload = [];
    data.forEach((investigation) => {
      const item = {
        patient: req.user,
        investigation: investigation._id,
        date: investigation.date,
      };
      const paymentPayload = {
        patient: req.user,
        transactionType: 'LABORATORY',
        totalCost: investigation.totalCost,
        itemToPayFor: investigation._id,
        model: 'InvestigationEntity',
        reference: body.reference,
      };
      this.eventEmitter.emit(PaymentEventEnum.PAYMENT_CREATED_FROM_MOBILE_ORDER, paymentPayload);

      payload.push(item);
    });
    payload.length > 0
      ? this.eventEmitter.emit(
          CreateTestEventEnums.CREATE_INDIVIDUAL_TEST,
          payload,
        )
      : null;
    return {
      status: HttpStatus.OK,
      message: 'success',
      data: {
        data,
        errorResponse,
      },
    };
  }
}
