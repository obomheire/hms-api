import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PatientsService } from 'src/patients/service/patients.service';
import {
  CreateInvestigationDto,
  InvestigationDto,
  InvestigationResultDto,
} from 'src/patients/dto/investigation.dto';
import { LabStockDocument, LabStockEntity } from '../schema/labStock.schema';
import { TestService } from './test.service';
import { Request } from 'express';
import { InvestigationStockUsageDto } from '../dto/investigationStock.dto';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { InvestigationService } from 'src/patients/service/investigation.service';
import { LabStockService } from './labStock.service';
import { RecordUsageDto } from '../dto/recordUsage.dto';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectModel(LabStockEntity.name)
    private readonly labStockModel: Model<LabStockDocument>,
    // @InjectModel(StockUsageEntity.name)
    // private readonly stockUsageModel: Model<StockUsageDocument>,
    // @InjectModel(OrderEntity.name)
    // private readonly orderModel: Model<OrderDocument>,
    private readonly patientsService: PatientsService,
    private readonly testService: TestService,
    private readonly investigationService: InvestigationService,
    private readonly labStockService: LabStockService,
  ) {}

  //create test for a particular patient
  async createInvestigationForPatient(
    investigation: InvestigationDto,
    req: Request,
  ) {
    const newInvestigation =
      await this.investigationService.createInvestigation(investigation, req);
    return newInvestigation;
  }

  async testCenterBoard(data?: FilterPatientDto): Promise<any> {
    const investigations =
      await this.investigationService.getCompletedAndOngoingInvestigations(
        data,
      );
    // const allTests = await this.testService.getAllTests();
    return  investigations;
  }

  //start test
  async startTest(id: string): Promise<any> {
    const investigation =
      await this.investigationService.markInvestigationAsOngoing(id);
    return investigation;
  }

  //get pending lab investigations for a patient
  async getPendingInvestigationForPatient(id: string) {
    const investigations = await this.investigationService.getInvestigation(id);
    return investigations;
  }

  //get upcoming investigations
  async upcomingInvestigations(data?: FilterPatientDto) {
    const investigations =
      await this.investigationService.getPendingInvestigations(data);
    return investigations;
  }

  //laboratory history
  async labHistory(data?: FilterPatientDto) {
    const investigations =
      await this.investigationService.getCompletedInvestigations(data);
    return investigations;
  }

  //complete an investigation
  async completeInvestigation(
    investigationId: string,
    stockUsed: RecordUsageDto[],
   
    req: Request,
  ) {
    const investigationResult =
      await this.investigationService.updateInvestigationWithResult(
        investigationId,
        req,
      );
      await this.labStockService.useLabStock(stockUsed, investigationId, req);
    //we want to loop through array of stock used and remove the quantity of each item from total quantity in the lab stock schema
    // stockUsed.forEach(async (item) => {
    //   const stock = await this.labStockModel.findOne({
    //     _id: item.item,
    //   });
    //   const newQuantity = stock.totalQuantity - item.quantity;
    //   await this.labStockModel.findOneAndUpdate(
    //     {
    //       _id: item.item,
    //     },
    //     {
    //       totalQuantity: newQuantity,
    //     },
    //   );
    // });

    return investigationResult;
  }

  async report() {
    return await this.investigationService.getInvestigationStats();
  }

  async viewInvestigationResult(id: string) {
    return await this.investigationService.getInvestigation(id);
  }
}
