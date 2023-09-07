import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { TestStatusEnum } from 'src/utils/enums/patients/testStatus.enum';
import { Request } from 'express';
import {
  InvestigationDocument,
  InvestigationEntity,
} from 'src/patients/schema/investigation.schema';
import {
  CreateIndividualInvestigationDto,
  CreateInvestigationDto,
  IndividualInvestigationDto,
  InvestigationDto,
  InvestigationResultDto,
  InvestigationReturn,
  UpdateInvestigationDto,
} from 'src/patients/dto/investigation.dto';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import { v4 as uuid } from 'uuid';
import { TestService } from 'src/laboratory/service/test.service';
import { TestEntity } from 'src/laboratory/schema/test.schema';
import { generatePdf } from 'src/utils/functions/generatePdf';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';
import { PatientsService } from './patients.service';
import { UserService } from 'src/user/services/user.service';
import { InvestigationBookingService } from 'src/investigation-booking/services/investigation-booking.service';
import { compareDateWithCurrentDate } from 'src/utils/constants/constant';

@Injectable()
export class InvestigationService {
  constructor(
    @InjectModel(InvestigationEntity.name)
    private readonly investigationModel: Model<InvestigationDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly appNotificationService: AppNotificationService,
    private readonly patientService: PatientsService,
    private readonly userService: UserService,
    private readonly investigationBookingService: InvestigationBookingService,
    private readonly testService: TestService,
  ) {}

  async createInvestigation(
    data: InvestigationDto,
    req: Request,
  ): Promise<InvestigationDocument[]> {
    try {
      let patientDetails;
      //create new investigation from dto that is an array of investigations and generate a unique 7 digit code for each
      //and then we want to make totalCost field be equal to the rate in the test schema
      const patientId = data.patient;
      const newInvestigations = await Promise.all(
        data.investigations.map(async (investigation) => {
          const newInvestigation = new this.investigationModel({
            ...investigation,
            uniqueCode: uuid().slice(0, 7),
            doctor: req.user,
            date: new Date().toISOString(),
            patient: data.patient,
          });
          const test = await newInvestigation.populate('test');
          const checkTest: any = test.test;
          const rate = checkTest.rate;

          patientDetails = await this.patientService.getPatientById(patientId);

          newInvestigation.totalCost = rate;

          return newInvestigation.save();
        }),
      );
      const doctorDetails = await this.userService.getStaff(
        req.user.toString(),
      );
      const title = 'New Investigation';
      await this.appNotificationService.createNotification({
        userId: req.user.toString(),
        message: `New investigation created for ${patientDetails?.firstName} ${patientDetails?.lastName}`,
        title,
        to: 'Laboratory',
      }),
        await this.appNotificationService.createNotification({
          userId: patientDetails.id,
          message: `New investigation created for ${patientDetails?.firstName} ${patientDetails?.lastName} by ${doctorDetails?.firstName} ${doctorDetails?.lastName}`,
          title,
          key: 'Accounts',
          to: 'ACCOUNTS',
        });
      await this.appNotificationService.createNotification({
        userId: patientDetails.id,
        message: `New investigation created for you by ${doctorDetails?.firstName} ${doctorDetails?.lastName}`,
        title,
        key: 'Laboratory',
        to: 'PATIENT',
      });
      return newInvestigations;
    } catch (error) {
      throw error;
    }
  }

  //update investigation
  async updateInvestigation(
    investigation: UpdateInvestigationDto,
    investigationId: string,
  ): Promise<InvestigationDocument> {
    try {
      const updatedInvestigation =
        await this.investigationModel.findByIdAndUpdate(
          { id: investigationId },
          { ...investigation },
          { new: true },
        );
      if (!updatedInvestigation) {
        throw new NotFoundException('Investigation not found');
      }
      return updatedInvestigation;
    } catch (error) {
      throw error;
    }
  }

