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
import { GenericDto, UpdateGenericDto } from '../dto/generic.dto';
import {
  DrugGenericDocument,
  DrugGenericEntity,
} from '../schema/generic.schema';

@Injectable()
export class GenericService {
  constructor(
    @InjectModel(DrugGenericEntity.name)
    private readonly drugProductModel: Model<DrugGenericDocument>,
  ) {}

  // We want to create generic
  async createGeneric(generic: GenericDto): Promise<DrugGenericEntity> {
    try {
      const newGeneric = new this.drugProductModel(generic);
      return await newGeneric.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all generic
  async getAllGeneric(): Promise<DrugGenericEntity[]> {
    try {
      const allGeneric = await this.drugProductModel.find();
      if (!allGeneric) {
        throw new NotFoundException('No generic found');
      }
      return allGeneric;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get generic by id
  async getGenericById(genericId: string): Promise<DrugGenericEntity> {
    try {
      const generic = await this.drugProductModel.findById(genericId);
      if (!generic) {
        throw new NotFoundException('Generic not found');
      }
      return generic;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to edit generic
  async editGeneric(
    genericId: string,
    generic: UpdateGenericDto,
  ): Promise<DrugGenericEntity> {
    try {
      const updatedGeneric = await this.drugProductModel.findByIdAndUpdate(
        genericId,
        generic,
        { new: true },
      );
      if (!updatedGeneric) {
        throw new NotFoundException('Generic not found');
      }
      return updatedGeneric;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to delete generic
  async deleteGeneric(genericId: string): Promise<DrugGenericEntity> {
    try {
      const deletedGeneric = await this.drugProductModel.findByIdAndDelete(
        genericId,
      );
      if (!deletedGeneric) {
        throw new NotFoundException('Generic not found');
      }
      return deletedGeneric;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
