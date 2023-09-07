import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FilterVendorDto,
  NewVendorDto,
  UpdateNewVendorDto,
} from '../dto/newVendor.dto';
import { NewVendorDocument, NewVendorEntity } from '../schema/newVendor.schema';

@Injectable()
export class NewVendorService {
  constructor(
    @InjectModel(NewVendorEntity.name)
    private readonly newVendorModel: Model<NewVendorDocument>,
  ) {}

  //We want to create new vendor
  async createNewVendor(newVendor: NewVendorDto): Promise<NewVendorEntity> {
    try {
      const uniqueCode = Math.random().toString(36).substr(2, 9);
      const newNewVendor = new this.newVendorModel({
        ...newVendor,
        uniqueCode,
      });
      return await newNewVendor.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all new vendor and be able to search from the vendorName in the vendorDetails
  async getAllNewVendor(filterVendorDto?: FilterVendorDto) {
    try {
      const { search, startDate, endDate, page, limit, status } = filterVendorDto;
      const query = {};
      if (search) {
        query['vendorDetails.vendorName'] = new RegExp(search, 'i');
      }
      if (startDate && endDate) {
        query['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      if(status){
        query['active'] = status;
      }
      const newVendorCount = await this.newVendorModel.countDocuments(query);
      const newVendors = await this.newVendorModel
        .find(query)
        .populate('addProduct')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      return {
        newVendorCount,
        newVendors,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  // We want to get an new vendor by id
  async getNewVendorById(newVendorId: string): Promise<NewVendorEntity> {
    try {
      const newVendor = await this.newVendorModel.findById(newVendorId).exec();

      if (!newVendor) {
        throw new NotFoundException('New vendor not found');
      }
      return newVendor;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to update an new vendor by id
  async updateNewVendorById(
    newVendorId: string,
    newVendor: UpdateNewVendorDto,
  ): Promise<NewVendorEntity> {
    try {
      const updatedNewVendor = await this.newVendorModel.findByIdAndUpdate(
        newVendorId,
        newVendor,
        { new: true },
      );
      if (!updatedNewVendor) {
        throw new NotFoundException('New vendor not found');
      }
      return updatedNewVendor;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to delete an new vendor by id
  async deleteNewVendorById(newVendorId: string): Promise<NewVendorEntity> {
    try {
      const deletedNewVendor = await this.newVendorModel.findByIdAndDelete(
        newVendorId,
      );
      if (!deletedNewVendor) {
        throw new NotFoundException('New vendor not found');
      }
      return deletedNewVendor;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //get count of new vendors
  async getNewVendorCount(): Promise<number> {
    try {
      const newVendorCount = await this.newVendorModel.countDocuments();
      return newVendorCount;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Toggle the active field in vendor to true or false
  async toggleNewVendorStatus(
    newVendorId: string,
    updateNewVendorDto: UpdateNewVendorDto,
  ): Promise<NewVendorEntity> {

    console.log(newVendorId)
    try {
      const { active } = updateNewVendorDto;
      const updatedNewVendor = await this.newVendorModel.findByIdAndUpdate(
        newVendorId,
        { active },
        { new: true },
      );

      if (!updatedNewVendor) {
        throw new NotFoundException('New vendor not found');
      }
      return updatedNewVendor;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
