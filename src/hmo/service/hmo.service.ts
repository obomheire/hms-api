import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HmoDocument, HmoEntity } from '../schema/hmo.schema';

@Injectable()
export class HmoService {
  constructor(
    @InjectModel(HmoEntity.name) private readonly hmoModel: Model<HmoDocument>,
  ) {}

  async createHmo(hmo: Partial<HmoEntity>): Promise<HmoDocument> {
    const newHmo = new this.hmoModel(hmo);
    return await newHmo.save();
  }

  async getHmos(search?: string): Promise<HmoDocument[]> {
    const query = {};
    if (search) {
      query['name'] = { $regex: search, $options: 'i' };
      query['description'] = { $regex: search, $options: 'i' };
    }
    return await this.hmoModel.find(query).exec();
  }

  async getHmoById(id: string): Promise<HmoDocument> {
    return await this.hmoModel.findById(id).exec();
  }

  async updateHmo(hmo: Partial<HmoEntity>, id: string): Promise<HmoDocument> {
    return await this.hmoModel.findByIdAndUpdate(id, hmo, { new: true });
  }

  async deleteHmo(id: string): Promise<string> {
    await this.hmoModel.findByIdAndDelete(id);
    return 'Hmo deleted';
  }
}
