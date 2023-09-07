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
import { LabStockDocument, LabStockEntity } from '../schema/labStock.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StockUsageEntity,
  StockUsageDocument,
} from '../schema/recordUsage.schema';
import { CreateLabStockDto, UpdateLabStockDto } from '../dto/labStock.dto';
import {
  OrderEntity,
  OrderDocument,
} from 'src/utils/schemas/laboratory/makeorder.schema';
import { Request } from 'express';
import {
  CreateOrderDto,
  GrantorRejectDto,
  UpdateOrderDto,
} from 'src/utils/dtos/laboratory/order.dto';
import { RecordUsageDto } from '../dto/recordUsage.dto';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { ObjectId } from 'mongodb';
import { InvestigationService } from 'src/patients/service/investigation.service';
import {
  InvestigationDocument,
  InvestigationEntity,
} from 'src/patients/schema/investigation.schema';
import { Types } from 'joi';
import { ToggleStatusEnum } from '../enum/lab.enum';
import { Console } from 'console';

@Injectable()
export class LabStockService {
  constructor(
    @InjectModel(LabStockEntity.name)
    private readonly labStockModel: Model<LabStockDocument>,
    @InjectModel(StockUsageEntity.name)
    private readonly stockUsageModel: Model<StockUsageDocument>,
    @InjectModel(OrderEntity.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(InvestigationEntity.name)
    private readonly investigationModel: Model<InvestigationDocument>,
  ) {}

  //we want to create lab stock by making a request order using the labstock dto
  async createLabStock(labStock: CreateLabStockDto): Promise<LabStockEntity> {
    try {
      const { quantity } = labStock;
      const newLabStock = new this.labStockModel({
        ...labStock,
        totalQuantity: quantity,
        dateLastRestocked: new Date(),
      });
      return await newLabStock.save();
    } catch (error) {
      throw error;
    }
  }

  //we want to submit requisition order for lab stocks. this is a request for one or multiple new or existing lab stock items. the madeBy column refers to the logged in user
  async submitRequisitionOrder(
    labStock: CreateOrderDto,
    req: Request,
  ): Promise<OrderEntity> {
    try {
      //we can create multiple orders at a time
      const uniqueCode = Math.random().toString(36).substring(7);
      const newOrder = new this.orderModel({
        ...labStock,
        createdBy: req.user,
        uniqueCode,
      });
      return await newOrder.save();
    } catch (error) {
      throw error;
    }
  }

  //if the order is approved, the lab stock is created or quantity increased for existing lab stocks
  // async approveRequisitionOrder(
  //   orderId: string,
  //   req: Request,
  // ): Promise<LabStockEntity> {
  //   try {
  //     const order = await this.orderModel.findById(orderId);
  //     if (!order) {
  //       throw new NotFoundException('Order not found');
  //     }
  //     if (
  //       order.approval === ApprovalEnum.APPROVED ||
  //       order.approval === ApprovalEnum.REJECTED
  //     ) {
  //       throw new UnauthorizedException(
  //         'this order has been approved already. Please create another for the item',
  //       );
  //     }
  //     //the totalQuantity column is incremented with the quantity being passed as input
  //     console.log(order.item);
  //     const newTotalQuantity = await this.labStockModel.findOneAndUpdate(
  //       { _id: order.item },
  //       { $inc: { totalQuantity: order.quantity } },
  //       { new: true },
  //     );
  //     //update the order status to approved
  //     order.approval = ApprovalEnum.FULFILLED;
  //     order.save();
  //     if (!newTotalQuantity) {
  //       throw new NotFoundException('Lab stock not found');
  //     }
  //     //update approvedBy in order
  //     const updatedOrder = await this.orderModel.findByIdAndUpdate(
  //       orderId,
  //       { receivedBy: req.user },
  //       { new: true },
  //     );
  //     return newTotalQuantity;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  //update order
  // async updateOrder(
  //   orderId: string,
  //   // order: UpdateOrderDto,
  //   approval: ApprovalEnum,

  //   req: Request,
  // ): Promise<OrderEntity> {
  //   try {
  //     const updatedOrder = await this.orderModel.findByIdAndUpdate(
  //       orderId,
  //       { receivedBy: req.user, approval },
  //       { new: true },
  //     );
  //     if (!updatedOrder) {
  //       throw new NotFoundException('Order not found');
  //     }
  //     if (updatedOrder.approval === ApprovalEnum.FULFILLED) {
  //       throw new UnauthorizedException('Order has been fulfilled already');
  //     }
  //     if (updatedOrder.approval === ApprovalEnum.REJECTED) {
  //       return updatedOrder;
  //     }
  //     await this.addLabStock(updatedOrder.item, updatedOrder.quantity);
  //     return updatedOrder;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  //inventory update order from lab
  async updateOrderFromLab(
    orderId: string,
    order: UpdateOrderDto,
    req: Request,
  ): Promise<OrderEntity> {
    try {
      const updatedOrder: any = await this.orderModel.findById(orderId);
      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }
      if (updatedOrder.approval === ApprovalEnum.FULFILLED) {
        throw new UnauthorizedException('Order has been fulfilled already');
      }
      if (order.approval === 'REJECTED') {
        updatedOrder.approval = ApprovalEnum.REJECTED;
        updatedOrder.approvedOrRejectedBy = req.user;
        updatedOrder.save();
        return updatedOrder;
      }
      console.log(order.approval, 'ApprovalEnum.APPROVED')
      if (order.approval === 'APPROVED') {
        return await this.orderModel.findByIdAndUpdate(
          orderId,
          {
            ...order,
            approvedOrRejectedBy: req.user,
            approval: 'APPROVED'
          },
          { new: true },
        );
      }

      // await this.addLabStock(updatedOrder.item, updatedOrder.quantity);
      return updatedOrder;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async editOrder(
    orderId: string,
    order: UpdateOrderDto,
  ): Promise<OrderEntity> {
    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        orderId,
        { ...order },
        { new: true },
      );

      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }
  // { ...order, approvedOrRejectedBy: req.user, approval: order.approval },
  // { new: true },

  //grant or reject multiple orders
  // async grantOrRejectMultipleOrders(
  //   orders: GrantorRejectDto,
  //   req: Request,
  // ): Promise<OrderEntity[]> {
  //   try {
  //     const { approval, orderIds } = orders;
  //     const updatedOrders = await this.orderModel.updateMany(
  //       { _id: { $in: orderIds } },
  //       { approval, approvedOrRejectedBy: req.user },
  //     );
  //     if (!updatedOrders) {
  //       throw new NotFoundException('Order not found');
  //     }

  //     return await this.orderModel.find({ _id: { $in: orderIds } });
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  //get orders of an item
  async getOrdersOfItem(
    itemId: string,
    page = 1,
    limit = 15,
    search?: string,
  ): Promise<any> {
    try {
      const query = {
        'items.item': itemId,
        approval: { $ne: ApprovalEnum.PENDING },
      };
      if (search) {
        query['$or'] = [
          { uniqueCode: { $regex: search, $options: 'i' } },
          { 'item.itemName': { $regex: search, $options: 'i' } },
        ];
      }
      const orders = await this.orderModel
        .find(query)
        .populate('approvedOrRejectedBy', 'firstName lastName age gender email')
        .populate('receivedBy', 'firstName lastName age gender email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const count = await this.orderModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { orders, count, totalPages, currentPage };
    } catch (error) {
      throw error.message;
    }
  }

  async fulfillApprovedOrder(orderId: string, status: ToggleStatusEnum, req: Request): Promise<any> {
    try {
        const order: any = await this.orderModel.findById(orderId).populate({
            path: 'items',
            populate: {
                path: 'item',
                model: 'ItemProductEntity',
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.approval === ApprovalEnum.FULFILLED) {
            throw new UnauthorizedException('Order already fulfilled');
        }

        if (order.approval !== 'APPROVED') {
            throw new UnauthorizedException('Order not approved');
        }

        if (status === ToggleStatusEnum.DECLINE) {
            return order;
        }

        const labStockUpdates = [];

        for (const item of order.items) {
            const uniqueCode = item.item.uniqueCode;
            const labStock = await this.labStockModel.findOne({ uniqueCode });

            if (labStock === null) {
                const newLabStock = new this.labStockModel({
                    uniqueCode,
                    totalQuantity: item.quantity,
                    unitOfItem: item.item?.unitType,
                    itemDescription: item.item?.itemDescription,
                    itemName: item.item.itemName,
                    dateLastRestocked: new Date(),
                });

                labStockUpdates.push(newLabStock.save());
            } else {

                labStock.totalQuantity += item.quantity;
                labStock.dateLastRestocked = new Date();
                labStockUpdates.push(labStock.save());
            }
        }

        await Promise.all(labStockUpdates);

        order.approval = ApprovalEnum.FULFILLED;
        order.receivedBy = req.user;
        await order.save();

        return { order };
    } catch (error) {
        throw error;
    }
}


  //fulfill order
  async addLabStock(id: string, quantity: number) {
    try {
      const newTotalQuantity = await this.labStockModel.findByIdAndUpdate(
        id,
        { $inc: { totalQuantity: quantity } },
        { new: true },
      );
      if (!newTotalQuantity) {
        throw new NotFoundException('Lab stock not found');
      }
      return newTotalQuantity;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //update lab stock
  async updateLabStock(
    labStockId: string,
    labStock: UpdateLabStockDto,
  ): Promise<LabStockEntity> {
    try {
      const updatedLabStock = await this.labStockModel.findByIdAndUpdate(
        labStockId,
        { ...labStock, dateLastRestocked: new Date() },
        { new: true },
      );
      if (!updatedLabStock) {
        throw new NotFoundException('Lab stock not found');
      }
      return updatedLabStock;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //we want user to be able to use stock and it gets deducted from the totalquantity of lab stock item
  async useLabStock(
    data: RecordUsageDto[],
    investigationId: string,
    req: any,
  ): Promise<LabStockEntity> {
    try {
      let newTotalQuantity;
      for (let i = 0; i < data.length; i++) {
        const { item, quantity } = data[i];

        // const { item, quantity } = data;
        const labStock = await this.labStockModel.findById(item);
        if (!labStock) {
          throw new NotFoundException('Lab stock not found');
        }
        //the totalQuantity column is decremented with the quantity being passed as input
        //check if quantity is not more than totalQuantity
        if (+quantity > labStock.totalQuantity) {
          throw new BadRequestException('Quantity is more than total quantity');
        }

        newTotalQuantity = await this.labStockModel.findOneAndUpdate(
          { _id: item },
          { $inc: { totalQuantity: -quantity } },
          { new: true },
        );
        if (!newTotalQuantity) {
          throw new NotFoundException('Lab stock not found');
        }
        // we want to record the usage of lab stock
        const newStockUsage = new this.stockUsageModel({
          ...data,
          unit: labStock?.unitOfItem,
          usedBy: req.user,
          quantity: quantity,
          item: item,
        });
        await newStockUsage.save();
        //update the investigation stockUsage field with the lab stock used
      }

      const updatedInvestigation =
        await this.investigationModel.findByIdAndUpdate(
          investigationId,
          { $push: { stockUsage: data } },
          { new: true },
        );
      if (!updatedInvestigation) {
        throw new NotFoundException('Investigation not found');
      }

      return newTotalQuantity;

      // return newTotalQuantity;
    } catch (error) {
      throw error;
    }
  }

  //get usage history of lab stock item
  async getUsageHistory(
    labStockId: string,
    page = 1,
    limit = 15,
  ): Promise<StockUsageEntity[] | any> {
    try {
      const usageHistory = await this.stockUsageModel
        .find({
          item: labStockId,
        })
        .populate('usedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!usageHistory) {
        throw new NotFoundException('Usage history not found');
      }
      const count = await this.stockUsageModel.countDocuments({
        item: labStockId,
      });

      const totalPages = Math.ceil(count / limit);
      const currentPage = page;

      //get the details of the stock from labstock model
      const labStock = await this.labStockModel.findById(labStockId);
      return { usageHistory, count, currentPage, totalPages, labStock };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //get laboratory stock and paginate. you will be able to also search by name, category and location
  async getLabStock(
    page = 1,
    limit = 15,
    search?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const query = {};
      if (search) {
        query['$or'] = [
          { itemName: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        query['dateLastRestocked'] = {
          $gte: new Date(startDate)
            .toISOString()
            .replace(/T.*/, 'T00:00:00.000Z'),
          $lte: end,
        };
      }

      const labStock = await this.labStockModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const count = await this.labStockModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;

      return { labStock, currentPage, count, totalPages };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //order history
  async getOrderHistory(data?: FilterPatientDto): Promise<any> {
    try {
      const { page, limit, search = '', startDate, endDate } = data;
      const query = {};
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      const [orders, count] = await Promise.all([
        this.orderModel
          .find(query)
          .sort({ createdAt: -1 })
          .populate('createdBy', 'firstName lastName')
          .populate({
            path: 'items',
            populate: {
              path: 'item',
              model: 'ItemProductEntity',
            },
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.orderModel.countDocuments(query),
      ]);
      if (search) {
        const filteredOrders = orders.filter((order: any) => {
          return (
            order.createdBy?.firstName
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            order.createdBy?.lastName
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            order.item?.itemName
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            order.item?.category?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filteredOrders.length;
        const totalPages = Math.ceil(counts / limit);
        const currentPage = page;
        return {
          orders: filteredOrders,
          currentPage,
          count: counts,
          totalPages,
        };
      }

      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { orders, currentPage, count, totalPages };
    } catch (error) {
      throw error;
    }
  }

  //approve or decline multiple orders at once
  async approveMultipleOrders(
    orderIds: string[],
    status: ApprovalEnum,
    req: Request,
  ): Promise<any> {
    try {
      //find the orders and update their approval status for each to the status input
      const updatedOrders = await this.orderModel.updateMany(
        { id: { $in: orderIds } },
        { $set: { approval: status, approvedOrRejectedBy: req.user } },
        { new: true },
      );
      if (!updatedOrders) {
        throw new NotFoundException('Orders not found');
      }
      return updatedOrders;
    } catch (error) {
      throw error;
    }
  }

  //update order
  async approveOrder(
    orderId: string,
    status: ApprovalEnum,
    req: Request,
  ): Promise<OrderEntity> {
    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        orderId,
        { $set: { approval: status, approvedOrRejectedBy: req.user } },
        { new: true },
      );
      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }
      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }

  //get order by id
  async getOrderById(orderId: string): Promise<OrderEntity> {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  //get pending orders
  async getPendingOrders(data?: FilterPatientDto): Promise<any> {
    try {
      const { page, limit, search, startDate, endDate } = data;
      const query = { approval: ApprovalEnum.PENDING };
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      const [orders, count] = await Promise.all([
        this.orderModel
          .find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.orderModel.countDocuments(query),
      ]);
      if (search) {
        const filteredOrders = orders.filter((order: any) => {
          return (
            order.item?.itemName
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            order.item?.category?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filteredOrders.length;
        const totalPages = Math.ceil(counts / limit);
        return {
          orders: filteredOrders,
          totalPages,
          count: counts,
          currentPage: page,
        };
      }
      const totalPages = Math.ceil(count / limit);
      return { orders, totalPages, count, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  //get total count of requisitions
  async getTotalRequisitions(): Promise<any> {
    try {
      const totalRequisitions = await this.orderModel.countDocuments();
      return totalRequisitions;
    } catch (error) {
      throw error;
    }
  }
}
