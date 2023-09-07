import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesignationService } from 'src/role/service/designation.service';
import { WardsService } from 'src/wards/service/wards.service';
import {
  TransactionTypeNameEnum,
  TransactionTypeStatusEnum,
} from '../enums/transaction-type.enum';
import {
  TransactionTypeDocument,
  TransactionTypeEntity,
} from '../schema/transaction-type.schema';

@Injectable()
export class TransactionTypeService {
  constructor(
    @InjectModel(TransactionTypeEntity.name)
    private readonly transactionTypeModel: Model<TransactionTypeDocument>,
    private readonly designationService: DesignationService,
    private readonly wardsService: WardsService,
  ) {}

  async createTransactionType(
    transactionType: Partial<TransactionTypeEntity>,
  ): Promise<TransactionTypeDocument> {
    if (transactionType.specialty) {
      const designation = await this.designationService.getDesignationById(
        transactionType.specialty,
      );
      transactionType.name = designation.name;
    }
    if (transactionType.ward) {
      console.log(transactionType.ward, 'hi')
      const ward = await this.wardsService.getWardById(transactionType.ward);
      transactionType.name = ward.name;
    }

    const existingTransactionType = await this.getTransactionTypeByName(
      transactionType.name,
    );
    if (existingTransactionType) {
      return await this.updateTransactionType(
        transactionType,
        existingTransactionType.id,
      );
    }

    //generate a random name
    if (!transactionType.name) {
      transactionType.name = Math.random().toString(36).substring(7);
    }
    const newTransactionType = new this.transactionTypeModel(transactionType);
    return await newTransactionType.save();
  }

  async seedTransactionType(
    transactionType: Partial<TransactionTypeEntity>,
  ): Promise<TransactionTypeDocument> {
    const newTransactionType = new this.transactionTypeModel(transactionType);
    return await newTransactionType.save();
  }

  async getTransactionTypes(): Promise<any> {
    //we want to get transaction types and group them by type

    const transactionTypes = await this.transactionTypeModel
      .find({ status: TransactionTypeStatusEnum.ACTIVE })
      .exec();
    const groupedTransactionTypes = transactionTypes.reduce(
      (acc, transactionType) => {
        const type = transactionType.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(transactionType);
        return acc;
      },
      {},
    );
    return groupedTransactionTypes;
  }

  //find transactionType by name
  async getTransactionTypeByName(
    name: string,
  ): Promise<TransactionTypeDocument> {
    return await this.transactionTypeModel
      .findOne({ name, status: TransactionTypeStatusEnum.ACTIVE })
      .exec();
  }

  async getTransactionTypeByWard(
    ward: string,
  ): Promise<TransactionTypeDocument> {
    return await this.transactionTypeModel
      .findOne({ ward, status: TransactionTypeStatusEnum.ACTIVE })
      .exec();
  }

  async getTransactionType(
    type: string,
  ): Promise<TransactionTypeDocument> {
    return await this.transactionTypeModel
      .findOne({ type, status: TransactionTypeStatusEnum.ACTIVE })
      .exec();
  }



  async getTransactionTypeById(id: string): Promise<TransactionTypeDocument> {
    return await this.transactionTypeModel.findById(id).exec();
  }

  async updateTransactionType(
    transactionType: Partial<TransactionTypeEntity>,
    id: string,
  ): Promise<TransactionTypeDocument> {
    return await this.transactionTypeModel.findByIdAndUpdate(
      id,
      transactionType,
      { new: true },
    );
  }
}
