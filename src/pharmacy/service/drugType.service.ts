import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  NotAcceptableException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DrugTypeDto, UpdateDrugTypeDto } from '../dto/drugType.dto';
import { DrugTypeDocument, DrugTypeEntity } from '../schema/drugType.schema';

@Injectable()
export class DrugTypeService {
  constructor(
    @InjectModel(DrugTypeEntity.name)
    private readonly drugTypeModel: Model<DrugTypeDocument>,
  ) {}

  //We want to create drug type
  async createDrugType(drugType: DrugTypeDto): Promise<DrugTypeEntity> {
    try {
      const newDrugType = new this.drugTypeModel(drugType);
      return await newDrugType.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all drug type
  async getAllDrugType(): Promise<DrugTypeEntity[]> {
    try {
      const allDrugType = await this.drugTypeModel.find();
      if (!allDrugType) {
        throw new NotFoundException('No drug type found');
      }
      return allDrugType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get a drug type by id
  async getDrugTypeById(drugTypeId: string): Promise<DrugTypeEntity> {
    try {
      const drugType = await this.drugTypeModel.findById(drugTypeId).exec();
      if (!drugType) {
        throw new NotFoundException('Drug type not found');
      }
      return drugType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to edit drug type
  async editDrugType(
    drugTypeId: string,
    drugType: UpdateDrugTypeDto,
  ): Promise<DrugTypeEntity> {
    try {
      const updatedDrugType = await this.drugTypeModel.findByIdAndUpdate(
        drugTypeId,
        drugType,
        { new: true },
      );
      if (!updatedDrugType) {
        throw new NotFoundException('Drug type not found');
      }
      return updatedDrugType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to delete drug type
  async deleteDrugType(drugTypeId: string): Promise<DrugTypeEntity> {
    try {
      const deletedDrugType = await this.drugTypeModel.findByIdAndDelete(
        drugTypeId,
      );
      if (!deletedDrugType) {
        throw new NotFoundException('Drug type not found');
      }
      return deletedDrugType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
