import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DesignationEventEnum } from 'src/role/event/role.event';
import { TransactionTypeDto } from '../dto/transaction-type.dto';
import { TransactionTypeService } from '../services/transaction-type.service';

@Injectable()
export class TransactionTypeListener {
  constructor(
    private readonly transactionTypeService: TransactionTypeService,
  ) {}

  @OnEvent(DesignationEventEnum.TRANSACTION_TYPE_CREATED)
  async createTransactionType(payload: TransactionTypeDto) {
    Logger.log(payload, 'TransactionTypeListener');
    try {
      await this.transactionTypeService.createTransactionType(payload);
    } catch (error) {
      Logger.error(error, 'TransactionTypeListener');
    }
  }

  @OnEvent(DesignationEventEnum.DESIGNATION_AFTER_UPDATE)
  async updateTransactionType(payload: any) {
    Logger.log(payload, 'TransactionTypeListener');
    try {
      const { previousSpecialty } = payload;
      const transactionType =
        await this.transactionTypeService.getTransactionTypeByName(
          previousSpecialty,
        );
      if (transactionType) {
        await this.transactionTypeService.updateTransactionType(
          payload,
          transactionType.id,
        );
      }
      await this.transactionTypeService.createTransactionType({
        specialty: payload.specialty,
        type: payload.type,
        status: payload.status,
        amount: payload.amount,
      });
      Logger.log(transactionType, 'TransactionTypeListener');
    } catch (error) {
      Logger.error(error, 'TransactionTypeListener');
    }
  }
}
