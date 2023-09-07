import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterBodyDto } from 'src/inventory/dto/itemRequisition.dto';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';
import { AcceptOrRejectFollowUpDto, FollowUpDto } from '../dto/follow-up.dto';
import { FollowUpStatusEnum } from '../enum/follow-up-status.enum';
import { FollowUpDocument, FollowUpEntity } from '../schema/follow-up.schema';
import { PatientsService } from './patients.service';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectModel(FollowUpEntity.name)
    private readonly followUpModel: Model<FollowUpDocument>,
    private readonly appNotificationService: AppNotificationService,
    private readonly patientService: PatientsService,
  ) {}

  //logged in patient can create follow up
  async createFollowUp(
    followUp: FollowUpDto,
    req: any,
  ): Promise<FollowUpDocument> {
    try {
      // const followUpExists = await this.followUpModel.findOne({
      //   patientId: req.user,
      //   visitId: followUp.visitId,
      // });
      // if (followUpExists.status === FollowUpStatusEnum.PENDING) {
      //   throw new ConflictException("Follow up already exists");
      // }
      const newFollowUp = new this.followUpModel({
        ...followUp,
        patientId: req.user,
      });

      await newFollowUp.save();
      //then we want to populate the visitDetails with the visitId and populate the doctor in the visitDetails
      //then pick the last visitItem in the visitDetails and get the doctor from it
      const data: any = await this.followUpModel
        .findById(newFollowUp._id)
        .populate({
          path: 'visitId',
          populate: {
            path: 'visitDetails',
            populate: {
              path: 'doctor',
              model: 'UserEntity',
              select: 'firstName lastName email ID',
            },
          },
        });
      //then get the last visitItem in the visitDetails and get the doctor from it
      const last =
        data.visitId.visitDetails[data.visitId.visitDetails.length - 1];
      const doctor = last.doctor;
      //then save the doctor in the follow up
      newFollowUp.doctor = doctor;

      const patientDetails = await this.patientService.getPatientById(
        req.user.toString(),
      );
      const title = 'Follow Up';
      await this.appNotificationService.createNotification({
        userId: doctor.id,
        message: `${patientDetails.firstName} ${patientDetails.lastName} has requested a follow up`,
        title,
        to: 'FRONT-DESK',
      }),
        await this.appNotificationService.createNotification({
          userId: patientDetails.id,
          message: `You have requested a follow up`,
          title,
          to: 'PATIENT',
        });

      return await newFollowUp.save();
    } catch (error) {
      throw error;
    }
  }

  //logged in patient can get all follow ups
  async getFollowUps(req: any): Promise<FollowUpDocument[]> {
    try {
      const followUps = await this.followUpModel.find({ patientId: req.user });
      return followUps;
    } catch (error) {
      throw error;
    }
  }

  //update follow up
  async updateFollowUp(
    followUpId: string,
    appointment: string,
  ): Promise<FollowUpDocument> {
    try {
      const followUp = await this.followUpModel.findById(followUpId);
      followUp.appointment = appointment;
      await followUp.save();
      return followUp;
    } catch (error) {
      throw error;
    }
  }

  async getFollowUpsAll(data?: FilterBodyDto): Promise<any> {
    try {
      const query = {
        //we want to get status pending and rescduled
        status: {
          $in: [FollowUpStatusEnum.PENDING, FollowUpStatusEnum.RESCHEDULED],
        },
      };

      const { page, limit, search, startDate, endDate } = data;
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
      let followUps = await this.followUpModel
        .find({ ...query })
        .populate('patientId', 'firstName lastName email ID')
        //then we wanto populate the visitDetails with the visitId and populate the doctor in the visitDetails
        .populate('doctor', 'firstName lastName email ID')
        .sort({ createdAt: -1 });
      // .skip((page - 1) * limit).limit(limit);
      if (search) {
        const filteredAppointments = followUps.filter((appointment: any) => {
          return (
            appointment.patientId?.firstName
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            appointment.patientId?.lastName
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            appointment.patientId?.ID.toLowerCase().includes(
              search.toLowerCase(),
            )
          );
        });
        followUps = filteredAppointments;
      }
      const count = followUps.length;
      //now paginate
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      followUps = followUps.slice((page - 1) * limit, page * limit);
      //

      return { followUps, count, totalPages, currentPage };
      return followUps;
    } catch (error) {
      throw error;
    }
  }

  //logged in patient can get follow up by id
  async getFollowUpById(followUpId: string): Promise<FollowUpDocument> {
    try {
      const followUp = await (
        await this.followUpModel.findById(followUpId)
      ).populate('visitId');
      return followUp;
    } catch (error) {
      throw error;
    }
  }

  //change status of follow up
  async changeFollowUpStatus(
    followUpId: string,
    status: FollowUpStatusEnum,
  ): Promise<FollowUpDocument> {
    try {
      return await this.followUpModel.findByIdAndUpdate(
        followUpId,
        {
          status,
        },
        {
          new: true,
        },
      );
    } catch (error) {
      throw error;
    }
  }
  //accept or reject an appointment booked following a follow up request,

  //when accepted, the follow up status turns to ACCEPTED

  //if rescheduled, the follow up status turns to RESCHEDULED and description is added

  async acceptOrRejectFollowUp(
    followUpId: string,
    data: AcceptOrRejectFollowUpDto,
  ): Promise<FollowUpDocument> {
    try {
      const { status, description } = data;
      return await this.followUpModel.findByIdAndUpdate(
        followUpId,
        {
          status,
          description,
        },
        {
          new: true,
        },
      );
    } catch (error) {
      throw error;
    }
  }
}