  //update investigationstatus
  async updateInvestigationStatus(
    investigationId: string,
  ): Promise<InvestigationDocument> {
    return await this.investigationModel.findByIdAndUpdate(
        investigationId ,
        { status: TestStatusEnum.PAID },
        { new: true },
      );
  }
  //get investigation
  async getInvestigation(id: string): Promise<InvestigationDocument> {
    try {
      const investigation = await this.investigationModel
        .findById(id)
        .populate('doctor')
        .populate('patient')
        .populate('test');
      return investigation;
    } catch (error) {
      throw error;
    }
  }

  //get all investigations for a patient
  async getInvestigations(patientId: string): Promise<InvestigationDocument[]> {
    try {
      console.log(patientId, 'patientId');
      const investigations = await this.investigationModel
        .find({
          patient: patientId,
          status: TestStatusEnum.PENDING,
        })
        .populate('test')
        .populate('doctor', 'firstName lastName')
        .populate('patient');
      console.log(investigations, 'investigations');
      if (!investigations) {
        throw new NotFoundException('Investigations not found');
      }
      return investigations;
    } catch (error) {
      throw error;
    }
  }

  //delete investigation only if status is pending
  async deleteInvestigation(id: string): Promise<string> {
    try {
      const investigation = await this.investigationModel.findById(id);
      if (!investigation) {
        throw new NotFoundException('Investigation not found');
      }
      if (investigation.status !== TestStatusEnum.PENDING) {
        throw new Error('can not delete investigation');
      }
      await this.investigationModel.findByIdAndDelete(id);
      return 'Investigation deleted successfully';
    } catch (error) {
      throw error;
    }
  }

  //mark investigation as ongoing
  async markInvestigationAsOngoing(id: string): Promise<InvestigationDocument> {
    try {
      const investigation = await this.investigationModel.findById(id);
      if (!investigation) {
        throw new NotFoundException('Investigation not found');
      }
      if (investigation.status !== TestStatusEnum.PAID) {
        throw new NotFoundException('Investigation not paid');
      }
      // if (investigation.status !== TestStatusEnum.PENDING) {
      //   throw new ConflictException('can not mark investigation as ongoing');
      // }
      investigation.status = TestStatusEnum.ONGOING;
      return await investigation.save();
    } catch (error) {
      throw error;
    }
  }

  //mark investigation as completed
  async markInvestigationAsCompleted(
    id: string,
  ): Promise<InvestigationDocument> {
    try {
      const investigation = await this.investigationModel.findById(id);
      if (!investigation) {
        throw new NotFoundException('Investigation not found');
      }
      investigation.status = TestStatusEnum.COMPLETED;
      return await investigation.save();
    } catch (error) {
      throw error;
    }
  }

  //get pending investigations
  async getPendingInvestigations(
    data?: FilterPatientDto,
  ): Promise<InvestigationReturn> {
    try {
      const { startDate, endDate, search, page, limit } = data;
      const query: FilterQuery<InvestigationDocument> = {
        status: { $in: [TestStatusEnum.PENDING, TestStatusEnum.PAID] },
      };
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
      //if search, to be able to search with patient first name, last name or uniqueID

      const investigations = await this.investigationModel
        .find(query)
        .populate('patient')
        .populate('doctor')
        .populate('test')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 });
      if (!investigations) {
        throw new NotFoundException('Investigations not found');
      }
      if (search) {
        const filteredInvestigations = investigations.filter(
          (investigation: any) => {
            return (
              investigation.patient?.firstName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.lastName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.ID?.toLowerCase().includes(
                search.toLowerCase(),
              )
            );
          },
        );
        const count = filteredInvestigations.length;
        const totalPages = Math.ceil(count / limit);
        return {
          investigations: filteredInvestigations,
          totalPages,
          count,
          currentPage: page,
        };
      }

