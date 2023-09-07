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
  UseFilters,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LabStockService } from 'src/laboratory/service/labStock.service';
import { ProductBatchDto, ProductBatchReturn } from 'src/pharmacy/dto/batch.dto';
import { GrantorRejectDto, UpdateOrderDto } from 'src/utils/dtos/laboratory/order.dto';
import { CreateItemBatchDto, ItemBatchReturn } from '../dto/batch.dto';
import { ItemProductDto, UpdateItemProductDto } from '../dto/itemProduct.dto';
import { ItemBatch, ItemBatchDocument } from '../schema/batch.schema';
import {
  ItemProductDocument,
  ItemProductEntity,
} from '../schema/itemProduct.schema';
import { Request } from 'express';
import { headApprovalEnum } from 'src/utils/enums/requisitionStatus';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { ItemRequisitionService } from './itemRequisition.service';
import { HttpExceptionFilter } from 'src/errors/error';

@Injectable()
export class ItemProductService {
  constructor(
    @InjectModel(ItemProductEntity.name)
    private readonly itemProductModel: Model<ItemProductDocument>,
    @InjectModel(ItemBatch.name)
    private readonly itemBatchModel: Model<ItemBatchDocument>,
    private readonly labStockService: LabStockService,
    private readonly itemRequisitionService: ItemRequisitionService,
  ) {}

