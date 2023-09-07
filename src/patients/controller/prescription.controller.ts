import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import {
  PharmacyPrescriptionDto,
  UpdatePharmacyPrescriptionDto,
} from '../dto/pharmacyPrescription.dto';
import { PrescriptionService } from '../service/precription.service';
import { Request } from 'express';
import { TakeOrSkipDosesDto } from '../dto/follow-up.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@ApiBearerAuth('Bearer')
@ApiTags('Prescriptions')
@Controller('prescription')
export class PrescriptionController {
  constructor(
    private readonly prescriptionService: PrescriptionService,
    ) {}

  //create prescription
  @ApiBody({
    type: PharmacyPrescriptionDto,
    description: 'create prescription request body',
  })
  @Post()
  async createPrescription(
    @Body() body: PharmacyPrescriptionDto,
    @Req() req: any,
  ) {
    return await this.prescriptionService.createPrescription(body, req);

  }

  //update prescription
  @ApiParam({
    name: 'prescriptionId',
    type: 'string',
    description: 'update prescription with id',
  })
  @ApiBody({
    type: UpdatePharmacyPrescriptionDto,
  })
  @Patch(':prescriptionId')
  async updatePrescription(
    @Param('prescriptionId') prescriptionId: string,
    @Body() body: UpdatePharmacyPrescriptionDto,
  ) {
    return await this.prescriptionService.updatePrescription(
      prescriptionId,
      body,
    );
  }

  //delete prescription
  @ApiParam({
    name: 'prescriptionId',
    type: 'string',
    description: 'delete prescription with id',
  })
  @Delete(':prescriptionId/delete')
  async deletePrescription(@Param('prescriptionId') prescriptionId: string) {
    return await this.prescriptionService.deletePrescription(prescriptionId);
  }

  //get prescription
  @ApiParam({
    name: 'prescriptionId',
    type: 'string',
  })
  @Get('single/:prescriptionId')
  async getPrescription(@Param('prescriptionId') prescriptionId: string) {
    return await this.prescriptionService.getPrescription(prescriptionId);
  }

    //get all prescription for  patient
    @ApiParam({
      type: 'string',
      name: 'patientId',
      description: 'get all prescription for patient with id',
    })
    @ApiQuery({
      type: PaginationDto,
      name: 'query',
      description: 'pagination query',
      required: false,
    })
    @Get(':patientId')
    async getAllPrescriptionForPatient(@Param('patientId') patientId: string, @Query() query: PaginationDto) {
      return await this.prescriptionService.getPrescriptionsByPatient(patientId, query);
    }

  //get pending prescriptions for a patient
  @ApiParam({
    type: 'string',
    name: 'patientId',
    description: 'get pending prescriptions for patient with id',
  })
  @Get('patient/:patientId/pending')
  async getPendingPrescriptionsForPatient(
    @Param('patientId') patientId: string,
  ) {
    return await this.prescriptionService.getPendingPrescriptionsByPatient(
      patientId,
    );
  }

  //get all prescriptions
  @ApiBody({
    type: FilterPatientDto,
    description: 'get all prescriptions',
  })
  @Post('all')
  async getAllPrescriptionsForPharmacy(@Body() body?: FilterPatientDto) {
    return await this.prescriptionService.getAllPrescriptions(body);
  }

  //get pending prescriptions
  @ApiBody({
    type: FilterPatientDto,
    description: 'get pending prescriptions',
  })
  @Post('pending')
  async getPendingPrescriptionsForPharmacy(@Body() body?: FilterPatientDto) {
    return await this.prescriptionService.getPendingPrescriptions(body);
  }

  //get completed prescriptions
  @ApiBody({
    type: FilterPatientDto,
    description: 'get completed prescriptions',
  })
  @Post('completed')
  async getCompletedPrescriptionsForPharmacy(@Body() body?: FilterPatientDto) {
    return await this.prescriptionService.getCompletedPrescriptions(body);
  }

  // Login patient to be able to get the history of his/her priscription
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
  
  @Get('mobile/patient/get-all-prescription')
  async getAllPrescriptionsForPatient(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.prescriptionService.getAllPrescriptionsForPatient(
      req,
      page,
      limit,
    );
  }

  //get billed prescriptions
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
  
  @Get('mobile/patient/get-billed-prescription')
  async getBilledPrescriptionsForPharmacy(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.prescriptionService.getBilledPrescriptionsForPatient(
      req,
      page,
      limit,
    );
  }

  //get dispensed prescriptions
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
  @Get('mobile/patient/get-dispensed-prescription')
  async getDispensedPrescriptionsForPatient(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.prescriptionService.getDispensedPrescriptionsForPatient(
      req,
      page,
      limit,
    );
  }

  // @Get('mobile/patient/get-drug-item-usage')
  // async getDrugItemUsageForPatient(@Req() req: Request) {
  //   return await this.prescriptionService.getDrugItemUsageForPatient2(req);
  // }

  // //use drug item
  // //useDrugItemForPatient
  // @Post('mobile/patient/use-drug-item')
  // async useDrugItemForPatient(@Req() req: Request, @Body() body: string[]) {
  //   console.log(body, 'body');
  //   return await this.prescriptionService.useDrugItemForPatient(req, body);
  // }

  @Get('mobile/patient/get-drug-doses')
  async getDrugDosesForPatient(@Req() req: Request) {
    return await this.prescriptionService.getDrugDosesForPatient(req);
  }

  //take or skip doses
  @ApiBody({
    type: TakeOrSkipDosesDto,
    description: 'take or skip doses',

  })
  @Post('mobile/patient/take-or-skip-doses')
  async takeOrSkipDosesForPatient(
    @Req() req: Request,
    @Body() body: TakeOrSkipDosesDto,
  ) {
    return await this.prescriptionService.takeOrSkipDose(req, body);
  }

  @ApiParam({
    name: 'uniqueCode',
    type: 'string',
  })
  @Get('mobile/compliance/:uniqueCode')
  async getDrugItemComplianceForPatient(@Req() req: Request, @Param('uniqueCode') uniqueCode: string) {
    return await this.prescriptionService.getDrugItemCompliance(req, uniqueCode);
  }

  //getComplianceForAllDrugs
  @Get('mobile/prescription-item-history')
  async getComplianceForAllDrugs(@Req() req: Request) {
    return await this.prescriptionService.getComplianceForAllDrugs(req);
  }

  @Get('mobile/weekly-data')
  async getWeeklyData(@Req() req: Request) {
    return await this.prescriptionService.getDrugDosesForPatientByWeek(req);
  }

}
