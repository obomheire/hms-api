import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ProductOrderDocument,
  ProductOrderEntity,
} from '../schema/product-order.schema';

@Injectable()
export class ProductOrderService {
  constructor(
    @InjectModel(ProductOrderEntity.name)
    private readonly productOrderModel: Model<ProductOrderDocument>,
  ) {}

  async create(
    productOrder: Partial<ProductOrderEntity>,
    patient: string,
  ): Promise<ProductOrderDocument> {
    const uniqueCode = Math.floor(100000 + Math.random() * 900000);
    return await this.productOrderModel.create({
      ...productOrder,
      patient,
      uniqueCode,
      status: 'PAID'
    });
  }

  //update product order status
  async updateStatus(id: string): Promise<ProductOrderDocument> {
    return await this.productOrderModel.findOneAndUpdate(
      { id },
      {
        status: 'PAID',
      },
      {
        new: true,
      },
    );
  }

  async findAll(
    pg: PaginationDto,
    patient: any,
  ): Promise<ProductOrderDocument[]> {
    const { page, limit } = pg;
    return await this.productOrderModel
      .find({
        patient,
      })
      .skip(page * limit)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<ProductOrderDocument> {
    return await this.productOrderModel.findById(id);
  }

  async update(
    id: string,
    productOrder: Partial<ProductOrderEntity>,
  ): Promise<ProductOrderDocument> {
    return await this.productOrderModel.findByIdAndUpdate(id, productOrder, {
      new: true,
    });
  }

  async getPaidOrdersForPharmacy(pg: PaginationDto) {
    try {
      const { page, limit, searchTerm } = pg;
      const query = {
        status: 'PAID',
      };
      if (searchTerm) {
        //serch by patient name
        query['patient'] = {
          $regex: searchTerm,
          $options: 'i',
        };
      }
      const data = await this.productOrderModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('patient')
        .exec();

      const count = await this.productOrderModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      return {
        data,
        currentPage: page,
        totalPages,
        count,
      };
    } catch (err) {
      throw err;
    }
  }
}