  //We want to create new item product
  async createItemProduct(
    itemProduct: ItemProductDto,
  ): Promise<ItemProductEntity> {
    try {
      const uniqueCode = Math.random().toString(36).substring(2, 10);
      const newItemProduct = new this.itemProductModel({
        ...itemProduct,
        uniqueCode,
      });
      return await newItemProduct.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all item prodcut and be able to query with search string by itemName, itemType or brandName with pagination
  async getAllItemProduct(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<any> {
    try {
      const query = {};
      if (search) {
        query['$or'] = [
          { itemName: { $regex: search, $options: 'i' } },
          { "itemType.name": { $regex: search, $options: 'i' } },
          { brandName: { $regex: search, $options: 'i' } },
        ];  
      }
      const allItemProduct = await this.itemProductModel.find(query)
      .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        
        .limit(limit)
        .exec();
      if (!allItemProduct) {
        throw new NotFoundException('No item product found');
      }
      const count = await this.itemProductModel.countDocuments(query);
      const totalPage = Math.ceil(count / limit);
      const currentPage = page;
      return {allItemProduct, totalPage, currentPage, count};
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to update an item product by id
  async updateItemProductById(
    itemProductId: string,
    itemProduct: UpdateItemProductDto,
  ): Promise<ItemProductEntity> {
    try {
      const updatedItemProduct = await this.itemProductModel.findByIdAndUpdate(
        itemProductId,
        itemProduct,
        { new: true },
      );
      if (!updatedItemProduct) {
        throw new NotFoundException('Item product not found');
      }
      return updatedItemProduct;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to delete an item product by id
  async deleteItemProductById(
    itemProductId: string,
  ): Promise<ItemProductEntity> {
    try {
      const deletedItemProduct = await this.itemProductModel.findByIdAndDelete(
        itemProductId,
      );
      if (!deletedItemProduct) {
        throw new NotFoundException('Item product not found');
      }
      return deletedItemProduct;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get an item product by id
  async getItemProductById(itemProductId: string): Promise<ItemProductEntity> {
    try {
      const itemProduct = await this.itemProductModel
        .findById(itemProductId)
        .exec();
      if (!itemProduct) {
        throw new NotFoundException('Item product not found');
      }
      return itemProduct;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get an item product by itemName search, non case sensitive
  async getItemProductByName(
    itemName: string,
  ): Promise<ItemProductEntity> {
    try {
      const itemProduct = await this.itemProductModel
        .findOne({ itemName: { $regex: itemName, $options: 'i' } })
        .exec();
      if (!itemProduct) {
        throw new NotFoundException('Item product not found');
      }
      return itemProduct;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // We want to get all item product and be able to search with a search string by itemName, itemType, brandName or itemDescription
  async getAllItemProductAndSearch(
    search: string,
  ): Promise<ItemProductEntity[]> {
    try {
      const allItemProduct = await this.itemProductModel.find({
        $or: [
          { itemName: { $regex: search, $options: 'i' } },
          { unitType: { $regex: search, $options: 'i' } },
          { brandName: { $regex: search, $options: 'i' } },
          { itemDescription: { $regex: search, $options: 'i' } },
        ],
      });
      if (!allItemProduct) {
        throw new NotFoundException('No item product found');
      }
      return allItemProduct;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //enter new batch of item product
  async enterNewBatchOfItemProduct(
    batches: CreateItemBatchDto[],
  ): Promise<ItemBatchDocument[]> {
    try {
      const newBatches = [];
      for (let i = 0; i < batches.length; i++) {
        const itemProduct = await this.getItemProductById(batches[i].product);
        // if (itemProduct.unitType !== batches[i].unit) {
        //   throw new BadRequestException(
        //     'Unit type of the batch must be the same as the unit type of the product',
        //   );
        // }
        const newItemBatch = new this.itemBatchModel({
          ...batches[i],
          expiryDate: new Date(batches[i].expiryDate),
        });
        await newItemBatch.save();

        newBatches.push(newItemBatch);

        itemProduct.availableQuantity += newItemBatch.quantity;

        await itemProduct.save();
      }
      return newBatches;
    }
    catch (error) {
      throw error;
    }
  }

  async addBatchToProduct( batch: CreateItemBatchDto[], id?: string,): Promise<ItemBatchDocument[]> {
    //we want to create new batch of a product
    //we want to ensure the unit input for the batch is the same as the unit of the product
    //if the unit are the same, we want to add the quantity in the new batch to the totalQuantity of the product
    //we can have multiple products and batches at a time
    try {
      const batchArray = [];
      for (const item of batch) {
        // const product = await this.drugProductModel
        //   .findById(item.product)
        //   .exec();
          const product = await this.getItemProductById(item.product);
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        // if (product.unit !== item.unit) {
        //   throw new BadRequestException(
        //     'Unit of product and batch must be the same',
        //   );
        // }

        const newBatch = new this.itemBatchModel({
          ...item,
          expiryDate: new Date(item.expiryDate).toISOString(),
        });
        const savedBatch = await newBatch.save();

        batchArray.push(savedBatch);

        product.availableQuantity += item.quantity;
        await product.save();
      }
      id ? await this.itemRequisitionService.fulfillRequisition(id) : null;
      return batchArray;
    } catch (error) {
      throw error;
    }
  }

  //get all batches of item product
  async getAllBatchesOfItemProduct(
    itemProductId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<ItemBatchReturn> {
    try {
      const query = {
        product: itemProductId,
      };
      if (search) {
        query['$or'] = [
          { batchNumber: { $regex: search, $options: 'i' } },
          { unit: { $regex: search, $options: 'i' } },
        ]
      }
      const itemProduct = await this.getItemProductById(itemProductId);
      const batches = await this.itemBatchModel
        .find(query)
        .populate('product')
        .populate('vendor')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!batches) {
        throw new NotFoundException('No batch found');
      }
      const count = await this.itemBatchModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      return { batches, totalPages, count, currentPage: page };
    } catch (error) {
      throw error
    }
  }

  //get a single batch
  async getSingleBatch(batchId: string): Promise<ItemBatchDocument> {
    try {
      const batch = await this.itemBatchModel
        .findById(batchId)
        .populate('product').
        populate('vendor')
        .exec();
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
      return batch;
    } catch (error) {
      throw error
    }
  }

  //get all expired batches
  async getAllExpiredBatches(page = 1, limit = 10, search = ''): Promise<ItemBatchReturn> {
    try {
      const batches = await this.itemBatchModel
        .find({
          $product: [
            { 'product.itemName': { $regex: search, $options: 'i' } },
            { 'product.brandName': { $regex: search, $options: 'i' } },
            { 'product.itemDescription': { $regex: search, $options: 'i' } },
          ],
          expiryDate: { $lte: new Date() },
          quantity: { $gt: 0 },
        })
        .populate('product')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!batches) {
        throw new NotFoundException('No batch found');
      }
      const count = await this.itemBatchModel.countDocuments({
        $product: [
          { 'product.itemName': { $regex: search, $options: 'i' } },
          { 'product.brandName': { $regex: search, $options: 'i' } },
          { 'product.itemDescription': { $regex: search, $options: 'i' } },
        ],
        expiryDate: { $lte: new Date() },
        quantity: { $gt: 0 },
      });
      
      const totalPages = Math.ceil(count / limit);
      return { batches, totalPages, count, currentPage: page };
    } catch (error) {
      throw error
    }
  }

  //get all batches that are expiring in the next 30 days

  async getAllExpiringBatches(page = 1, limit = 10, search = ''): Promise<ItemBatchReturn> {
    try {
      const batches = await this.itemBatchModel
        .find({
          $product: [
            { 'product.itemName': { $regex: search, $options: 'i' } },
            { 'product.brandName': { $regex: search, $options: 'i' } },
            { 'product.itemDescription': { $regex: search, $options: 'i' } },
          ],
          expiryDate: {
            $lte: new Date(new Date().setDate(new Date().getDate() + 90)),
          },
        })
        .populate('product')
        .populate('vendor')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!batches) {
        throw new NotFoundException('No batch found');
      }
      const count = batches.length
      const totalPages = Math.ceil(count / limit);
      return { batches, totalPages, count, currentPage: page };
    } catch (error) {
      throw error
    }
  }

  //get all batches that are low in stock
  async getAllLowStockBatches(page = 1, limit = 10, search = ''): Promise<ItemBatchReturn> {
    try {
      const batches = await this.itemBatchModel
        .find({
          $product: [
            { "product.itemName": { $regex: search, $options: 'i' } },
            { "product.brandName": { $regex: search, $options: 'i' } },
            { "product.itemDescription": { $regex: search, $options: 'i' } },
          ],
          quantity: { $lte: 10 },
        })
        .populate('product')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!batches) {
        throw new NotFoundException('No batch found');
      }
      const count = batches.length
      const totalPages = Math.ceil(count / limit);
      return { batches, totalPages, count, currentPage: page };
    } catch (error) {
      throw error
    }
  }

  //get count of all item products
  async getCountOfAllItemProducts(): Promise<number> {
    try {
      const count = await this.itemProductModel.countDocuments().exec();
      return count;
    } catch (error) {
      throw error
    }
  }

  //get all batches
  async getAllBatches(page = 1, limit = 10, search = ''): Promise<ItemBatchReturn> {
    try {
      const batches = await this.itemBatchModel
        .find({
          $product: [
            { "product.itemName": { $regex: search, $options: 'i' } },
            { "product.brandName": { $regex: search, $options: 'i' } },
            { "product.itemDescription": { $regex: search, $options: 'i' } },
          ],
        })
        .populate('product')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!batches) {
        throw new NotFoundException('No batch found');
      }
      const count = batches.length
      const totalPages = Math.ceil(count / limit);
      return { batches, totalPages, count, currentPage: page };
    } catch (error) {
      throw error
    }
  }

  //update order from lab, pick the item in the order and decrement the the quantity in the item product 
  // async updateOrderFromLab(
  //   orderId: string,
  //   order: UpdateOrderDto,
  //   req: Request,
  //   ): Promise<any> {
  //   try {
  //     // const orderToUpdate = await this.labStockService.editOrder(orderId, order);
  //     //in the orderToUpdate, we want to loop through the items and get the batchId and the quantity so that we update the itemBatch
  //     const items = order.items;
  //     const check = items.forEach(async (item) => {
  //       const itemBatch = await this.itemBatchModel.findById(item?.batchId);
  //       if(itemBatch.quantity < item?.quantity){
  //         throw new BadRequestException(`Quantity cannot be more than the quantity in the item batch ${itemBatch.batchNumber}`)
  //       }
  //       const itemProduct = await this.getItemProductById(item?.item);
  //       console.log(itemProduct, 'itemProduct')
  //       if(itemProduct.availableQuantity < item?.quantity){
  //         throw new BadRequestException(`Quantity cannot be more than the quantity in the item product ${itemProduct.itemName}`)
  //       }

  //       itemBatch.quantity -= item?.quantity;
  //       await itemBatch.save();
  //       itemProduct.availableQuantity -= item?.quantity;
  //       await itemProduct.save();
  //     });
  //     await this.labStockService.updateOrderFromLab(orderId, order, req)

  //     return check;
  //   } catch (error) {
  //     throw error
  //   }
  // }

  @UseFilters(HttpExceptionFilter)
  async updateOrderFromLab(
    orderId: string,
    order: UpdateOrderDto,
    req: Request,
  ): Promise<any> {
    const items = order.items;
    try {
      if(order.approval === 'REJECTED'){
        return await this.labStockService.updateOrderFromLab(orderId, order, req);
      }
      await Promise.all(
        items.map(async (item) => {
          const itemBatch = await this.itemBatchModel.findById(item?.batchId);
          if (itemBatch.quantity < item?.quantity) {
            throw new HttpException(
              `Quantity cannot be more than the quantity in the item batch ${itemBatch.batchNumber}`,
              HttpStatus.BAD_REQUEST,
            );
          }
          const itemProduct = await this.getItemProductById(item?.item);
          if (itemProduct.availableQuantity < item?.quantity) {
            throw new HttpException(
              `Quantity cannot be more than the quantity in the item product ${itemProduct.itemName}`,
              HttpStatus.BAD_REQUEST,
            );
          }

          itemBatch.quantity -= item?.quantity;
          await itemBatch.save();
          itemProduct.availableQuantity -= item?.quantity;
          await itemProduct.save();
        }),
      );
      return await this.labStockService.updateOrderFromLab(orderId, order, req);
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(`Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
    


  //get orders of a particular item
  async getOrdersOfItem(itemId: string, page = 1, limit = 10, search?: string): Promise<any> {
    try {
      return  await this.labStockService.getOrdersOfItem(itemId, page, limit, search);
    } catch (error) {
      throw error
    }
  }




}
