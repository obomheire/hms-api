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
import {
  requisitionDto,
  UpdaterequisitionDto,
  approveRequisitionDto,
  RequisitionDisputeDto,
} from '../dto/requisition.dto';
import {
  RequisitionDocument,
  RequisitionEntity,
} from '../schema/requisition.schema';
import { Request } from 'express';
import { headApprovalDto } from 'src/utils/dtos/headApproval.dto';
import { ObjectNodeDependencies } from 'mathjs';
import { string } from 'joi';
import mongoose from 'mongoose';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import {
  disputeAccountRequsitionEnum,
  headApprovalEnum,
  requisitionStatusEnum,
} from 'src/utils/enums/requisitionStatus';
import { RequisitionDisputeEntity } from 'src/utils/schemas/dispute-requisition.schema';
import { FilterBodyDto } from 'src/inventory/dto/itemRequisition.dto';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';

@Injectable()
export class RequisitionService {
  constructor(
    @InjectModel(RequisitionEntity.name)
    private readonly requisitionModel: Model<RequisitionDocument>,
    @InjectModel(RequisitionDisputeEntity.name)
    private readonly requisitionDisputeModel: Model<RequisitionDisputeEntity>,
    private readonly appNotificationService: AppNotificationService,
  ) {}

  // We want to create a new requisition so that grandTotal is equals to sum of subTotalCost, shippingCost and otherCost multiply by salestax
  async createRequisition(requisitionDto: requisitionDto, req: Request) {
    const totalCost =
      requisitionDto.cost.subTotalCost +
      requisitionDto.cost.shippingCost +
      requisitionDto.cost.otherCost;
    const uniqueCode = Math.floor(100000 + Math.random() * 900000);
    const totalCostTax = totalCost * requisitionDto.cost.salesTax;
    try {
      const requisition = new this.requisitionModel({
        ...requisitionDto,
        requester: req.user,
        // grandTotal: totalCost + totalCostTax,
        uniqueCode,
      });
      const title = 'New Requisition';
      await this.appNotificationService.createNotification({
        userId: req.user.toString(),
        title,
        message: `A new requisition with title ${requisitionDto?.title} has been created from pharmacy`,
        to: 'ACCOUNTS'
      });
      return await requisition.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to get all requisitions and be able to search by title and location
  async getRequisitionsHistory(page = 1, limit = 15, search?: string) {
    try {
      const query = {};

      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      const requisitions = await this.requisitionModel
        .find(query)
        .populate('requester', 'firstName lastName')
        .populate({
          path: 'drugDetails',
          populate: {
            path: 'productType',
            model: 'DrugProductEntity',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const count = await this.requisitionModel.countDocuments(query).exec();
      const totalPages = Math.ceil(count / limit);
      return { requisitions, count, totalPages, currentPage: page };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to get a requisition by id
  async getRequisitionById(id: string) {
    try {
      const requisition = await this.requisitionModel.findById(id).exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to update a requisition by id
  async updateRequisitionById(
    id: string,
    updateRequisitionDto: UpdaterequisitionDto,
  ) {
    try {
      const requisition = await this.requisitionModel
        .findByIdAndUpdate(id, updateRequisitionDto, { new: true })
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to update only the headApproval field in the recuisition document using the headApprovalDto
  async headApprovalById(id: string, headApprovalDto: headApprovalDto) {
    try {
      const requisition = await this.requisitionModel
        .findByIdAndUpdate(
          id,
          { headApproval: headApprovalDto.headApproval },
          { new: true },
        )
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      if (headApprovalDto.headApprovalComment) {
        requisition.headApprovalComment = headApprovalDto.headApprovalComment;
      }

      return requisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to update only the requisitionStatus field in the recuisition document using the approveRequisitionDto
  async approveRequisition(
    id: string,
    approveRequisitionDto: approveRequisitionDto,
  ) {
    try {
      const requisition = await this.requisitionModel
        .findByIdAndUpdate(
          id,
          { requisitionStatus: approveRequisitionDto.requisitionStatus },
          { new: true },
        )
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to delete a requisition by id
  async deleteRequisitionById(id: string) {
    try {
      const requisition = await this.requisitionModel
        .findByIdAndDelete(id)
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // //We want to get all requisition by a requester
  async getAllRequisitionsByUser(userId: string) {
    const requesterId = new mongoose.Types.ObjectId(userId);
    try {
      const requisitions = await this.requisitionModel
        .find({ requester: requesterId })
        .exec();
      return requisitions;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to get all requisitions by a user and be able to search by title and location
  async getRequisitionsByUserIdAndSearch(
    userId: string,
    page: number,
    limit: number,
    search: string,
  ) {
    try {
      const requesterId = new mongoose.Types.ObjectId(userId);

      const requisitions = await this.requisitionModel
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
      return requisitions;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get all requisitions
  async getAllRequisitions(data?: FilterBodyDto) {
    try {
      const { search, startDate, endDate, status } = data;
      const query = {
        // accountApproval: headApprovalEnum.PENDING,
      };
      if (search) {
        query['$or'] = [
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          //or search by vendorName
          { "vendorDetails.vendorName": { $regex: search, $options: 'i' } },
          // {
          //   vendorDetails: {
          //     $elemMatch: {
          //       vendorName: { $regex: search, $options: 'i' },
          //     },
          //   },
          // },
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
      // we want to get requisition and populate the requester and productType in drugDetails
      const requisitions = await this.requisitionModel
        .find(query)
        .populate('checkedBy', 'firstName lastName')
        .populate('requester', 'firstName lastName')
        .populate({
          path: 'drugDetails',
          populate: {
            path: 'productType',
            model: 'DrugProductEntity',
          },
        })
        .sort({ createdAt: -1 })
        .exec();
      return requisitions;
    } catch (error) {
      throw error;
    }
  }

  

  //mark requisition as inspecting
  async markAsInspecting(id: string, req: any) {
    try {
      //the requisition can only be inspected if accountApproval and headApproval is APPROVED
      const requisitionApproved = await this.requisitionModel
        .findById(id)
        .exec();
      if (
        requisitionApproved.accountApproval !== headApprovalEnum.APPROVED ||
        requisitionApproved.headApproval !== headApprovalEnum.APPROVED
      ) {
        throw new BadRequestException('Requisition not approved yet');
      }

      const requisition = await this.requisitionModel
        .findByIdAndUpdate(
          id,
          { requisitionStatus: requisitionStatusEnum.INSPECTING, checkedBy: req.user },
          { new: true },
        )
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //mark requisition as fulfilled
  async markAsFulfilled(id: string) {
    try {
      //the requisition can only be fulfilled if accountApproval and headApproval is APPROVED
      const requisitionApproved = await this.requisitionModel
        .findById(id)
        .exec();
      if (
        requisitionApproved.accountApproval !== headApprovalEnum.APPROVED ||
        requisitionApproved.headApproval !== headApprovalEnum.APPROVED
      ) {
        throw new BadRequestException('Requisition not approved yet');
      }

      const requisition = await this.requisitionModel
        .findByIdAndUpdate(
          id,
          { requisitionStatus: requisitionStatusEnum.FULFILLED },
          { new: true },
        )
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      throw error;
    }
  }

  
  //acount approve requisition
  async accountApproveRequisition(
    id: string,
    approvalStatus: headApprovalEnum,
  ) {
    try {
      console.log(approvalStatus, 'approvalStatus')
      const requisition = await this.requisitionModel
        .findByIdAndUpdate(
          id,
          { accountApproval: approvalStatus },
          { new: true },
        )
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      return requisition;
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  //create requsition dispute
  async createRequisitionDispute(
    id: string,
    disputeDto: RequisitionDisputeDto,
    req: any,
  ) {
    const disputeId = Math.floor(Math.random() * 1000000000).toString();
    try {
      //check if the requisition is already disputed
      const requisitionDisputed = await this.requisitionDisputeModel
        .findOne({ requisition: id })
        .exec();
      if (requisitionDisputed) {
        throw new BadRequestException('Requisition already disputed');
      }
      const requisitionDispute = await this.requisitionDisputeModel.create({
        ...disputeDto,
        requisition: id,
        createdBy: req.user,
        department: 'PHARMACY',
        uniqueCode: disputeId,
      });
      //change the requisition status to DISPUTED
      const requisition = await this.requisitionModel
        .findByIdAndUpdate(
          id,
          { requisitionStatus: requisitionStatusEnum.DISPUTED },
          { new: true },
        )
        .exec();
      if (!requisition) {
        throw new NotFoundException('Requisition not found');
      }
      const title = 'Requisition Dispute';
      await this.appNotificationService.createNotification({
        userId: req.user.toString(),
        title,
        message: `A new dispute with code ${disputeId} has been created`,
        to: 'ACCOUNTS'
      });

      return requisitionDispute;
    } catch (error) {
      throw error;
    }
  }

  //get all pharmacy requisition disputes
  async getAllRequisitionDisputes(status?: disputeAccountRequsitionEnum, search?: string) {
    //get all requisition disputes where department is inventory
    try {
      const query = { department: 'PHARMACY' };
      if (status) {
        query['status'] = status;
      }
      if(search) {
        query['uniqueCode'] = search;
      }
      const allRequisitionDisputes = await this.requisitionDisputeModel
        .find(query)
        .populate('requisition')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      return allRequisitionDisputes;
    } catch (error) {
      throw error;
    }
  }

  //get one requisition dispute by id
  async changeRequisitionDisputeStatus(
    id: string,
    status: disputeAccountRequsitionEnum,
  ) {
    try {
    
      const requisitionDispute = await this.requisitionDisputeModel.findById(id).exec();
      if (!requisitionDispute) {
        throw new NotFoundException('Requisition dispute not found');
      }
      requisitionDispute.status = status;
      requisitionDispute.dateResolved = new Date();
      if (status === disputeAccountRequsitionEnum.RESOLVED) {
        //change the requisition status to RESOLVED
        const requisition = await this.requisitionModel
          .findByIdAndUpdate(
            requisitionDispute.requisition,
            { requisitionStatus: requisitionStatusEnum.RESOLVED },
            { new: true },
          )
          .exec();
        if (!requisition) {
          throw new NotFoundException('Requisition not found');
        }
      }

      return requisitionDispute;
    } catch (error) {
      throw error;
    }
  }

  //  //get all requisitions approved by account
  async getAllApprovedRequisitions(data?: FilterPatientDto) {
    try {
      const { search, startDate, endDate } = data;
      const query = {
        accountApproval: headApprovalEnum.APPROVED,
      };
      if (search) {
        query['uniqueCode'] = search;
      }
      if (startDate && endDate) {
        query['createdAt'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      const allApprovedRequisitions = await this.requisitionModel
        .find(query)
       
        .sort({ createdAt: -1 });
      return allApprovedRequisitions;
    } catch (error) {
      throw error;
    }
  }


  //get all requisitions for calendar filter
  async getAllRequisitionsForCalendar() {
    try {
      const allRequisitions = await this.requisitionModel
        .find({
          accountApproval: headApprovalEnum.APPROVED,
        })
        .sort({ createdAt: -1 })
        .exec();
      return allRequisitions;
    } catch (error) {
      throw error;
    }
  }


}
