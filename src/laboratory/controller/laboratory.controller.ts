import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { LaboratoryService } from '../service/laboratory.service';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { Types } from 'mongoose';
import { InvestigationStockUsageDto } from '../dto/investigationStock.dto';
import { InvestigationResultDto } from 'src/utils/dtos/patients/invesigationResultDto';
import { LaboratoryDto } from '../dto/laboratory.dto';
import { ApiBody, ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateInvestigationDto, InvestigationDto } from 'src/patients/dto/investigation.dto';

@ApiBearerAuth("Bearer")
@ApiTags('Laboratory')
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @ApiBody({
    type: CreateInvestigationDto,
    description: 'Create investigation request body',
  })

  //create investigation for patient
  @Post()
  async createInvestigationForPatient(
    @Body() investigation: InvestigationDto,
    @Req() req: any,
  ) {
    return await this.laboratoryService.createInvestigationForPatient(
      investigation,
      req,
    );
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'Filter patient request body',
  })
  @Post('test-center')
  async testCenterBoard(@Body() body: FilterPatientDto) {
    return await this.laboratoryService.testCenterBoard(body);
  }

  @ApiParam({
    name: 'id',
    type: Types.ObjectId,
    description: 'Start test by id',
  })
  @Patch('start-test/:id')
  async startTest(@Param('id') id: string) {
    return await this.laboratoryService.startTest(id);
  }

  //report
  @Get('report')
  async report() {
    return await this.laboratoryService.report();
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'Lab history request body',
  })
  //lab history
  @Post('lab-history')
  async labHistory(@Body() data?: FilterPatientDto) {
    return await this.laboratoryService.labHistory(data);
  }

  @ApiBody({
    type: FilterPatientDto,
    description: 'Upcoming investigations request body',
  })
  //get upcoming investigations
  @Post('upcoming-investigations')
  async upcomingInvestigations(@Body() data: FilterPatientDto) {
    return await this.laboratoryService.upcomingInvestigations(data);
  }

  @ApiParam({
    name: 'id',
    type: String,
    description: 'View investigation result with id',
  })
  //view investigation result
  @Get('view-investigation-result/:id')
  async viewInvestigationResult(@Param('id') id: string) {
    return await this.laboratoryService.viewInvestigationResult(id);
  }

  @ApiParam({
    name: 'id',
    type: Types.ObjectId,
    description: 'Complete investigation by id',
  })
  @ApiBody({
    type: LaboratoryDto,
    description: 'Complete investigation request body',
  })

  //complete investigation
  @Patch('complete-investigation/:investigationId')
  async completeInvestigation(
    @Param('investigationId') investigationId: string,
    @Body() data: LaboratoryDto,
    @Req() req: any,
  ) {
    return await this.laboratoryService.completeInvestigation(
      investigationId,
      data.stockUsed,
      req,
    );
  }
}
