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
import { UnitTypeDto, UpdateUnitTypeDto } from '../dto/unitType.dto';
import { UnitTypeDocument, UnitTypeEntity } from '../schema/unitType.schema';

@Injectable()
export class UnitTypeService {
  constructor(
    @InjectModel(UnitTypeEntity.name)
    private readonly unitTypeModel: Model<UnitTypeDocument>,
  ) {}

  //We want to create unit type
  async createUnitType(unitType: UnitTypeDto): Promise<UnitTypeEntity> {
    try {
      const newUnitType = new this.unitTypeModel(unitType);
      return await newUnitType.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all unit type
  async getAllUnitType(): Promise<UnitTypeEntity[]> {
    try {
      const allUnitType = await this.unitTypeModel.find();
      if (!allUnitType) {
        throw new NotFoundException('No unit type found');
      }
      return allUnitType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get a unit type by id
  async getUnitTypeById(unitTypeId: string): Promise<UnitTypeEntity> {
    try {
      const unitType = await this.unitTypeModel.findById(unitTypeId).exec();
      if (!unitType) {
        throw new NotFoundException('Unit type not found');
      }
      return unitType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to update a unit type by id
  async updateUnitTypeById(
    unitTypeId: string,
    UpdateUnitTypeDto: UpdateUnitTypeDto,
  ): Promise<UnitTypeEntity> {
    try {
      const updatedUnitType = await this.unitTypeModel
        .findByIdAndUpdate(unitTypeId, UpdateUnitTypeDto, { new: true })
        .exec();
      if (!updatedUnitType) {
        throw new NotFoundException('Unit type not found');
      }
      return updatedUnitType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to delete a unit type by id
  async deleteUnitTypeById(unitTypeId: string): Promise<UnitTypeEntity> {
    try {
      const deletedUnitType = await this.unitTypeModel
        .findByIdAndDelete(unitTypeId)
        .exec();
      if (!deletedUnitType) {
        throw new NotFoundException('Unit type not found');
      }
      return deletedUnitType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
