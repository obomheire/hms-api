import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import {
  ChangePasswordDto,
  CreatePatientDto,
  CreatePatientLoginDto,
  ForgotPasswordDto,
  PatientLoginDto,
  PatientResetPasswordDto,
  PatientReturn,
  UpdatePatientDto,
} from '../dto/patients.dto';
import { PatientEntity, PatientDocument } from '../schema/patients.schema';
import {
  generateIncrementalValue,
  generateIncrementalValues,
} from '../../utils/functions/generateIncrementalValue';
import { AdmissionStatusEnum } from '../enum/admissionStatus.enum';
import { TransferPatientDto } from '../dto/transferPatient.dto';
import { ReferPatientDto } from '../dto/referPatient.dto';
import { TestStatusEnum } from 'src/utils/enums/patients/testStatus.enum';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import { ScheduleDischargeDto } from '../dto/scheduleDischarge.dto';
import { Request } from 'express';
import { PrescriptionDto } from 'src/utils/dtos/patients/prescription.dto';
import {
  InvestigationDocument,
  InvestigationEntity,
} from 'src/patients/schema/investigation.schema';
import {
  PharmacyPrescriptionEntity,
  PharmacyPrescriptionDocument,
} from 'src/patients/schema/pharmacyPrescription.schema';
import { PharmacyPrescriptionDto } from 'src/patients/dto/pharmacyPrescription.dto';
import { PrescriptionStatusEnum } from 'src/utils/enums/patients/prescriptionStatus.enum';
import * as bcrypt from 'bcrypt';
import { MailsService } from 'src/providers/mails/mails.service';
import { sendWelcomeStaffEmail } from 'src/providers/mails/welcome.template';
import { TokenService } from 'src/auth/services/token.service';
import { VisitService } from './visit.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(PatientEntity.name)
    private readonly patientModel: Model<PatientDocument>,
    private readonly mailService: MailsService,
    private readonly tokenService: TokenService,
    // private readonly visitService: VisitService,
    // @Inject(forwardRef(() => VisitService))
    // private visitService: VisitService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createPatient(
    createPatientDto: CreatePatientDto,
  ): Promise<PatientDocument> {
    try {
      console.log('gets here');
      const patient = new this.patientModel(createPatientDto);
      const patientId = await generateIncrementalValue(this.patientModel);
      patient.ID = `PAT-${patientId}`;
      const newPatient = await patient.save();
      return newPatient;
    } catch (error) {
      throw error;
    }
  }

  //update patient
  async updatePatient(
    id: string | Types.ObjectId,
    updatePatientDto: UpdatePatientDto,
  ): Promise<PatientDocument> {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          $set: updatePatientDto,
        },
        {
          new: true,
        },
      );
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error.message;
    }
  }

  //delete patient
  async deletePatient(id: string): Promise<string> {
    try {
      const patient = await this.patientModel.findByIdAndDelete(id);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return 'Patient deleted successfully';
    } catch (error) {
      throw error.message;
    }
  }

  //get a single patient
  async getPatient(id: string): Promise<PatientDocument> {
    try {
      const patient = await this.patientModel.findById(id);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error.message;
    }
  }

  async getPatients(filterPatientDto?: FilterPatientDto): Promise<any> {
    try {
      const { startDate, endDate, status, search, page, limit } =
        filterPatientDto;
      const query = {};
      if (startDate) {
        let start = new Date(startDate)
          .toISOString()
          .replace(/T.*/, 'T00:00:00.000Z');
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        query['createdAt'] = {
          $gte: start,
          $lte: end,
        };
      }
      if (status) {
        query['admissionStatus'] = status;
      }
      if (search) {
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
        ];
      }
      const patients = await this.patientModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const count = await this.patientModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      return { patients, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  // //create patient visit
  // async createPatientVisit(
  //   patientId: Types.ObjectId,
  //   createVisitDto: VisitDto,
  //   req: Request,
  // ): Promise<VisitDocument> {
  //   try {
  //     const patient = await this.patientModel.findById(patientId);
  //     if (!patient) {
  //       throw new NotFoundException('Patient not found');
  //     }
  //     const visit = new this.visitModel({
  //       ...createVisitDto,
  //       doctor: req.user,
  //     });
  //     const val = this.uniqueID();
  //     const visitID = `VIS-${val}`;
  //     visit.visitID = visitID;
  //     visit.patientId = patientId;
  //     const newVisit = await visit.save();
  //     return newVisit;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //update visit
  // async updatePatientVisit(
  //   patientId: Types.ObjectId,
  //   visitId: Types.ObjectId,
  //   updateVisitDto: UpdateVisitDto,
  // ): Promise<VisitDocument> {
  //   try {
  //     const patient = await this.patientModel.findById(patientId);
  //     if (!patient) {
  //       throw new NotFoundException('Patient not found');
  //     }
  //     const visit = await this.visitModel.findByIdAndUpdate(
  //       {
  //         _id: visitId,
  //       },
  //       {
  //         $set: updateVisitDto,
  //       },
  //       {
  //         new: true,
  //       },
  //     );
  //     if (!visit) {
  //       throw new NotFoundException('Visit not found');
  //     }
  //     return visit;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //delete visit
  // async deletePatientVisit(
  //   patientId: Types.ObjectId,
  //   visitId: Types.ObjectId,
  // ): Promise<string> {
  //   try {
  //     const patient = await this.patientModel.findById(patientId);
  //     if (!patient) {
  //       throw new NotFoundException('Patient not found');
  //     }
  //     const visit = await this.visitModel.findByIdAndDelete(visitId);
  //     if (!visit) {
  //       throw new NotFoundException('Visit not found');
  //     }
  //     return 'Visit deleted successfully';
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //get a single visit
  // async getPatientVisit(
  //   patientId: Types.ObjectId,
  //   visitId: Types.ObjectId,
  // ): Promise<VisitDocument> {
  //   try {
  //     const patient = await this.patientModel.findById(patientId);
  //     if (!patient) {
  //       throw new NotFoundException('Patient not found');
  //     }
  //     const visit = await this.visitModel
  //       .findById(visitId)
  //       .populate('investigation')
  //       .populate('prescription');
  //     if (!visit) {
  //       throw new NotFoundException('Visit not found');
  //     }
  //     return visit;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  //get all visits for a patient and filter by date range
  // async getPatientVisits(
  //   patientId: Types.ObjectId,
  //   filterVisitDto: FilterPatientDto,
  // ): Promise<any> {
  //   try {
  //     const { startDate, endDate, page, limit } = filterVisitDto;
  //     const query: FilterQuery<VisitDocument> = {};
  //     if (startDate && endDate) {
  //       let start = new Date(startDate).toISOString().replace(/T.*/, 'T00:00:00.000Z');
  //       let end = new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
  //       query.createdAt = { $gte: start, $lte: end };
  //     }
  //     const visits = await this.visitModel
  //       .find({ patientId, ...query })
  //       .skip((page - 1) * limit)
  //       .limit(limit);
  //     const count = visits.length;
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { visits, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //GET ALL VISITS FOR ALL PATIENTS
  // async getAllVisits(filterVisitDto: FilterPatientDto): Promise<any> {
  //   try {
  //     const { startDate, endDate, page, limit } = filterVisitDto;
  //     const query: FilterQuery<VisitDocument> = {};
  //     if (startDate && endDate) {
  //       query.createdAt = { $gte: startDate, $lte: endDate };
  //     }
  //     const visits = await this.visitModel
  //       .find({ ...query })
  //       .skip((page - 1) * limit)
  //       .limit(limit);
  //     const count = await this.visitModel.countDocuments({
  //       ...query,
  //     });
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { visits, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //create patient investigation
  // async createPatientInvestigation(
  //   createInvestigationDto: InvestigationDto,
  //   req: Request,
  // ) {
  //   try {
  //     const { patient } = createInvestigationDto;
  //     const patientExists = await this.patientModel.findById(patient);
  //     if (!patientExists) {
  //       throw new NotFoundException('Patient not found');
  //     }

  //     const investigation = new this.investigationModel({
  //       ...createInvestigationDto,
  //       doctor: req.user,
  //     });
  //     const val = this.uniqueID();
  //     const investigationID = `INV-${val}`;
  //     investigation.investigationID = investigationID;
  //     investigation.patient = patient;
  //     const newInvestigation = await investigation.save();
  //     return newInvestigation;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //mark a single investigation as ongoing
  // async markInvestigationAsOngoing(
  //   investigationId: Types.ObjectId,
  // ): Promise<InvestigationDocument> {
  //   try {
  //     const investigation = await this.investigationModel.findByIdAndUpdate(
  //       {
  //         _id: investigationId,
  //       },
  //       {
  //         $set: {
  //           status: 'ONGOING',
  //         },
  //       },
  //       {
  //         new: true,
  //       },
  //     );
  //     if (!investigation) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     return investigation;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  //mark a single investigation as completed

  // //GET ALL PENDING INVESTIGATIONS AND BE ABLE TO SEARCH BY PATIENT FIRSTNAME, LASTNAME AND PATIEN
  // async getPendingInvestigations(
  //   filterInvestigationDto: FilterPatientDto,
  // ): Promise<any> {
  //   try {
  //     //search by patient first name, last name and patientId
  //     const { startDate, endDate, page, limit, search } =
  //       filterInvestigationDto;
  //     const query: FilterQuery<InvestigationDocument> = {};
  //     if (startDate && endDate) {
  //       query.createdAt = { $gte: startDate, $lte: endDate };
  //     }
  //     if (search) {
  //       query.$or = [
  //         { 'patient.patientId': { $regex: search, $options: 'i' } },
  //         { 'patient.firstName': { $regex: search, $options: 'i' } },
  //         { 'patient.lastName': { $regex: search, $options: 'i' } },
  //       ];
  //     }
  //     const investigations = await this.investigationModel
  //       .find({
  //         status: 'PENDING',
  //         ...query,
  //       })
  //       .populate('test')
  //       .populate('patient')
  //       .skip((page - 1) * limit)
  //       .limit(limit);
  //     const count = await this.investigationModel.countDocuments({
  //       status: 'PENDING',
  //       ...query,
  //     });
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { investigations, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //GET ALL COMPLETED INVESTIGATIONS, FILTER THROUGH DATE RANGE AND SEARCH WITH FIRSTNAME, LASTNAME, AND EMAIL OF THE PATIENTS INVESTIGATIONS BELONG
  // async getCompletedInvestigations(
  //   filterInvestigationDto: FilterPatientDto,
  // ): Promise<any> {
  //   //WE WANT TO BE ABLE TO SEARCH WITH FIRST NAME, LAST NAME AND PATIENTID OF OWNERS OF COMPLETED INVESTIGATIONS
  //   try {
  //     const { startDate, endDate, page, limit, search } =
  //       filterInvestigationDto;
  //     const query: FilterQuery<InvestigationDocument> = {};
  //     if (startDate && endDate) {
  //       query.createdAt = { $gte: startDate, $lte: endDate };
  //     }
  //     if (search) {
  //       query.$or = [
  //         { 'patient.patientId': { $regex: search, $options: 'i' } },
  //         { 'patient.firstName': { $regex: search, $options: 'i' } },
  //         { 'patient.lastName': { $regex: search, $options: 'i' } },
  //       ];
  //     }
  //     const investigations = await this.investigationModel
  //       .find({
  //         status: 'COMPLETED',
  //         ...query,
  //       })
  //       .populate('test')
  //       .populate('patient')
  //       .skip((page - 1) * limit)
  //       .limit(limit);
  //     const count = await this.investigationModel.countDocuments({
  //       status: 'COMPLETED',
  //       ...query,
  //     });
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { investigations, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //GET ALL PENDING AND ONGOING INVESTIGATIONS AND ORDER BY THE MOST RECENT ON TOP
  // async getPendingAndOngoingInvestigations(
  //   filterInvestigationDto: FilterPatientDto,
  // ): Promise<any> {
  //   try {
  //     const { startDate, endDate, page, limit, search } =
  //       filterInvestigationDto;
  //     const query: FilterQuery<InvestigationDocument> = {};
  //     if (startDate && endDate) {
  //       query.createdAt = { $gte: startDate, $lte: endDate };
  //     }
  //     if (search) {
  //       query.$or = [
  //         { 'patient.ID': { $regex: search, $options: 'i' } },
  //         { 'patient.firstName': { $regex: search, $options: 'i' } },
  //         { 'patient.lastName': { $regex: search, $options: 'i' } },
  //       ];
  //     }
  //     const investigations = await this.investigationModel
  //       .find({
  //         status: { $in: ['PENDING', 'ONGOING'] },
  //         ...query,
  //       })
  //       .populate('test')
  //       .populate('patient')
  //       .skip((page - 1) * limit)
  //       .limit(limit);
  //     const count = await this.investigationModel.countDocuments({
  //       status: { $in: ['PENDING', 'ONGOING'] },
  //       ...query,
  //     });
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { investigations, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //CREATE RESULT FOR AN INVESTIGATION
  // async createResult(
  //   createResultDto: any,
  //   investigationId: Types.ObjectId,
  // ): Promise<any> {
  //   try {
  //     const investigation = await this.investigationModel.findById({
  //       _id: investigationId,
  //     });
  //     if (!investigation) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     //check if the investigation has already been started
  //     if (investigation.status !== 'ONGOING') {
  //       throw new BadRequestException('Investigation not yet started');
  //     }

  //     const investigationResult =
  //       await this.investigationModel.findByIdAndUpdate(
  //         {
  //           _id: investigationId,
  //         },
  //         {
  //           $set: {
  //             result: createResultDto,
  //             status: 'COMPLETED',
  //           },
  //         },
  //         { new: true },
  //       );
  //     if (!investigationResult) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     return investigationResult;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //EDIT RESULT
  // async editResult(
  //   editResultDto: any,
  //   investigationId: Types.ObjectId,
  // ): Promise<any> {
  //   try {
  //     const investigation = await this.investigationModel.findById({
  //       _id: investigationId,
  //     });
  //     if (!investigation) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     //check if the investigation has already been started
  //     if (investigation.status !== 'ONGOING') {
  //       throw new BadRequestException('Investigation not yet started');
  //     }

  //     const investigationResult =
  //       await this.investigationModel.findByIdAndUpdate(
  //         {
  //           _id: investigationId,
  //         },
  //         {
  //           $set: {
  //             result: editResultDto,
  //           },
  //         },
  //       );
  //     if (!investigationResult) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     return investigationResult;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // //GET RESULT FOR AN INVESTIGATION
  // async getInvestigation(investigationId: Types.ObjectId): Promise<any> {
  //   try {
  //     const investigationResult = await this.investigationModel.findById({
  //       _id: investigationId,
  //     });
  //     if (!investigationResult) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     return investigationResult;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async filterPatientsByStatus(status: string): Promise<PatientDocument[]> {
    try {
      const patients = await this.patientModel.find({
        admissionStatus: status,
      });
      if (!patients) {
        throw new NotFoundException('No Patient found for this category');
      }
      return patients;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // //DELETE INVESTIGATION
  // async deleteInvestigation(investigationId: Types.ObjectId): Promise<string> {
  //   try {
  //     const deletedInvestigation =
  //       await this.investigationModel.findByIdAndDelete({
  //         _id: investigationId,
  //       });
  //     if (!deletedInvestigation) {
  //       throw new NotFoundException('Investigation not found');
  //     }
  //     return 'Investigation deleted successfully';
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async filterPatientsByDate(
    data: FilterPatientDto,
  ): Promise<PatientDocument[]> {
    try {
      const { startDate } = data;
      const endDate = new Date(startDate)
        .toISOString()
        .replace(/T.*/, 'T23:59:59.999Z');

      const patients = await this.patientModel.find({
        createdAt: {
          $gte: new Date(startDate).toISOString(),
          $lte: endDate,
        },
      });
      if (patients.length === 0) {
        throw new NotFoundException('No Patient found for this date');
      }
      return patients;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async filterPatientsBetweenTwoDates(
    data: FilterPatientDto,
  ): Promise<PatientDocument[]> {
    try {
      const { startDate, endDate } = data;
      let end;
      if (!endDate) {
        end = new Date(startDate)
          .toISOString()
          .replace(/T.*/, 'T23:59:59.999Z');
      }

      const patients = await this.patientModel.find({
        createdAt: {
          $gte: new Date(startDate).toISOString(),
          $lte: endDate ? new Date(endDate).toISOString() : end,
        },
      });
      if (patients.length === 0) {
        throw new NotFoundException('No Patient found for range of dates');
      }

      return patients;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getEmergencyList = async (
    data?: FilterPatientDto,
  ): Promise<PatientReturn | string> => {
    try {
      const { startDate, endDate, search, page, limit } = data;
      let end: string;

      const query = {
        admissionStatus: AdmissionStatusEnum.EMERGENCY,
      };
      if (startDate) {
        if (!endDate) {
          end = new Date(startDate)
            .toISOString()
            .replace(/T.*/, 'T23:59:59.999Z');
        }
        query['createdAt'] = {
          $gte: new Date(startDate).toISOString(),
          $lte: endDate ? new Date(endDate).toISOString() : end,
        };
      }
      if (search) {
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const patients = await this.patientModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
      const count = patients.length;
      const totalPages = Math.ceil(count / limit);
      return { patients, totalPages, count, currentPage: page };
    } catch (error) {
      throw error;
    }
  };

  addEmergencyPatient = async (id: string): Promise<PatientDocument> => {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(
        { _id: id },
        { admissionStatus: AdmissionStatusEnum.EMERGENCY },
        { new: true },
      );
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  createEmergencyPatient = async (
    createPatientDto: CreatePatientDto,
  ): Promise<PatientDocument> => {
    try {
      const patientId = await generateIncrementalValue(this.patientModel);
      const patId = `PAT-${patientId}`;
      const patient = await this.patientModel.create({
        ...createPatientDto,
        ID: patId,
        admissionStatus: AdmissionStatusEnum.EMERGENCY,
      });
      return patient;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getPatientDischargeList = async (
    search?: string,
    page = 1,
    limit = 15,
  ): Promise<any> => {
    try {
      //WE FIND WHEN ADMISSION STATUS IS DISCHARGED AND PENDING

      const query = {
        //admission status is discharged or pending
        admissionStatus : { $in: [AdmissionStatusEnum.DISCHARGED, AdmissionStatusEnum.PENDING]}

      };
      if (search) {
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const patients = await this.patientModel
        .find(query)
        .sort({ dischargeDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (patients.length === 0) {
        throw new NotFoundException('No Patient found for this category');
      }
      const count = await this.patientModel.countDocuments(query);
      const currentPage = page;
      const totalPages = Math.ceil(count / limit);
      return { patients, count, currentPage, totalPages };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //get patients with admission status pending
  getPendingDischargeList = async (
    query: FilterQuery<PatientEntity>,
  ): Promise<any> => {
    try {
      const patients = await this.patientModel.find({
        admissionStatus: AdmissionStatusEnum.PENDING,
        ...query,
      });

      if (patients.length === 0) {
        throw new NotFoundException('No Patient found for this category');
      }
      return patients;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get total number of patients
  getPatientCount = async (): Promise<any> => {
    try {
      const count = await this.patientModel.countDocuments();
      return count;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get mortarlity count which is gotten by patients whose admissionStatus is DEAD
  getMortality = async (data?: FilterPatientDto): Promise<any> => {
    try {
      const { startDate, endDate, search, page, limit } = data;
     
      const query = {
        admissionStatus: AdmissionStatusEnum.DEAD,
      };
     
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
      if (search) {
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
        ];
      }
      const [patients, count] = await Promise.all([
        this.patientModel
          .find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.patientModel.countDocuments(query),
      ]);
      const totalPages = Math.ceil(count / limit);
      // if (patients.length === 0) {
      //   throw new NotFoundException('No Patient found for this category');
      // }
      //mortality rate
      const mortalityRate = (count / (await this.getPatientCount())) * 100;
      return { patients, count, totalPages, currentPage: page, mortalityRate };
    } catch (error) {
      throw error;
    }
  };

  // // we want to see details of mortality, the profiles of dead patients

  // getMortalityDetails = async (): Promise<any> => {
  //   try {
  //     const patients = await this.patientModel.find({
  //       admissionStatus: AdmissionStatusEnum.DEAD,
  //     });
  //     if (!patients) {
  //       throw new NotFoundException('No Patient found for this category');
  //     }
  //     return patients;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  //we want to get total admitted patients and total outpatients
  getAdmittedAndOutPatientCount = async (): Promise<any> => {
    try {
      //we want to get count of admitted patients only
      const admittedCount = await this.patientModel.countDocuments({
        admissionStatus: AdmissionStatusEnum.ADMITTED,
      });

      //we want to get count of outpatients only
      const outPatientCount = await this.patientModel.countDocuments({
        admissionStatus: AdmissionStatusEnum.DISCHARGED,
      });

      return { admittedCount, outPatientCount };
    } catch (error) {
      throw error;
    }
  };

  //we want to get total number of patients registered in the for a day or last 24 hours

  getPatientCountForADay = async (): Promise<any> => {
    try {
      const count = await this.patientModel.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });
      const patients = await this.patientModel.find({
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      }).sort({ createdAt: -1 });
     
      return { count, patients };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  // //CREATE PRESCRIPTION
  // createPrescription = async (
  //   createPrescriptionDto: PharmacyPrescriptionDto,
  //   req: Request,
  // ): Promise<PharmacyPrescriptionDocument> => {
  //   try {
  //     const val = this.uniqueID();
  //     const prescription = await this.prescriptionModel.create({
  //       ...createPrescriptionDto,
  //       uniqueCode: val,
  //       doctor: req.user,
  //     });
  //     return prescription;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //GET PRESCRIPTION
  // getPrescription = async (
  //   id: string,
  // ): Promise<PharmacyPrescriptionDocument> => {
  //   try {
  //     const prescription = await this.prescriptionModel
  //       .findById(id)
  //       .populate('doctor')
  //       .populate('patient')
  //       .exec();
  //     if (!prescription) {
  //       throw new NotFoundException('Prescription not found');
  //     }
  //     return prescription;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //GET ALL PRESCRIPTIONS
  // getAllPrescriptions = async (
  //   query: FilterQuery<PharmacyPrescriptionEntity>,
  //   page = 1,
  //   limit = 15,
  // ): Promise<any> => {
  //   try {
  //     const prescriptions = await this.prescriptionModel
  //       .find(query)
  //       .skip((page - 1) * limit)
  //       .limit(limit)
  //       .populate('doctor')
  //       .populate('patient')
  //       .exec();
  //     if (prescriptions.length === 0) {
  //       throw new NotFoundException('No Prescription found for this category');
  //     }
  //     const count = await this.prescriptionModel.countDocuments(query);
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { prescriptions, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //GET PRESCRIPTIONS FOR A PATIENT
  // getPrescriptionsForPatient = async (id: Types.ObjectId): Promise<any> => {
  //   try {
  //     const prescriptions = await this.prescriptionModel
  //       .find({
  //         patient: id,
  //       })
  //       .populate('doctor')
  //       .populate('patient')
  //       .exec();
  //     if (prescriptions.length === 0) {
  //       throw new NotFoundException('No Prescription found for this category');
  //     }
  //     return prescriptions;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //GET ALL PENDING REQUESTS, FILTER BY DATES AND SEARCH THROUGH WITH PATIENT'S FIRST NAME, LAST NAME AND ID
  // getPendingRequests = async (
  //   filterPharmacyRequest: FilterPatientDto,
  // ): Promise<any> => {
  //   try {
  //     const { page, limit, search, startDate, endDate } = filterPharmacyRequest;
  //     const query = {
  //       $and: [
  //         { status: PrescriptionStatusEnum.PENDING },
  //         { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
  //         {
  //           $or: [
  //             { 'patient.firstName': { $regex: search, $options: 'i' } },
  //             { 'patient.lastName': { $regex: search, $options: 'i' } },
  //             { 'patient.ID': { $regex: search, $options: 'i' } },
  //           ],
  //         },
  //       ],
  //     };
  //     const requests = await this.prescriptionModel
  //       .find(query)
  //       .skip((page - 1) * limit)
  //       .limit(limit)
  //       .populate('patient')
  //       .populate('doctor')
  //       .exec();
  //     if (requests.length === 0) {
  //       throw new NotFoundException('No Request found for this category');
  //     }
  //     const count = await this.prescriptionModel.countDocuments(query);
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { requests, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //GET COMPLETED PRESCRIPTION, FILTER BY DATES AND SEARCH THROUGH BY PATIENT'S FIRST NAME, LAST NAME AND ID
  // getCompletedRequests = async (
  //   filterPharmacyRequest: FilterPatientDto,
  // ): Promise<any> => {
  //   try {
  //     const { page, limit, search, startDate, endDate } = filterPharmacyRequest;
  //     const query = {
  //       $and: [
  //         { status: PrescriptionStatusEnum.DISPENSED },
  //         { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
  //         {
  //           $or: [
  //             { 'patient.firstName': { $regex: search, $options: 'i' } },
  //             { 'patient.lastName': { $regex: search, $options: 'i' } },
  //             { 'patient.ID': { $regex: search, $options: 'i' } },
  //           ],
  //         },
  //       ],
  //     };
  //     const requests = await this.prescriptionModel
  //       .find(query)
  //       .skip((page - 1) * limit)
  //       .limit(limit)
  //       .populate('patient')
  //       .populate('doctor')
  //       .exec();
  //     if (requests.length === 0) {
  //       throw new NotFoundException('No Request found for this category');
  //     }
  //     const count = await this.prescriptionModel.countDocuments(query);
  //     const currentPage = page;
  //     const totalPages = Math.ceil(count / limit);
  //     return { requests, count, currentPage, totalPages };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //UPDATE PRESCRIPTION
  // updatePrescription = async (
  //   id: string,
  //   updatePrescriptionDto: PharmacyPrescriptionDto,
  // ): Promise<PharmacyPrescriptionDocument> => {
  //   try {
  //     const prescription = await this.prescriptionModel.findByIdAndUpdate(
  //       id,
  //       updatePrescriptionDto,
  //     );
  //     if (!prescription) {
  //       throw new NotFoundException('Prescription not found');
  //     }
  //     return prescription;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  //DELETE PRESCRIPTION
  // deletePrescription = async (id: string): Promise<string> => {
  //   try {
  //     const prescription = await this.prescriptionModel.findByIdAndDelete(id);
  //     if (!prescription) {
  //       throw new NotFoundException('Prescription not found');
  //     }
  //     return 'Prescription deleted successfully';
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  // //GET ALL PRESCRIPTIONS FOR A DOCTOR
  // getPrescriptionsForDoctor = async (id: Types.ObjectId): Promise<any> => {
  //   try {
  //     const prescriptions = await this.prescriptionModel
  //       .find({
  //         doctor: id,
  //       })
  //       .populate('doctor')
  //       .populate('patient')
  //       .exec();
  //     if (prescriptions.length === 0) {
  //       throw new NotFoundException('No Prescription found for this category');
  //     }
  //     return prescriptions;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  uniqueID = () => {
    const val = Math.floor(Math.random() * Date.now());
    return val.toString().substr(0, 7);
  };

  async dischargePatient(id: string): Promise<PatientDocument> {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(
        { _id: id },
        { admissionStatus: AdmissionStatusEnum.DISCHARGED },
        { new: true },
      );
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async referPatient(
    id: string,
    referPatientDto: ReferPatientDto,
  ): Promise<PatientDocument> {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(
        { _id: id },
        referPatientDto,
      );
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }

  scheduleDischarge = async (
    id: string,
    scheduleDischargeDto: ScheduleDischargeDto,
  ): Promise<PatientDocument> => {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(
        { _id: id },
        scheduleDischargeDto,
        { new: true },
      );
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      patient.admissionStatus = AdmissionStatusEnum.PENDING;
      await patient.save();
      return patient;
    } catch (error) {
      throw error;
    }
  };

  // //check through all investigation records and arrange the most carried out first 6 'test' column for completed investigations arranged in descending orders
  // getInvestigationRecords = async (): Promise<any> => {
  //   try {
  //     const records = await this.investigationModel.aggregate([
  //       {
  //         $match: {
  //           status: TestStatusEnum.COMPLETED,
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: '$test',
  //           count: { $sum: 1 },
  //         },
  //       },
  //       {
  //         $sort: { count: -1 },
  //       },
  //       {
  //         $limit: 6,
  //       },
  //     ]);
  //     return records;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // };

  //get all patients that have been discharged
  getDischargedPatients = async (
    data?: FilterPatientDto,
  ): Promise<PatientReturn> => {
    try {
      const { page, limit, search, startDate, endDate } = data;
      const query = {
        admissionStatus: AdmissionStatusEnum.DISCHARGED,
        $and: [
          {
            $or: [
              { 'patient.firstName': { $regex: search, $options: 'i' } },
              { 'patient.lastName': { $regex: search, $options: 'i' } },
              { 'patient.email': { $regex: search, $options: 'i' } },
              { 'patient.ID': { $regex: search, $options: 'i' } },
            ],
          },
          {
            $or: [
              { createdAt: { $gte: new Date(startDate) } },
              { createdAt: { $lte: new Date(endDate) } },
            ],
          },
        ],
      };
      const count = await this.patientModel.countDocuments(query);
      const patients = await this.patientModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const totalPages = Math.ceil(count / limit);
      return { patients, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  };

  updatePatientFormat = async (id: string): Promise<void> => {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(id, {
        admissionStatus: AdmissionStatusEnum.ADMISSION_PENDING,
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    } catch (error) {
      throw error;
    }
  };

  //get all admitted patients and be abble to search
  getAdmittedPatients = async (
    data?: FilterPatientDto,
  ): Promise<PatientReturn> => {
    try {
      const { page, limit, search, startDate, endDate } = data;
      const query = {
        admissionStatus: AdmissionStatusEnum.ADMITTED,
      };
      if (search) {
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
        ];
      }
      //be able to filter ranges of date compared to the last pushed admission date
      if (startDate) {
        let start = new Date(startDate);
        let end: Date;

        if (endDate) {
          end = new Date(endDate);
        } else {
          //if no end date is provided, set it to the the next day of the start date
          end = new Date(start);
          end.setDate(end.getDate() + 1);
        }
        query['$and'] = [
          { admissionDate: { $gte: start } },
          { admissionDate: { $lte: end } },
        ];
      }

      const count = await this.patientModel.countDocuments(query);
      const patients = await this.patientModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const totalPages = Math.ceil(count / limit);
      return { patients, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  };

  //discard patient
  discardPatient = async (id: string): Promise<PatientDocument> => {
    try {
      const patient = await this.patientModel.findByIdAndUpdate(
        id,
        { admissionStatus: AdmissionStatusEnum.DISCHARGED },
        { new: true },
      );
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  };

  //GET PENDING DISCHARGE PATIENTS
  getPendingDischargePatients = async (
    data?: FilterPatientDto,
  ): Promise<PatientReturn> => {
    try {
      const { page, limit, search } = data;
      const query = {
        admissionStatus: AdmissionStatusEnum.PENDING,
      };
      if (search) {
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
        ];
      }
      const count = await this.patientModel.countDocuments(query);
      const patients = await this.patientModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      const totalPages = Math.ceil(count / limit);
      return { patients, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  };

  //create login credentials for patient, patients are to specify their emails and then the system generates a default 8 alphanumeric password for them
  createLoginCredentials = async (data: CreatePatientLoginDto): Promise<any> => {
    try {
      const { id, email } = data;

      //find the patient whose ID is the id provided
      const patient = await this.patientModel.findById(id);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      //generate a random 8 digit alphanumeric password
      const password = Math.random().toString(36).slice(-8);
      //attach the email and password to the patient
      patient.email = email ? email : patient.email;
      //hash the password
      patient.password = await bcrypt.hash(password, 10);
      //save the patient
      await patient.save();
      //send the password to the patient's email
      const text = `Your login credentials are as follows: Email: ${patient.email} Password: ${password}`;
      const fullname = `${patient.firstName} ${patient.lastName}`;
      const htmlTemplate = sendWelcomeStaffEmail(
        fullname,
        patient.email,
        patient.ID,
        password,
      );
      await this.mailService.sendMail(
        text,
        htmlTemplate,
        patient.email,
        'Login Details',
      );
      //return the password
      return { password };
    } catch (error) {
      throw error;
    }
  };

  //patient log in
  patientLogin = async (data: PatientLoginDto): Promise<any> => {
    try {
      const { ID, password } = data;
      //find the patient whose email is the email provided
      const patient = await this.patientModel.findOne({ ID });
      const hashedPassword = patient.password;
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      //compare the password provided with the password in the database
      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      //generate a token
      const { authorizationToken } = await this.tokenService.generateTokens({
        user: patient.id,
        email: patient.email,
        ID: patient.ID,
        category: 'patient'
      });

      return { accessToken: authorizationToken, patient: patient };
    } catch (error) {
      throw error;
    }
  };

  //get patient by id
  getPatientById = async (id: string): Promise<PatientDocument> => {
    try {
      const patient = await this.patientModel.findById(id);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  };

  // forgot password
  // generate a random 6 digit OTP and send it to the patient's email
  //save the otp and set the expiry time to 1 hour
  forgotPassword = async (data: ForgotPasswordDto): Promise<any> => {
    try {
      const { email } = data;
      //find the patient whose email is the email provided
      const patient = await this.patientModel.findOne({ email });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      //generate a random 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      //save the otp and set the expiry time to 1 hour
      //hash the otp
      const hashedOtp = await bcrypt.hash(otp.toString(), 10);
      //save the otp and set the expiry time to 1 minute
      patient.otp = hashedOtp;
      const expiresAt = new Date().getTime() + 60000 * 15;
      patient.otpExpiry = new Date(expiresAt);
      await patient.save();
      //send the otp to the patient's email
      const text = `Your OTP is ${otp}`;
      const fullname = `${patient.firstName} ${patient.lastName}`;
      const htmlTemplate = sendWelcomeStaffEmail(
        fullname,
        patient.email,
        patient.ID,
        otp.toString(),
      );
      await this.mailService.sendMail(text, htmlTemplate, patient.email, 'OTP');
      return { message: 'OTP sent' };
    } catch (error) {
      throw error;
    }
  };

  //reset password
  //check if the otp provided is valid
  //if valid, update the password
  resetPassword = async (data: PatientResetPasswordDto): Promise<any> => {
    try {
      const { confirmPassword, otp, password, email } = data;
      //find the patient whose otp is the otp provided
      const patient = await this.patientModel.findOne({ email });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      //check if the otp provided is valid
      const isMatch = await bcrypt.compare(otp, patient.otp);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid OTP');
      }
      if (password !== confirmPassword) {
        throw new UnauthorizedException('Passwords do not match');
      }
      //check if the otp has expired
      if (patient.otpExpiry < new Date()) {
        throw new UnauthorizedException('OTP expired');
      }
      //if valid, update the password
      patient.password = await bcrypt.hash(password, 10);
      patient.otp = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      patient.otpExpiry = null;
      await patient.save();
      return { message: 'Password reset successful' };
    } catch (error) {
      throw error;
    }
  };

  //change password
  //check if the old password provided is valid
  //if valid, update the password
  changePassword = async (data: ChangePasswordDto, req: any): Promise<any> => {
    try {
      const { oldPassword, newPassword, confirmPassword } = data;
      //find the patient whose ID is the ID provided
      const patient = await this.patientModel.findById(req.user);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      //check if the old password provided is valid
      const isMatch = await bcrypt.compare(oldPassword, patient.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid password');
      }
      if (newPassword !== confirmPassword) {
        throw new UnauthorizedException('Passwords do not match');
      }
      //if valid, update the password
      patient.password = await bcrypt.hash(newPassword, 10);
      await patient.save();
      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  };

  //logged in patient get his/her details
  getPatientDetails = async (req: any): Promise<any> => {
    try {
      const patient = await this.patientModel.findById(req.user);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      // const visit = await this.visitService.getPatientMostRecentVisit(req)
      return {patient}
    } catch (error) {
      throw error;
    }
  };

  //user update his/her details
  updatePatientDetails = async (
    data: UpdatePatientDto,
    req: any,
    filename?: Express.Multer.File,
  ): Promise<PatientDocument> => {
    try {
      console.log(req.user, 'user')
      const patient = await this.patientModel.findById(req.user);
      
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      const uploadImage = await this.cloudinaryService.uploadImage(filename);
      //update the patient details
      const updatedPatient = await this.patientModel.findByIdAndUpdate(
        req.user,
        {
          ...data,
          patientImage: uploadImage.secure_url,
        },
        { new: true },
      );

      return updatedPatient;
    } catch (error) {
      throw error;
    }
  };

  //get list of patients by their given ids
  // getPatientsByIds = async (ids: string[]): Promise<any> => {
  //   try {
  //     const patients = await this.patientModel.find({ _id: { $in: ids } })
  //     //pass the query to the patient service
    

  //     .select('firstName lastName ID phoneNumber')
  //    return patients;
      
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getPatientsByIds(ids: string[], patientQuery?: any): Promise<any> {
    try {
      const query = { _id: { $in: ids }, ...patientQuery };
      const patients = await this.patientModel
        .find(query)
        .select('firstName lastName ID phoneNumber')
        .exec();
  
      return patients;
    } catch (error) {
      throw error;
    }
  }

 
  
  

}
