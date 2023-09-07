import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  itemRequisitionDto,
  UpdateItemRequisitionDto,
  approveRequisitionDto,
  FilterBodyDto,
} from '../dto/itemRequisition.dto';
import {
  ItemRequisitionDocument,
  ItemRequisitionEntity,
} from '../schema/itemRequisition.schema';
import { Request } from 'express';
import { headApprovalDto } from 'src/utils/dtos/headApproval.dto';
import mongoose from 'mongoose';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import {
  disputeAccountRequsitionEnum,
  headApprovalEnum,
  requisitionStatusEnum,
} from 'src/utils/enums/requisitionStatus';
import { RequisitionDisputeEntity } from 'src/utils/schemas/dispute-requisition.schema';
import { RequisitionDisputeDto } from 'src/pharmacy/dto/requisition.dto';
import { RequisitionService } from 'src/pharmacy/service/requisition.service';
import { LabStockService } from 'src/laboratory/service/labStock.service';
import { CalendarFilterEnum } from 'src/patients/enum/visit-status.enum';
import moment from 'moment';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';

@Injectable()
export class ItemRequisitionService {
  constructor(
    @InjectModel(ItemRequisitionEntity.name)
    private readonly itemRequisitionModel: Model<ItemRequisitionDocument>,
    @InjectModel(RequisitionDisputeEntity.name)
    private readonly requisitionDisputeModel: Model<RequisitionDisputeEntity>,
    private readonly requisitionService: RequisitionService,
    private readonly labStockService: LabStockService,
    private readonly appNotificationService: AppNotificationService,
  ) {}