      const count = investigations.length;
      const totalPages = Math.ceil(count / limit);
      return { investigations, totalPages, count, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  //get completed investigations
  async getCompletedInvestigations(
    data?: FilterPatientDto,
  ): Promise<InvestigationReturn> {
    try {
      const { startDate, endDate, search, page, limit } = data;
      const query = {
        status: TestStatusEnum.COMPLETED,
      };
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      const investigations = await this.investigationModel
        .find(query)
        .populate('patient')
        .populate('doctor')
        .populate('test')
        //populate the item in the array of stockUsage with the stock item
        .populate({
          path: 'stockUsage',
          populate: {
            path: 'item',
            model: 'LabStockEntity',
          },
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 });
      if (!investigations) {
        throw new NotFoundException('Investigations not found');
      }
      if (search) {
        const filteredInvestigations = investigations.filter(
          (investigation: any) => {
            return (
              investigation.patient?.firstName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.lastName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.ID?.toLowerCase().includes(
                search.toLowerCase(),
              )
            );
          },
        );
        const counts = filteredInvestigations.length;
        const totalPages = Math.ceil(counts / limit);
        return {
          investigations: filteredInvestigations,
          totalPages,
          count: counts,
          currentPage: page,
        };
      }

      const count = await this.investigationModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      return { investigations, totalPages, count, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  //get completed and ongoing investigations together
  // async getCompletedAndOngoingInvestigations(
  //   data?: FilterPatientDto,
  // ): Promise<InvestigationReturn> {
  //   try {
  //     const { startDate, endDate, search, page, limit } = data;
  //     //we want to get all investigations that are either completed or ongoing
  //     const query = {
  //       status: { $ne: TestStatusEnum.COMPLETED },
  //     };
  //     if (startDate) {
  //       let end = endDate
  //         ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
  //         : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
  //       let start = new Date(startDate).toISOString();
  //       query['createdAt'] = { $gte: start, $lte: end };
  //     }

  //     const investigations = await this.investigationModel
  //       .find(query)
  //       .populate('patient', 'firstName lastName age ID gender dateOfBirth')
  //       .populate('doctor', 'firstName lastName age gender')
  //       .populate('test')
  //       .skip((page - 1) * limit)
  //       .limit(limit);
  //     if (!investigations) {
  //       throw new NotFoundException('Investigations not found');
  //     }
  //     if (search) {
  //       const filteredInvestigations = investigations.filter(
  //         (investigation: any) => {
  //           return (
  //             investigation.patient?.firstName
  //               ?.toLowerCase()
  //               .includes(search.toLowerCase()) ||
  //             investigation.patient?.lastName
  //               ?.toLowerCase()
  //               .includes(search.toLowerCase()) ||
  //             investigation.patient?.ID?.toLowerCase().includes(
  //               search.toLowerCase(),
  //             )
  //           );
  //         },
  //       );
  //       const counts = filteredInvestigations.length;
  //       const totalPages = Math.ceil(counts / limit);
  //       return {
  //         investigations: filteredInvestigations,
  //         totalPages,
  //         count: counts,
  //         currentPage: page,
  //       };
  //     }
  //     const count = await this.investigationModel.countDocuments(query);
  //     const totalPages = Math.ceil(count / limit);
  //     return { investigations, totalPages, count, currentPage: page };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getCompletedAndOngoingInvestigations(
    data?: FilterPatientDto,
  ): Promise<InvestigationReturn> {
    try {
      const { startDate, endDate, search, page, limit } = data;
  
      let query: any = {
        status: { $ne: TestStatusEnum.COMPLETED },
      };
  
      if (startDate) {
        const end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        const start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
  
      
      const investigationsQuery = this.investigationModel.find(query);
      investigationsQuery.populate('patient', 'firstName lastName age ID gender dateOfBirth');
      investigationsQuery.populate('doctor', 'firstName lastName age gender');
      investigationsQuery.populate('test');
      //sort 
      investigationsQuery.sort({ updatedAt: -1 });
      investigationsQuery.skip((page - 1) * limit).limit(limit);
  
      const investigations = await investigationsQuery;
  
      if (!investigations.length) {
        throw new NotFoundException('Investigations not found');
      }
  
      if (search) {
        const filteredInvestigations = investigations.filter((investigation: any) => {
          return (
            investigation.patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            investigation.patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            investigation.patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
  
        const counts = filteredInvestigations.length;
        const totalPages = Math.ceil(counts / limit);
  
        return {
          investigations: filteredInvestigations,
          totalPages,
          count: counts,
          currentPage: page,
        };
      }
  
      const count = await this.investigationModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
  
      return { investigations, totalPages, count, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  
  






  //update an investigation with its result
  async updateInvestigationWithResult(
    id: string,

    req: Request,
  ): Promise<InvestigationDocument> {
    try {
      const investigation = await this.investigationModel.findById(id);
      if (!investigation) {
        throw new NotFoundException('Investigation not found');
      }
      //create a new result document
      const investigationUpdate =
        await this.investigationModel.findByIdAndUpdate(
          id,
          {
            status: TestStatusEnum.COMPLETED,
          },
          { new: true },
        );
      return investigationUpdate;
    } catch (error) {
      throw error;
    }
  }

  //get stats for investigations...check all investigations and get the first six most carried out test entity and aggregate the rest as Others
  async getInvestigationStats(): Promise<any> {
    try {
      const investigations = await this.investigationModel.aggregate([
        {
          $match: {
            status: TestStatusEnum.COMPLETED,
          },
        },
        {
          $group: {
            _id: '$test',
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        //populate the test _id with the test name before returning
      ]);
      const total = investigations.reduce((acc, curr) => {
        return acc + curr.count;
      }, 0);
      const topSix = investigations.slice(0, 6);
      //populate the test _id with the test name before returning for the top six
      const topSixPopulated: any = await this.investigationModel.populate(
        topSix,
        [
          {
            path: '_id',
            model: 'TestEntity',
            select: 'testName',
          },
        ],
      );
      const others = investigations.slice(6);
      const othersCount = others.reduce((acc, curr) => {
        return acc + curr.count;
      }, 0);
      const othersPercentage = (othersCount / total) * 100;
      const topSixPercentage = topSixPopulated.map((item) => {
        return {
          ...item,
          percentage: (item.count / total) * 100,
        };
      });
      const othersObject = {
        _id: 'Others',
        count: othersCount,
        percentage: othersPercentage,
      };
      const finalArray = [...topSixPercentage, othersObject];
      return finalArray;
    } catch (error) {
      throw error;
    }
  }

  //get all pending investigations
  async getPendingInvestigationsForAccount(
    data?: FilterPatientDto,
  ): Promise<InvestigationDocument[]> {
    try {
      const { startDate, endDate, search, page, limit } = data;
      const query: FilterQuery<InvestigationDocument> = {
        status: { $in: [TestStatusEnum.PENDING, TestStatusEnum.PAID] },
      };
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      // if (search) {
      //   query['$patient'] = [
      //     { 'patient.firstName': { $regex: search, $options: 'i' } },
      //     { 'patient.lastName': { $regex: search, $options: 'i' } },
      //     { 'patient.ID': { $regex: search, $options: 'i' } },
      //   ];
      // }
      const investigations = await this.investigationModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate('patient')
        .populate('doctor')
        .populate('test');
      if (!investigations) {
        throw new NotFoundException('Investigations not found');
      }
      if (search) {
        const filteredInvestigations = investigations.filter(
          (investigation: any) => {
            return (
              investigation.patient?.firstName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.lastName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.ID?.toLowerCase().includes(
                search.toLowerCase(),
              )
            );
          },
        );
        return filteredInvestigations;
      }

      return investigations;
    } catch (error) {
      throw error;
    }
  }

  //mark investigation as paid
  async markInvestigationAsPaid(
    id: string,
    req: Request,
    paymentMethod: PaymentMethodEnum,
  ): Promise<InvestigationDocument> {
    try {
      const investigationUpdate =
        await this.investigationModel.findByIdAndUpdate(
          id,
          {
            status: TestStatusEnum.PAID,
            paidBy: req.user,
            paymentMethod,
            paidAt: new Date(),
          },
          { new: true },
        );
      if (!investigationUpdate) {
        throw new NotFoundException('Investigation not found');
      }
      return investigationUpdate;
    } catch (error) {
      throw error;
    }
  }

  //get investigations paid
  async getInvestigationsPaid(data?: FilterPatientDto): Promise<any> {
    try {
      const { startDate, endDate, search } = data;
      const query: FilterQuery<InvestigationDocument> = {
        status: TestStatusEnum.PAID,
      };
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      let [investigations, count] = await Promise.all([
        this.investigationModel
          .find(query)
          .sort({ createdAt: -1 })
          .populate('patient')
          .populate('doctor')
          .populate('test')

          .exec(),
        this.investigationModel.countDocuments(query),
      ]);
      if (!investigations) {
        throw new NotFoundException('Investigations not found');
      }
      if (search) {
        const filteredInvestigations = investigations.filter(
          (investigation: any) => {
            return (
              investigation.patient?.firstName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.lastName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              investigation.patient?.ID?.toLowerCase().includes(
                search.toLowerCase(),
              )
            );
          },
        );
        const filteredCount = filteredInvestigations.length;
        // const totalPages = Math.ceil(filteredCount / limit);
        // const currentPage = page;
        return { investigations: filteredInvestigations, count: filteredCount };
      }
      // const totalPages = Math.ceil(count / limit);
      // const currentPage = page;
      return { investigations, count };
    } catch (error) {
      throw error;
    }
  }

  //get all pending investigations and group them by test
  async getPendingInvestigationsGroupedByTest(): Promise<any> {
    try {
      //group the investigations by test, then return the investigations grouped by test and populate the test _id with the test name and then the patient
      const investigations = await this.investigationModel.aggregate([
        {
          $match: {
            status: TestStatusEnum.PENDING,
          },
        },
        {
          $group: {
            _id: '$test',
            count: { $sum: 1 },
            investigations: { $push: '$$ROOT' },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        //populate the test _id with the test name before returning
      ]);
      const investigationsPopulated: any =
        await this.investigationModel.populate(investigations, [
          {
            path: '_id',
            model: 'TestEntity',
            select: 'testName',
          },
          {
            path: 'investigations.patient',
            model: 'PatientEntity',
            select: 'firstName lastName ID age',
          },
        ]);
      return investigationsPopulated;
    } catch (error) {
      throw error;
    }
  }

  //update the investigation receiptUrl
  async updateInvestigationReceiptUrl(
    id: string,
    receiptUrl: string,
  ): Promise<InvestigationDocument> {
    try {
      const investigationUpdate =
        await this.investigationModel.findByIdAndUpdate(
          id,
          {
            receiptUrl,
          },
          { new: true },
        );
      if (!investigationUpdate) {
        throw new NotFoundException('Investigation not found');
      }
      return investigationUpdate;
    } catch (error) {
      throw error;
    }
  }

  async getInvestigationsByPatientLoggedIn(
    req: any,
    search?: string,
  ): Promise<any> {
    try {
      //get all the investigations for the patient
      //classify the investigations by status
      let query = {
        patient: req.user,
      };

      let investigations = await this.investigationModel
        .find(query)
        .sort({ updatedAt: -1 })
        .populate('doctor', 'firstName lastName ID age gender')
        .populate({
          path: 'test',
        });
      if (!investigations) {
        throw new NotFoundException('Investigations not found');
      }

      if (search) {
        const filteredInvestigations = investigations.filter(
          (investigation: any) => {
            return investigation.test?.testName
              ?.toLowerCase()
              .includes(search.toLowerCase());
          },
        );

        investigations = filteredInvestigations;
      }

      const classifiedInvestigations = {
        [TestStatusEnum.PENDING]: [],
        [TestStatusEnum.ONGOING]: [],
        [TestStatusEnum.COMPLETED]: [],
        [TestStatusEnum.PAID]: [],
        [TestStatusEnum.PROCESSING]: [],
        [TestStatusEnum.ONGOING]: []
        // [TestStatusEnum.PENDING_LATER]: []

      };

      investigations.forEach((investigation) => {
        classifiedInvestigations[investigation.status].push(investigation);
      });
      return {
        classifiedInvestigations,
        investigations,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateInvestigationResult(
    id: string,
    dynamicFields: { [key: string]: string | number | boolean },
  ): Promise<any> {
    try {
      const investigation: any = await this.investigationModel
        .findByIdAndUpdate(
          id,
          {
            result: dynamicFields,
          },
          { new: true },
        )
        .populate('test');
      if (!investigation) {
        throw new NotFoundException('Investigation not found');
      }
      const title = `New result for ${investigation.test.testName}`;
      await this.appNotificationService.createNotification({
        userId: investigation.patient,
        message: `You have a new result for ${investigation.test?.testName}`,
        title,
        otherId: id,
        to: 'PATIENT',
      });
      return await this.getInvestigationResult(id);
    } catch (error) {
      throw error;
    }
  }

  //get investigation result for an investigation and generate a pdf for it
  async getInvestigationResult(id: string): Promise<any> {
    try {
      const investigation: any = await this.investigationModel
        .findById(id)
        .populate('test')
        .populate('doctor');

      const result = investigation.result;

      //create a pdf for the result to contain the name of the test, the name of the doctor, the result and the date
      const html = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Roboto', sans-serif;">
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Roboto', sans-serif;">
        <h1 style="font-size: 2rem; font-weight: 500; color: #000; margin-bottom: 1rem;">Test: ${
          investigation?.test?.testName
        }</h1>
        <h2 style="font-size: 1.5rem; font-weight: 500; color: #000; margin-bottom: 1rem;">Doctor: ${
          investigation.doctor?.firstName
        } ${investigation.doctor?.lastName}</h2>
      
        ${Object.keys(result)
          .map((key) => {
            return `<h3 style="font-size: 1.2rem; font-weight: 500; color: #000; margin-bottom: 1rem;">${key}: ${result[key]}</h3>`;
          })
          .join('')}
        <h3 style="font-size: 1.2rem; font-weight: 500; color: #000; margin-bottom: 1rem;">Date: ${new Date().toLocaleDateString()}</h3>
        </div>
        </div>
        `;

      const pdf = await generatePdf(html);
      const uploadPdf = await this.cloudinaryService.uploadPdf(pdf);
      investigation.resultUrl = uploadPdf.secure_url;
      return await investigation.save();
    } catch (error) {
      throw error;
    }
  }

  //get all prescriptions paid
  // async getInvestigationsPaidAll(): Promise<any> {
  //   try {
      
  //     //also for investigations where isIndividual is true, we want to check if the date when passed into compareDateWithCurrentDate is equal to the current date and if it is, we want to return the investigations too
  //     const investigations = await this.investigationModel.find({
  //       status: TestStatusEnum.PAID,
  //       isIndividual: false,
       
  //     });
  //     const investigations2 = await this.investigationModel.find({
  //       status: TestStatusEnum.PAID,
  //       isIndividual: true,
  //     });
  //     if (!investigations) {
  //       throw new NotFoundException('Investigations not found');
  //     }
  //     //in the list of these investigations, we want to filter out the ones that are not individual and then we want to check if the date when passed into compareDateWithCurrentDate is equal to the current date and if it is, we want to return the investigations too
  //     // const individualInvestigations = investigations.filter(
  //     //   (investigation) => {
  //     //     return investigation.isIndividual;
  //     //   },
  //     // );
  //     const individualInvestigationsOfToday =
  //     investigations2.filter((investigation) => {
  //         return (
  //           compareDateWithCurrentDate(investigation.date) &&
  //           investigation.status === TestStatusEnum.PAID
  //         );
  //       });
  //     const allInvestigations = [
  //       ...investigations,
  //       ...individualInvestigationsOfToday,
  //     ];
  //     return allInvestigations;


  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getInvestigationsPaidAll(): Promise<any> {
    try {
      const [investigations, individualInvestigationsOfToday] = await Promise.all([
        this.investigationModel.find({
          status: TestStatusEnum.PAID,
          isIndividual: false,
        }),
        this.investigationModel.find({
          status: TestStatusEnum.PAID,
          isIndividual: true,
        }).then(individuals => individuals.filter(
          investigation => compareDateWithCurrentDate(investigation.date)
        ))
      ]);
  
      const allInvestigations = [...investigations, ...individualInvestigationsOfToday];
  
      if (!allInvestigations.length) {
        throw new NotFoundException('Investigations not found');
      }
  
      return allInvestigations;
    } catch (error) {
      throw error;
    }
  }
  

  //we want to allow individuals book investigations, in which case, isIndividual will be true and then booking can not exceed the maxDailyLimit of the test on a daily basis
  async createInvestigationForIndividual(
    investigation: IndividualInvestigationDto,
    req: Request,
  ): Promise<any> {
    try {
      const patientDetails = await this.patientService.getPatientById(
        investigation.patient,
      );

      const newInvestigations = [];
      const errorResponse = {};
      for (const investigationData of investigation.investigations) {
        const isAvailable = await this.checkInvestigationAvailability(
          investigationData,
        );

        if (!isAvailable) {
          const test = await this.testService.getSingleTest(
            investigationData.test,
          );
          errorResponse[
            test.testName
          ] = `You cannot book ${test.testName} for ${investigationData.date} because the limit for that day has been reached`;
          continue;
        }
        let status: string;
        // if (compareDateWithCurrentDate(investigationData.date)) {
        //   status = TestStatusEnum.PENDING;
        // } else {
        //   status = TestStatusEnum.PENDING_LATER;
        // }
        const newInvestigation: any = new this.investigationModel({
          ...investigationData,
          uniqueCode: uuid().slice(0, 7),
          status: TestStatusEnum.PAID,  
          patient: req.user,
          isIndividual: true,
        });

        const test = await newInvestigation.populate('test');
        const rate = test.test.rate;

        newInvestigation.totalCost = rate;

        const savedInvestigation = await newInvestigation.save();

        newInvestigations.push(savedInvestigation);
      }

      const title = 'New Investigation';
      await this.appNotificationService.createNotification({
        userId: req.user.toString(),
        message: `New investigation created for ${patientDetails?.firstName} ${patientDetails?.lastName}`,
        title,
        to: 'Laboratory',
      });
      await this.appNotificationService.createNotification({
        userId: patientDetails.id,
        message: `New investigation created for ${patientDetails?.firstName} ${patientDetails?.lastName} by ${patientDetails?.firstName} ${patientDetails?.lastName}`,
        title,
        key: 'Accounts',
        to: 'ACCOUNTS',
      });
      await this.appNotificationService.createNotification({
        userId: patientDetails.id,
        message: `New investigation created for you by ${patientDetails?.firstName} ${patientDetails?.lastName}`,
        title,
        key: 'Laboratory',
        to: 'PATIENT',
      });

      return { newInvestigations, errorResponse };
    } catch (error) {
      throw error;
    }
  }

  private async checkInvestigationAvailability(
    investigationData: any,
  ): Promise<boolean> {
    const { date, test } = investigationData;
    const checkDateAvailability =
      await this.investigationBookingService.checkDateAvailability(date, test);
    return checkDateAvailability;
  }

  async checkInvestigationsWithStatusPendingLater(): Promise<
    InvestigationDocument[]
  > {
    try {
      const investigations = await this.investigationModel.find({
        status: TestStatusEnum.PENDING_LATER,
      });
      const investigationsWithStatusPendingLater = investigations.filter(
        (investigation) => {
          // return (
          //   new Date(investigation.date).toISOString() ===
          //   new Date().toISOString().replace(/T.*/, 'T00:00:00.000Z')
          // );
          return compareDateWithCurrentDate(investigation.date);
        },
      );
      investigationsWithStatusPendingLater.forEach(async (investigation) => {
        investigation.status = TestStatusEnum.PENDING;
        await investigation.save();
      });
      return investigationsWithStatusPendingLater;
    } catch (error) {
      throw error;
    }
  }

  async getInvestigationsByPatientId(
    patientId: string,
  ): Promise<InvestigationDocument[]> {
    try {
      const investigations = await this.investigationModel.find({
        patient: patientId,
        status: { $in: [TestStatusEnum.PENDING, TestStatusEnum.PAID] },
      });
      return investigations;
    } catch (error) {
      throw error;
    }
  }
}
