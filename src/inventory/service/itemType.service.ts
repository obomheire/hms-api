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
import { ItemTypeDto, UpdateItemTypeDto } from '../dto/itemType.dto';
import { ItemTypeDocument, ItemTypeEntity } from '../schema/itemType.schema';

@Injectable()
export class ItemTypeService {
  constructor(
    @InjectModel(ItemTypeEntity.name)
    private readonly itemTypeModel: Model<ItemTypeDocument>,
  ) {}

  //We want to create item type
  async createItemType(itemType: ItemTypeDto): Promise<ItemTypeEntity> {
    try {
      const newItemType = new this.itemTypeModel(itemType);
      return await newItemType.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all item type
  async getAllItemType(): Promise<ItemTypeEntity[]> {
    try {
      const allItemType = await this.itemTypeModel.find();
      if (!allItemType) {
        throw new NotFoundException('No item type found');
      }
      return allItemType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get an item type by id
  async getItemTypeById(itemTypeId: string): Promise<ItemTypeEntity> {
    try {
      const itemType = await this.itemTypeModel.findById(itemTypeId).exec();

      if (!itemType) {
        throw new NotFoundException('Item type not found');
      }
      return itemType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to update an item type by id
  async updateItemTypeById(
    itemTypeId: string,
    updateItemTypeDto: UpdateItemTypeDto,
  ): Promise<ItemTypeEntity> {
    try {
      const updateItemType = await this.itemTypeModel.findByIdAndUpdate(
        itemTypeId,
        updateItemTypeDto,
        { new: true },
      );
      if (!updateItemType) {
        throw new NotFoundException('Item type not found');
      }
      return updateItemType;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to delete an item type by id
  async deleteItemTypeById(itemTypeId: string): Promise<ItemTypeEntity> {
    try {
      const deleteItemType = await this.itemTypeModel
        .findById(itemTypeId)
        .exec();
      if (!deleteItemType) {
        throw new NotFoundException('Item type not found');
      }
      return await deleteItemType.remove();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