  // We want to create a new item requisition so that grandTotal is equals to sum of subTotalCost, shippingCost and otherCost multiply by salestax
  async createItemRequisition(
    itemRequisitionDto: itemRequisitionDto,
    req: Request,
  ) {
    try {
      if (itemRequisitionDto.cost) {
        const totalCost =
          itemRequisitionDto.cost.subTotalCost +
          itemRequisitionDto.cost.shippingCost +
          itemRequisitionDto.cost.otherCost;

        const totalCostTax = totalCost * itemRequisitionDto.cost.salesTax;
        const uniqueCode = Math.floor(100000 + Math.random() * 900000);
        const itemRequisition = new this.itemRequisitionModel({
          ...itemRequisitionDto,
          requester: req.user,
          grandTotal: totalCost + totalCostTax,
          uniqueCode,
        });
        const title = 'New Requisition';
        await this.appNotificationService.createNotification({
          userId: req.user.toString(),
          message: `New requisition  with code ${uniqueCode} has been created from inventory`,
          title,
          to: 'ACCOUNTS'
        });
        return await itemRequisition.save();
      } else {
        const uniqueCode = Math.floor(100000 + Math.random() * 900000);
        const itemRequisition = new this.itemRequisitionModel({
          ...itemRequisitionDto,
          requester: req.user,
          uniqueCode,
        });
        const title = 'New Requisition';
        await this.appNotificationService.createNotification({
          userId: req.user.toString(),
          message: `New requisition  with code ${uniqueCode} has been created from inventory`,
          title,
          to: 'ACCOUNTS'
        });
        return await itemRequisition.save();
      }

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // // We want to get all item requisitions and be able to search by title and location and also return the total count
  // async getItemRequisitionsHistory(
  //   page: number,
  //   limit: number,
  //   search: string,
  // ) {
  //   try {
  //     const itemRequisitions = await this.itemRequisitionModel
  //       .find({
  //         $or: [
  //           { title: { $regex: search, $options: 'i' } },
  //           { location: { $regex: search, $options: 'i' } },
  //         ],
  //       })
  //       .populate('requester', 'firstName lastName')
  //       .sort({ createdAt: -1 })
  //       .skip(page * limit)
  //       .limit(limit);
  //     const count = await this.itemRequisitionModel
  //       .find({
  //         $or: [
  //           { title: { $regex: search, $options: 'i' } },
  //           { location: { $regex: search, $options: 'i' } },
  //         ],
  //       })
  //       .countDocuments();
  //     return { itemRequisitions, count };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  // We want to get a requisition by id
  async getItemRequisitionById(id: string) {
    try {
      const itemRequisition = await this.itemRequisitionModel
        .findById(id)
        .populate('requester', 'firstName lastName');
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async processRequisition(id: string) {
    try {
      console.log('hey');
      let isPharmacy: boolean = false;
      let requisition: any = {};
      requisition = await this.itemRequisitionModel
        .findById(id)
        .populate('requester', 'firstName lastName');
      if (!requisition) {
        isPharmacy = true;
        requisition = await this.requisitionService.getRequisitionById(id);
      }
      // console.log(requisition, isPharmacy, 'hey')
      return { isPharmacy, requisition };
    } catch (error) {
      throw error;
    }
  }

  // We want to update a requisition by id
  async updateItemRequisitionById(
    id: string,
    updateItemRequisitionDto: UpdateItemRequisitionDto,
  ) {
    try {
      const itemRequisition = await this.itemRequisitionModel
        .findByIdAndUpdate(id, updateItemRequisitionDto, {
          new: true,
        })
        .populate('requester', 'firstName lastName');
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to update only the headApproval field in the item recuisition document using the headApprovalDto
  async headApprovalById(id: string, headApprovalDto: headApprovalDto) {
    try {
      const itemRequisition = await this.itemRequisitionModel
        .findByIdAndUpdate(
          id,
          { headApproval: headApprovalDto.headApproval },
          { new: true },
        )
        .populate('requester', 'firstName lastName');
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to update only the item requisitionStatus field in the recuisition document using the approveRequisitionDto
  async approveRequisition(
    id: string,
    approveRequisitionDto: approveRequisitionDto,
  ) {
    try {
      const itemRequisition = await this.itemRequisitionModel
        .findByIdAndUpdate(
          id,
          { requisitionStatus: approveRequisitionDto.requisitionStatus },
          { new: true },
        )
        .populate('requester', 'firstName lastName');
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async accountApproveRequisition(
    id: string,
    approvalStatus: headApprovalEnum,
  ) {
    try {
      const itemRequisition = await this.itemRequisitionModel
        .findByIdAndUpdate(
          id,
          { accountApproval: approvalStatus },
          { new: true },
        )
        .populate('requester', 'firstName lastName');
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to update only the item requisitionStatus field in the recuisition document using the approveRequisitionDto for all the records
  async approveAllRequisitions(
    approveRequisitionDto: approveRequisitionDto,
  ): Promise<any> {
    try {
      const itemRequisition = await this.itemRequisitionModel
        .updateMany(
          { requisitionStatus: requisitionStatusEnum.PENDING },
          { requisitionStatus: approveRequisitionDto.requisitionStatus },
        )
        .populate('requester', 'firstName lastName');
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to delete a item requisition by id
  async deleteItemRequisitionById(id: string) {
    try {
      const itemRequisition = await this.itemRequisitionModel.findByIdAndDelete(
        id,
      );
      if (!itemRequisition) {
        throw new NotFoundException('Requisition not found');
      }
      return itemRequisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to get all requisitions by a user and be able to search by title and location
  async getItemRequisitionsByUserIdAndSearch(
    userId: string,
    page: number,
    limit: number,
    search: string,
  ) {
    try {
      const requesterId = new mongoose.Types.ObjectId(userId);

      const itemRequisitions = await this.itemRequisitionModel
        .find({
          requester: requesterId,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
          ],
        })
        .populate('requester', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit);
      return itemRequisitions;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get count of all requisitions
  async getCountOfAllRequisitions() {
    try {
      const count = await this.itemRequisitionModel.countDocuments();
      return count;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get total cost of all requisitions
  async getTotalCostOfAllRequisitions() {
    try {
      const totalCost = await this.itemRequisitionModel.aggregate([
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$grandTotal' },
          },
        },
      ]);
      return totalCost;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get all pending requisitions
  async getAllPendingRequisitions() {
    try {
      const pendingRequisitions = await this.itemRequisitionModel
        .find({
          requisitionStatus: requisitionStatusEnum.PENDING,
        })
        .sort({ createdAt: -1 });
      return pendingRequisitions;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get all requisitions
  async getAllRequisitions(data?: FilterBodyDto) {
    try {
      const { search, startDate, endDate, page, limit, status, department } =
        data;
      const query = {};
      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }
      if (startDate && endDate) {
        query['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      if (status) {
        query['requisitionStatus'] = status;
      }
      if (department) {
        query['department'] = department;
      }
      const allRequisitions = await this.itemRequisitionModel
        .find(query)
        .populate('requester', 'firstName lastName')
        .populate('checkedBy', 'firstName lastName')
        .populate({
          path: 'inventoryDetails',
          populate: {
            path: 'productType',
            model: 'ItemProductEntity',
          },
        })

        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await this.itemRequisitionModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { allRequisitions, totalPages, currentPage, count };
    } catch (error) {
      throw error;
    }
  }

  async getRequisitionsForAccount(data?: FilterBodyDto) {
    try {
      const { search, startDate, endDate, page, limit, status } = data;
      const query = {
        // accountApproval: headApprovalEnum.PENDING,
      };
      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },

          { 'vendorDetails.vendorName': { $regex: search, $options: 'i' } },
        ];
      }
      // if (startDate && endDate) {
      //   query['createdAt'] = {
      //     $gte: new Date(startDate),
      //     $lte: new Date(endDate),
      //   };
      // }
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
      if (status) {
        query['accountApproval'] = status;
      }
      const allRequisitions = await this.itemRequisitionModel
        .find(query)
        .populate({
          path: 'inventoryDetails',
          populate: {
            path: 'productType',
            model: 'ItemProductEntity',
          },
        })
        .populate('requester', 'firstName lastName')
        .populate('checkedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      return allRequisitions;
    } catch (error) {
      throw error;
    }
  }

  //create requisition dispute
  async createRequisitionDispute(
    id: string,
    createRequisitionDisputeDto: RequisitionDisputeDto,
    req: any,
  ) {
    const disputeId = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      //check if requisition already has a dispute
      const requisitionDisputeExists =
        await this.requisitionDisputeModel.findOne({
          requisition: id,
        });
      if (requisitionDisputeExists) {
        throw new BadRequestException('Requisition already has a dispute');
      }
      const requisitionDispute = await this.requisitionDisputeModel.create({
        ...createRequisitionDisputeDto,
        requisition: id,
        uniqueCode: disputeId,
        createdBy: req.user,
        department: 'INVENTORY',
      });
      //update requisition status to disputed
      await this.itemRequisitionModel.findByIdAndUpdate(id, {
        requisitionStatus: requisitionStatusEnum.DISPUTED,
      });
      await this.appNotificationService.createNotification({
        userId: req.user.toString(),
        title: 'Requisition Dispute',
        message: `A new dispute with code ${disputeId} has been created`,
        to: 'ACCOUNTS',
      });
      return requisitionDispute;
    } catch (error) {
      throw error;
    }
  }

  //get all requisition disputes
  async getAllRequisitionDisputes(
    status?: disputeAccountRequsitionEnum,
    search?: string,
  ) {
    //get all requisition disputes where department is inventory
    try {
      const query = { department: 'INVENTORY' };
      if (status) {
        query['status'] = status;
      }
      if (search) {
        query['uniqueCode'] = search;
      }
      const allRequisitionDisputes: any = await this.requisitionDisputeModel
        .find(query)
        // .populate({
        //   //we want to populate the requisition field and state that it must be from ItemRequisitionEntity
        //   path: 'requisition',
        //   model: 'ItemRequisitionEntity',
        //   populate: {
        //     path: 'requester',
        //     model: 'UserEntity',
        //   },
        // })
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      //now we want to populate the requisition field and state that it must be from ItemRequisitionEntity

      for (let i = 0; i < allRequisitionDisputes.length; i++) {
        const requisition = await this.itemRequisitionModel
          .findById(allRequisitionDisputes[i].requisition)
          .populate('requester', 'firstName lastName');
        allRequisitionDisputes[i].requisition = requisition;
      }
      console.log(allRequisitionDisputes);

      return allRequisitionDisputes;
    } catch (error) {
      throw error;
    }
  }

  async changeRequisitionDisputeStatus(
    id: string,
    status: disputeAccountRequsitionEnum,
  ) {
    try {
      //
      const dispute = await this.requisitionDisputeModel.findById(id);
      if (dispute.department === 'PHARMACY') {
        await this.requisitionService.changeRequisitionDisputeStatus(
          id,
          status,
        );
      }
      dispute.status = status;
      dispute.dateResolved = new Date();
      await dispute.save();
      if (status === disputeAccountRequsitionEnum.RESOLVED) {
        //update requisition status to resolved
        await this.itemRequisitionModel.findByIdAndUpdate(dispute.requisition, {
          requisitionStatus: requisitionStatusEnum.RESOLVED,
        });
      }
      return dispute;
    } catch (error) {
      throw error;
    }
  }

  //mark requisition as inspecting
  async markRequisitionAsInspecting(id: string, req: any) {
    try {
      const requisition = await this.itemRequisitionModel.findById(id);
      if (
        requisition.headApproval !== headApprovalEnum.APPROVED ||
        requisition.accountApproval !== headApprovalEnum.APPROVED
      ) {
        throw new BadRequestException(
          'Requisition not approved by head or account',
        );
      }
      requisition.requisitionStatus = requisitionStatusEnum.INSPECTING;
      requisition.checkedBy = req.user;
      await requisition.save();
      return requisition;
    } catch (error) {
      throw error;
    }
  }

  //get all requisitions for a particular productType
  async getAllRequisitionsForProductType(
    productTypeId: string,
    search?: string,
  ) {
    try {
      const query = {
        'inventoryDetails.productType': productTypeId,
      };
      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }
      const allRequisitions = await this.itemRequisitionModel

        .find(query)
        .populate('requester', 'firstName lastName')
        .populate('checkedBy', 'firstName lastName')
        .populate({
          path: 'inventoryDetails',
          populate: {
            path: 'productType',
            model: 'ItemProductEntity',
          },
        })
        .sort({ createdAt: -1 });

      return allRequisitions;
    } catch (error) {
      throw error;
    }
  }

  //fuflfill requisition
  async fulfillRequisition(id: string) {
    try {
      return await this.itemRequisitionModel.findByIdAndUpdate(id, {
        requisitionStatus: requisitionStatusEnum.FULFILLED,
      });
    } catch (error) {
      throw error;
    }
  }

  //get all requisition hsitory for a particular productType
  async getAllRequisitionHistoryForProductType(
    productTypeId: string,
    data?: FilterBodyDto,
  ) {
    const { search, startDate, endDate, page, limit } = data;
    try {
      const query = {
        'inventoryDetails.productType': productTypeId,
        requisitionStatus: requisitionStatusEnum.FULFILLED,
      };
      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      if (startDate && endDate) {
        query['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      const allRequisitions = await this.itemRequisitionModel
        .find(query)
        .populate('requester', 'firstName lastName')
        .populate('checkedBy', 'firstName lastName')
        .populate({
          path: 'inventoryDetails',
          populate: {
            path: 'productType',
            model: 'ItemProductEntity',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const count = await this.itemRequisitionModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { allRequisitions, totalPages, currentPage, count };
    } catch (error) {
      throw error;
    }
  }

  //get all requisitions approved by account
  async getAllRequisitionsApprovedByAccount(data?: FilterPatientDto) {
    try {
      const { search, startDate, endDate } = data;
      const query = {
        accountApproval: headApprovalEnum.APPROVED,
      };
      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      if (startDate && endDate) {
        query['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      const allRequisitions = await this.itemRequisitionModel
        .find(query)

        // .populate({
        //   path: 'inventoryDetails',
        //   populate: {
        //     path: 'productType',
        //     model: 'ItemProductEntity',
        //   },
        // })
        .sort({ createdAt: -1 });

      return allRequisitions;
    } catch (error) {
      throw error;
    }
  }

  //get all requisition
  async getCalendarFilter(data?: CalendarFilterEnum) {
    try {
      const investoryRequisition = await this.itemRequisitionModel
        .find({
          accountApproval: headApprovalEnum.APPROVED,
        })
        .sort({ createdAt: -1 });
      const pharmacyRequsition =
        await this.requisitionService.getAllRequisitionsForCalendar();
      const allRequisition = [...investoryRequisition, ...pharmacyRequsition];
      if (data === CalendarFilterEnum.WEEKLY) {
        let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(
          new Date().setDate(new Date().getDate() - 7),
        ).toISOString();

        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayOfWeek = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ][date.getDay()];
          dates.push({ date: date.toISOString().substring(0, 10), dayOfWeek });
        }
        const transactions = allRequisition.filter((transaction: any) => {
          const createdAt = new Date(transaction.createdAt).toISOString();
          return createdAt >= start && createdAt <= end;
        });
        const grouped = dates.map((date) => {
          const transactionsPerDay = transactions.filter((transaction: any) => {
            const createdAt = new Date(transaction.createdAt).toISOString();
            return createdAt.includes(date.date);
          });
          console.log(
            transactionsPerDay,
            'transactionsPerDay',
            transactionsPerDay.map(
              (transaction: any) => transaction?.grandTotal,
            ),
          );
          const totalCost = transactionsPerDay.reduce(
            (acc, transaction: any) => {
              return acc + transaction?.grandTotal;
            },
            0,
          );
          return { ...date, totalCost };
        });
        return grouped;
      }

      
      if (data === CalendarFilterEnum.MONTHLY || !data) {

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const months = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date(currentYear, currentMonth - i, 1);
          months.push(date.toISOString().substring(0, 7));
        }

        const transactions = allRequisition.filter((transaction: any) => {
          const createdAt = new Date(transaction.createdAt);
          return (
            createdAt >= new Date(currentYear, currentMonth - 11, 1) &&
            createdAt <= currentDate
          );
        });
       

        const grouped = months.map((month) => {
          const transactionsPerMonth = transactions.filter((transaction: any) => {
            const createdAt = new Date(transaction.createdAt);
            const monthStr = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
            return month === monthStr;
          });
          const totalCost = transactionsPerMonth.reduce((acc, transaction: any) => {
            return acc + transaction?.grandTotal;
          }, 0);
          return {
            month: moment(month).format('MMMM'),
            totalCost: totalCost,
          };
        });
        return grouped;
      }

      if (data === CalendarFilterEnum.YEARLY) {
        let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(
          new Date().setFullYear(new Date().getFullYear() - 10),
        ).toISOString();

        const years = [];
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          years.push(date.toISOString().substring(0, 4));
        }
        const transactions = allRequisition.filter((transaction: any) => {
          const createdAt = new Date(transaction.createdAt).toISOString();
          return createdAt >= start && createdAt <= end;
        });
        const grouped = years.map((year) => {
          const transactionsPerYear = transactions.filter(
            (transaction: any) => {
              const createdAt = new Date(transaction.createdAt).toISOString();
              return createdAt.includes(year);
            },
          );
          const totalCost = transactionsPerYear.reduce(
            (acc, transaction: any) => {
              return acc + transaction?.grandTotal;
            },
            0,
          );
          
          return { year, totalCost };
        });
        return grouped;
      }
    } catch (error) {
      throw error;
    }
  }
}
