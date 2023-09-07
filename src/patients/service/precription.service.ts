import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrescriptionStatusEnum } from 'src/utils/enums/patients/prescriptionStatus.enum';
import { PrescriptionDocument } from 'src/utils/schemas/patients/prescription.schema';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import {
  PharmacyPrescriptionDto,
  PharmacyPrescriptionReturn,
  UpdatePharmacyPrescriptionDto,
} from '../dto/pharmacyPrescription.dto';
import {
  PharmacyPrescriptionDocument,
  PharmacyPrescriptionEntity,
} from '../schema/pharmacyPrescription.schema';
import { InvestigationService } from './investigation.service';
import { Request } from 'express';
import moment from 'moment';
import { CalendarFilterEnum } from '../enum/visit-status.enum';
import * as uuid from 'uuid';
import { DoseDocument, DoseEntity } from '../schema/dose.schema';
import { TakeOrSkipDoses } from '../enum/follow-up-status.enum';
import { TakeOrSkipDosesDto } from '../dto/follow-up.dto';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { PatientsService } from './patients.service';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';
import { ProductOrderService } from 'src/pharmacy/service/product-order.service';
import { ProductOrderDocument, ProductOrderEntity } from 'src/pharmacy/schema/product-order.schema';
import { PaginateData } from 'got';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(PharmacyPrescriptionEntity.name)
    private readonly prescriptionModel: Model<PharmacyPrescriptionDocument>,
    private readonly investigationService: InvestigationService,
    @InjectModel(DoseEntity.name)
    private readonly doseModel: Model<DoseDocument>,
    private readonly patientService: PatientsService,
    private readonly appNotificationService: AppNotificationService,
    private readonly productOrderService: ProductOrderService,
    @InjectModel(ProductOrderEntity.name)
    private readonly productOrderModel: Model<ProductOrderDocument>,
  ) {}

  async createPrescription(
    prescription: PharmacyPrescriptionDto,
    req: any,
  ): Promise<PharmacyPrescriptionDocument> {
    try {
      const uniqueCode = Math.floor(100000 + Math.random() * 900000);
      

      const newPrescription = new this.prescriptionModel({
        ...prescription,
        doctor: req.user,
        uniqueCode,
      });

      const patientDetails = await this.patientService.getPatientById(
        prescription.patient as unknown as string,
      );

      const res = await newPrescription.save();
      const title = 'New Prescription'

      await this.appNotificationService.createNotification({
        userId: req.user.toString(),
        title,
        key: 'Pharmacy',
        message: `A new prescription for ${patientDetails?.firstName} ${patientDetails?.lastName} has been created`,
        to: 'PHARMACY'
      });
      return res
    } catch (err) {
      throw err;
    }
  }

  async createIndividualPrescription(
    prescription: any,
    patient: string
  ): Promise<any> {
    try{
    const uniqueCode = Math.floor(100000 + Math.random() * 900000);
      const newPrescription = new this.prescriptionModel({
        ...prescription,
        patient,
        uniqueCode,
        isIndividual: true,
        status: 'PAID'
      });

      return await newPrescription.save();
  }
  catch(err) {
    throw err;
  }
}


async updateTotalCost(id: string, totalCost: number): Promise<any> {
  try {
    return await this.prescriptionModel.findByIdAndUpdate(
      id,
      { $set: { totalCost } },
      { new: true },
    );
  } catch (err) {
    throw err;
  }
}


     


  async getPrescription(id: string): Promise<PharmacyPrescriptionDocument> {
    try {
      //we want to populate the patient, doctor, and items array
      const prescription = await this.prescriptionModel
        .findById(id)
        .populate('patient')
        .populate('doctor')
        //items is an array of products, so we want to populate each product in the array
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        });
      if (!prescription) throw new NotFoundException('Prescription not found');
      return prescription;
    } catch (err) {
      throw err;
    }
  }

  async getPrescriptionAccount(id: string): Promise<any> {
    try {
      //we want to populate the patient, doctor, and items array
      let isPharmacy: boolean = true;
      let response: any = {};
      console.log('hehehheheh');
      response = await this.prescriptionModel
        .findById(id)
        // .populate('patient')
        // .populate('doctor')
        //items is an array of products, so we want to populate each product in the array
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        });
      if (!response) {
        isPharmacy = false;
        response = await this.investigationService.getInvestigation(id);
      }
      return { isPharmacy, response };
    } catch (err) {
      throw err;
    }
  }

  //get all prescriptions for a patient
  async getPrescriptionsByPatient(
    
    patientId: string,
    data?: PaginationDto
  ): Promise<any> {
    try {
      const query = {
        patient: patientId,
      }
      const { page, limit } = data;
      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find(query)
          .populate('doctor')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.prescriptionModel.countDocuments(query),
      ]);
      const totalPages = Math.ceil(count / limit);
      return {prescriptions, count, totalPages, currentPage: page};
    } catch (err) {
      throw err;
    }
  }


      

  //get pending prescriptions for a patient
  async getPendingPrescriptionsByPatient(
    patientId: string,
  ): Promise<PharmacyPrescriptionDocument[]> {
    try {
      //we want to get all prescriptions that are pending for a patient, populate by the doctor and also populate the products in the items array
      return await this.prescriptionModel
        .find({
          patient: patientId,
          status: PrescriptionStatusEnum.PENDING,
        })
        .populate('doctor')
        //items is an array of products, so we want to populate each product in the array
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        });
    } catch (err) {
      throw err;
    }
  }

  //get all pending presciptions
  async getPendingPrescriptions(
    data?: FilterPatientDto,
  ): Promise<PharmacyPrescriptionReturn> {
    try {
      const { startDate, endDate, page, limit, search } = data;
      const query = {};
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
      // if (search) {
      //   //if search, search by patient first name, last name, or ID or phoneNumber
      //   query['$patient'] = [
      //     { 'patient.firstName': { $regex: search, $options: 'i' } },
      //     { 'patient.lastName': { $regex: search, $options: 'i' } },
      //     { 'patient.phoneNumber': { $regex: search, $options: 'i' } },
      //     { 'patient.ID': { $regex: search, $options: 'i' } },
      //   ];
      // }
      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find({ status: PrescriptionStatusEnum.PENDING, ...query })
          .populate('patient')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.prescriptionModel.countDocuments({
          status: PrescriptionStatusEnum.PENDING,
          ...query,
        }),
      ]);
      if (search) {
        //if search, search by patient first name, last name, or ID or phoneNumber
        const filtered = prescriptions.filter((prescription: any) => {
          const patient = prescription.patient;
          return (
            patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.phoneNumber
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filtered.length;
        const totalPages = Math.ceil(counts / limit);
        return {
          prescriptions: filtered,
          count: counts,
          totalPages,
          currentPage: page,
        };
      }
      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (err) {
      throw err;
    }
  }

  //get all completed requests
  async getCompletedPrescriptions(
    data?: FilterPatientDto,
  ): Promise<PharmacyPrescriptionReturn> {
    try {
      const { startDate, endDate, page, limit, search } = data;
      const query = {};
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find({ status: PrescriptionStatusEnum.DISPENSED, ...query })
          .populate('patient', 'firstName lastName phoneNumber ID')
          .populate('doctor', 'firstName lastName phoneNumber ID')
          .populate('pharmacist', 'firstName lastName phoneNumber ID')
          .populate({
            path: 'items',
            populate: [
              {
                path: 'product',
                model: 'DrugProductEntity',
                populate: [
                  {
                    path: 'drugType',
                    model: 'DrugTypeEntity',
                  },
                  {
                    path: 'genericName',
                    model: 'DrugGenericEntity',
                  },
                ],
              },
            ],
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.prescriptionModel.countDocuments({
          status: PrescriptionStatusEnum.DISPENSED,
          ...query,
        }),
      ]);
      if (search) {
        //if search, search by patient first name, last name, or ID or phoneNumber
        const filtered = prescriptions.filter((prescription: any) => {
          const patient = prescription.patient;
          return (
            patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.phoneNumber
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filtered.length;
        const totalPages = Math.ceil(counts / limit);
        return {
          prescriptions: filtered,
          count: counts,
          totalPages,
          currentPage: page,
        };
      }
      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (err) {
      throw err;
    }
  }

  //update prescription
  async updatePrescription(
    id: string,
    data: UpdatePharmacyPrescriptionDto,
  ): Promise<PharmacyPrescriptionDocument> {
    try {
      return await this.prescriptionModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true },
      );
    } catch (err) {
      throw err;
    }
  }

  async updatePrescriptionPayment(
    id: string,
  ): Promise<PharmacyPrescriptionDocument> {
    try {
      return await this.prescriptionModel.findByIdAndUpdate(
        id,
        { status: PrescriptionStatusEnum.PAID},
        { new: true },
      );
    } catch (err) {
      throw err;
    }
  }

  //delete prescription if status is pending
  async deletePrescription(id: string): Promise<string> {
    try {
      const prescription = await this.prescriptionModel.findById(id);
      if (prescription.status === PrescriptionStatusEnum.PENDING) {
        await this.prescriptionModel.findByIdAndDelete(id);
        return 'Prescription deleted successfully';
      } else {
        return 'Prescription cannot be deleted';
      }
    } catch (err) {
      throw err;
    }
  }

  async getPrescriptionsForDoctor(
    id: string,
    data?: FilterPatientDto,
  ): Promise<PharmacyPrescriptionReturn> {
    try {
      const { startDate, endDate, page, limit, search } = data;
      const query = {};
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }
      // if (search) {
      //   //if search, search by patient first name, last name, or ID or phoneNumber
      //   query['$patient'] = [
      //     { 'patient.firstName': { $regex: search, $options: 'i' } },
      //     { 'patient.lastName': { $regex: search, $options: 'i' } },
      //     { 'patient.phoneNumber': { $regex: search, $options: 'i' } },
      //     { 'patient.ID': { $regex: search, $options: 'i' } },
      //   ];
      // }
      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find({ doctor: id, ...query })
          .populate('patient')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.prescriptionModel.countDocuments({ doctor: id, ...query }),
      ]);
      if (search) {
        //if search, search by patient first name, last name, or ID or phoneNumber
        const filtered = prescriptions.filter((prescription: any) => {
          const patient = prescription.patient;
          return (
            patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.phoneNumber
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filtered.length;
        const totalPages = Math.ceil(counts / limit);
        return {
          prescriptions: filtered,
          count: counts,
          totalPages,
          currentPage: page,
        };
      }
      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (err) {
      throw err;
    }
  }

  async getAllPrescriptions(
    data?: FilterPatientDto,
  ): Promise<PharmacyPrescriptionReturn> {
    try {
      const query = {};
      const { startDate, endDate, page, limit, search } = data;
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      let [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find(query)
          .populate('patient')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),

        this.prescriptionModel.countDocuments(query),
      ]);
      if (search) {
        //if search, search by patient first name, last name, or ID or phoneNumber
        const filtered = prescriptions.filter((prescription: any) => {
          const patient = prescription.patient;
          return (
            patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.phoneNumber
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filtered.length;
        const totalPages = Math.ceil(counts / limit);
        return {
          prescriptions: filtered,
          count: counts,
          totalPages,
          currentPage: page,
        };
      }

      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (err) {
      throw err;
    }
  }


  



  //get all prescriptions
  async getPrescriptionsForAccount(
    data?: FilterPatientDto,
  ): Promise<PharmacyPrescriptionEntity[]> {
    const { startDate, endDate, search } = data;
    try {
      const query = {
        status: {
          $in: [PrescriptionStatusEnum.PAID, PrescriptionStatusEnum.BILLED],
        },
      };

      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      const prescriptions = await this.prescriptionModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate('patient')
        .populate('doctor')
        // .populate('product')
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        })
        .sort({ createdAt: -1 });
      console.log(search, 'search');
      if (search) {
        //if search, search by patient first name, last name, or ID or phoneNumber
        const filtered = prescriptions.filter((prescription: any) => {
          const patient = prescription.patient;
          return (
            patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.phoneNumber
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
        return filtered;
      }

      return prescriptions;
    } catch (err) {
      throw err;
    }
  }

  //mark prescription as paid
  async markAsPaid(
    id: string,
    req: any,
    paymentMethod: PaymentMethodEnum,
  ): Promise<any> {
    try {
      let isPharmacy: boolean = true;
      const response = await this.prescriptionModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status: PrescriptionStatusEnum.PAID,
            paidBy: req.user,
            paymentMethod,
            paidAt: new Date(),
          },
        },
        { new: true },
      );
      if (!response) {
        isPharmacy = false;
        await this.investigationService.markInvestigationAsPaid(
          id,
          req,
          paymentMethod,
        );
      }
      return isPharmacy;
    } catch (err) {
      throw err;
    }
  }

  //get all prescriptions paid
  async getPrescriptionsPaid(data?: FilterPatientDto): Promise<any> {
    try {
      const query = {
        status: PrescriptionStatusEnum.PAID,
      };
      const { startDate, endDate, search } = data;
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      let [prescriptions, count] = await Promise.all([
        this.prescriptionModel

          .find(query)
          .populate('patient')
          .populate('doctor')
          .populate({
            path: 'items',
            populate: {
              path: 'product',
              model: 'DrugProductEntity',
            },
          })
          // .skip((page - 1) * limit)
          // .limit(limit)
          .sort({ createdAt: -1 }),

        this.prescriptionModel.countDocuments(query),
      ]);
      if (search) {
        //if search, search by patient first name, last name, or ID or phoneNumber
        const filtered = prescriptions.filter((prescription: any) => {
          const patient = prescription.patient;
          return (
            patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            patient?.phoneNumber
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            patient?.ID?.toLowerCase().includes(search.toLowerCase())
          );
        });
        const counts = filtered.length;
        // const totalPages = Math.ceil(counts / limit);
        return {
          prescriptions: filtered,
          count: counts,
          // totalPages,
          // currentPage: page,
        };
      }

      // const totalPages = Math.ceil(count / limit);
      return { prescriptions, count };
    } catch (err) {
      throw err;
    }
  }

  //aggregate paid prescriptions using CalendarFilterEnum
  async getCalendarFilter(data?: CalendarFilterEnum): Promise<any> {
    try {
      console.log(data, 'data');
      const query = {
        status: PrescriptionStatusEnum.PAID,
      };
      const paidInvestigations =
        await this.investigationService.getInvestigationsPaidAll();
      const paidPrescriptions = await this.prescriptionModel.find(query);
      const allTransactions = [...paidInvestigations, ...paidPrescriptions];
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
        const transactions = allTransactions.filter((transaction: any) => {
          const createdAt = new Date(transaction.createdAt).toISOString();
          return createdAt >= start && createdAt <= end;
        });
        const grouped = dates.map((date) => {
          const transactionsPerDay = transactions.filter((transaction: any) => {
            const createdAt = new Date(transaction.createdAt).toISOString();
            return createdAt.includes(date.date);
          });
          const totalCost = transactionsPerDay.reduce(
            (acc, transaction: any) => {
              return acc + transaction.totalCost;
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

        const transactions = allTransactions.filter((transaction: any) => {
          const createdAt = new Date(transaction.createdAt);
          return (
            createdAt >= new Date(currentYear, currentMonth - 11, 1) &&
            createdAt <= currentDate
          );
        });

        const grouped = months.map((month) => {
          const transactionsPerMonth = transactions.filter(
            (transaction: any) => {
              const createdAt = new Date(transaction.createdAt);
              const monthStr = `${createdAt.getFullYear()}-${(
                createdAt.getMonth() + 1
              )
                .toString()
                .padStart(2, '0')}`;
              return month === monthStr;
            },
          );
          const totalCost = transactionsPerMonth.reduce(
            (acc, transaction: any) => {
              return acc + transaction.totalCost;
            },
            0,
          );
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
        const transactions = allTransactions.filter((transaction: any) => {
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
              return acc + transaction.totalCost;
            },
            0,
          );
          return { year, totalCost };
        });
        return grouped;
      }
    } catch (err) {
      throw err;
    }
  }

  // Login patient to be able to get the history of his/her priscription
  async getAllPrescriptionsForPatient(
    req: Request,
    page = 1,
    limit = 15,
  ): Promise<any> {
    try {
      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find({
            patient: req.user.toString(),
            status: { $ne: PrescriptionStatusEnum.DISPENSED },
          })
          .populate('doctor', 'firstName lastName')
          .populate('paidBy', 'firstName lastName')
          .populate({
            path: 'items',
            populate: {
              path: 'product',
              model: 'DrugProductEntity',
            },
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.prescriptionModel.countDocuments({
          patient: req.user.toString(),
          status: { $ne: PrescriptionStatusEnum.DISPENSED },
        }),
      ]);
      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  //get all BILLED prescriptions for a patient
  async getBilledPrescriptionsForPatient(
    req: Request,
    page = 1,
    limit = 15,
  ): Promise<any> {
    try {
      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find({
            patient: req.user.toString(),
            status: PrescriptionStatusEnum.BILLED,
          })
          .populate('doctor', 'firstName lastName')
          .populate('paidBy', 'firstName lastName')
          .populate({
            path: 'items',
            populate: {
              path: 'product',
              model: 'DrugProductEntity',
            },
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.prescriptionModel.countDocuments({
          patient: req.user.toString(),
          status: PrescriptionStatusEnum.BILLED,
        }),
      ]);
      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  //get all dispensed prescriptions for a patient
  async getDispensedPrescriptionsForPatient(
    req: Request,
    page = 1,
    limit = 15,
  ): Promise<any> {
    try {
      const [prescriptions, count] = await Promise.all([
        this.prescriptionModel
          .find({
            patient: req.user.toString(),
            status: PrescriptionStatusEnum.DISPENSED,
          })
          .populate('patient')
          .populate('doctor')
          .populate('paidBy')
          .populate({
            path: 'items',
            populate: {
              path: 'product',
              model: 'DrugProductEntity',
            },
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.prescriptionModel.countDocuments({
          patient: req.user,
          status: PrescriptionStatusEnum.DISPENSED,
        }),
      ]);
      const totalPages = Math.ceil(count / limit);
      return { prescriptions, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  generateDosesForDrugItem = async (
    item: any,
    patient: string,
    product: any,
  ) => {
    const {
      frequency,
      duration,
      quantity,
      amount,
      foodRelation,
      routeOfAdmin,
      createdAt,
    } = item;

    const drugFrequency = {
      OD: 1,
      BD: 2,
      TDS: 3,
      QDS: 4,
      QID: 6,
      QHS: 8,
      HS: 12,
      Q4H: 6,
      Q6H: 4,
      Q8H: 8,
      Q12H: 12,
      Q24H: 24,
    };
    const frequencyToUse = drugFrequency[frequency];

    const numberOfDosesInADay = frequencyToUse;
    const timeTfrequencyToUse = 24 / frequencyToUse;
    const quantityAvailable = quantity;
    const quantityPerDose = amount;
    const numberOfDosesInDuration = duration * numberOfDosesInADay;
    const totalQuantityToBeTaken = quantityPerDose * numberOfDosesInDuration;
    const numberOfDaysToBeTaken = duration;
    const numberOfDosesToBeTaken = totalQuantityToBeTaken / quantityPerDose;
    const numberOfDosesToBeTakenInADay =
      numberOfDosesToBeTaken / numberOfDaysToBeTaken;
    let doses: any = [];
    const id = Date.now() + (Math.random() * 10000000).toFixed(0);
    for (let i = 0; i < numberOfDosesToBeTaken; i++) {
      //we want to add the frequencyToUse to the last dose time to get the next dose time
      //the first dose time is the nextDose field in the drug item and iteratively, the frequencyToUse is added to the last dose time to get the next dose time

      const lastDose = doses[doses.length - 1];
      const lastDoseTime = lastDose ? lastDose.time : new Date();
      const nextDoseDateAndTime = moment(lastDoseTime)
        .add(timeTfrequencyToUse, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      const timeToIsoString = new Date(nextDoseDateAndTime).toISOString();
      //generate a unique random id for each dose

      doses.push({
        time: timeToIsoString,
        status: 'pending',
        item,
        patient,
      });

      await this.doseModel.create({
        uniqueCode: id,
        time: timeToIsoString,
        status: 'pending',
        item: item.product,
        frequency,
        amount,
        routeOfAdmin,
        foodRelation,
        patient,
        prescriptionCreatedAt: createdAt,
        notes: item?.notes,
        drugType: product?.drugType?.name,
        brandName: product?.brandName,
        genericName: product?.genericName?.activeIngredient,
        strength: product?.strength,
      });
    }
    return doses;
  };

  async getDrugDosesForPatient(req: Request): Promise<any> {
    try {
      const doses = await this.doseModel
        .find({ patient: req.user })
        .populate('item', 'drugName brandName strength');
      console.log(doses, 'doses');
      const completedDoses = await this.doseModel
        .find({
          patient: req.user.toString(),
          status: 'taken',
        })
        .populate('item');
      console.log(completedDoses, 'completedDoses');
      //now we want to classify the pending doses into morning, afternoon and evening
      const morning: any = [];
      const afternoon: any = [];
      const evening: any = [];

      doses.forEach((dose: any) => {
        const { time } = dose;
        const hour = time.split('T')[1].split(':')[0];
        if (hour >= '00' && hour <= '11') {
          morning.push(dose);
        } else if (hour >= '12' && hour <= '17') {
          afternoon.push(dose);
        } else if (hour >= '18' && hour <= '23') {
          evening.push(dose);
        }
      });
      return { morning, afternoon, evening, completedDoses };
    } catch (error) {
      throw error;
    }
  }

  //get drug doses for a patient
  //then we want to get records of only doses where time falls within monday to sunday of current day week
  // async getDrugDosesForPatientByWeek(req: Request): Promise<any> {
  //   try {
  //     const doses = await this.doseModel
  //       .find({ patient: req.user })
  //       .populate('item', 'drugName brandName strength');

  //     const completedDoses = await this.doseModel
  //       .find({ patient: req.user.toString(), status: 'taken' })
  //       .populate('item');

  //     const days = {
  //       Monday: [],
  //       Tuesday: [],
  //       Wednesday: [],
  //       Thursday: [],
  //       Friday: [],
  //       Saturday: [],
  //       Sunday: [],
  //     };

  //     const weekStart = moment().startOf('week');
  //     const weekEnd = moment().endOf('week');

  //     doses.forEach((dose: any) => {
  //       const doseTime = moment(dose.time);
  //       if (doseTime.isBetween(weekStart, weekEnd, null, '[]')) {
  //         const dayOfWeek = doseTime.format('dddd');
  //         days[dayOfWeek].push(dose);
  //       }
  //     });

  //     return { days, completedDoses };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getDrugDosesForPatientByWeek(req: Request): Promise<any> {
    try {
      const doses = await this.doseModel
        .find({ patient: req.user })
        .populate('item', 'drugName brandName strength');

      const completedDoses = await this.doseModel
        .find({ patient: req.user.toString(), status: 'taken' })
        .populate('item');

      const days = {
        Monday: { morning: [], afternoon: [], evening: [] },
        Tuesday: { morning: [], afternoon: [], evening: [] },
        Wednesday: { morning: [], afternoon: [], evening: [] },
        Thursday: { morning: [], afternoon: [], evening: [] },
        Friday: { morning: [], afternoon: [], evening: [] },
        Saturday: { morning: [], afternoon: [], evening: [] },
        Sunday: { morning: [], afternoon: [], evening: [] },
      };

      const weekStart = moment().startOf('week');
      const weekEnd = moment().endOf('week');

      doses.forEach((dose: any) => {
        const { time } = dose;
        const doseTime = moment(dose.time);
        if (doseTime.isBetween(weekStart, weekEnd, null, '[]')) {
          const dayOfWeek = doseTime.format('dddd');
          const hourOfDay = time.split('T')[1].split(':')[0];
          if (hourOfDay >= 0 && hourOfDay <= 11) {
            days[dayOfWeek].morning.push(dose);
          } else if (hourOfDay >= 12 && hourOfDay <= 17) {
            days[dayOfWeek].afternoon.push(dose);
          } else {
            days[dayOfWeek].evening.push(dose);
          }
        }
      });

      return { days, completedDoses };
    } catch (error) {
      throw error;
    }
  }

  //take or skip one or multiple doses
  async takeOrSkipDose(req: Request, data: TakeOrSkipDosesDto): Promise<any> {
    try {
      const { status } = data;
      // const doses = await this.doseModel.find({ id: { $in: dose } });
      data.dose.forEach(async (dose: any) => {
        const doseToUpdate = await this.doseModel.findById(dose);
        if (doseToUpdate) {
          doseToUpdate.status = status;
          await doseToUpdate.save();
        }
      });
      return { message: 'Doses updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  //we want to get the level of compliance of a patient to a drug item, we will compare the number of doses taken to the number of doses that should have been taken
  async getDrugItemCompliance(req: Request, item: string): Promise<any> {
    try {
      const doses = await this.doseModel
        .find({
          uniqueCode: item,
          patient: req.user,
        })
        .populate({
          path: 'item',
          populate: {
            path: 'drugType',
            model: 'DrugTypeEntity',
          },
        });
      //gather all doses and match their uniqueCode together to get the number of doses that should have been taken
      const uniqueCodes: any = [];
      doses.forEach((dose: any) => {
        if (!uniqueCodes.includes(dose.uniqueCode)) {
          uniqueCodes.push(dose.uniqueCode);
        }
      });

      //then we want to get all doses of the same uniqueCode, get the completed ones and count them, then divide by the total number of doses that should have been taken
      let totalDosesTaken = 0;
      const frequency = doses[0].frequency;
      doses.forEach(async (dose: any) => {
        //filter the completed doses
        if (dose.status === 'taken') {
          totalDosesTaken += 1;
        }

        // totalDosesTaken += doses.length; 10
      });
      const drugFrequency = {
        OD: 1,
        BD: 2,
        TDS: 3,
        QDS: 4,
        QID: 6,
        QHS: 8,
        HS: 12,
        Q4H: 6,
        Q6H: 4,
        Q8H: 8,
        Q12H: 12,
        Q24H: 24,
      };
      const frequencyToUse = drugFrequency[frequency];
      const totalDosesThatShouldHaveBeenTaken = doses.length;
      const compliance =
        (totalDosesTaken / totalDosesThatShouldHaveBeenTaken) * 100;
      //round it up to 2 decimal places
      const roundedCompliance = compliance.toFixed(2);
      //we want to get the remaining doses to be taken and get the number of days left to take them with Math.ceil
      const remainingDosesToBeTaken =
        totalDosesThatShouldHaveBeenTaken - totalDosesTaken;
      const numberOfDaysLeftToTakeRemainingDoses = Math.ceil(
        remainingDosesToBeTaken / frequencyToUse,
      );
      //get total number of days taken already
      const numberOfDaysTakenAlready = Math.ceil(
        totalDosesTaken / frequencyToUse,
      );
      return {
        percentageCompliance: roundedCompliance,
        remainingDays: numberOfDaysLeftToTakeRemainingDoses,
        numberOfDaysTakenAlready,
      };
    } catch (error) {
      throw error;
    }
  }

  async getComplianceForAllDrugs(req: Request): Promise<any> {
    try {
      const doses = await this.doseModel.find({
        patient: req.user,
      });
      //get all the uniqueCodes and loop through them to get the compliance for each drug
      const uniqueCodes: any = [];
      //loop through the doses and get the uniqueCodes
      doses.forEach((dose: any) => {
        if (!uniqueCodes.includes(dose.uniqueCode)) {
          uniqueCodes.push(dose.uniqueCode);
        }
      });
      //loop through the uniqueCodes and pass this getDrugItemCompliance
      const compliance: any = [];
      for (let code of uniqueCodes) {
        const drugCompliance = await this.getDrugItemCompliance(req, code);
        const drugInfo = await this.doseModel.findOne({ uniqueCode: code });

        //can we get the last dose taken of the drug item?
        let endedAt = null;
        const firstDoseTakenAt: any = await this.doseModel
          .findOne({ uniqueCode: code, status: 'taken' })
          .sort({ createdAt: 1 });
        if (drugCompliance.remainingDays === 0) {
          //get the last dose taken
          const lastDoseTaken: any = await this.doseModel
            .findOne({ uniqueCode: code, status: 'taken' })
            .sort({ createdAt: -1 });
          endedAt = lastDoseTaken?.updatedAt;
        }

        compliance.push({
          compliance: drugCompliance,
          drugInfo,
          lastDoseTakenAt: endedAt || null,
          firstDoseTakenAt: firstDoseTakenAt?.updatedAt || null,
        });
      }
      return compliance;
    } catch (error) {
      throw error;
    }
  }

  //update the investigation receiptUrl
  async updatePrescriptionReceiptUrl(
    id: string,
    receiptUrl: string,
  ): Promise<any> {
    try {
      const prescription = await this.prescriptionModel.findById(id);
      if (!prescription) {
        throw new NotFoundException('Investigation not found');
      }
      prescription.receiptUrl = receiptUrl;
      await prescription.save();
      return { message: 'prescription receipt url updated successfully' };
    } catch (error) {
      throw error;
    }
  }
}

/*
 async getDrugItemUsageForPatient2(req: Request): Promise<any> {
    try {
      const prescriptions = await this.prescriptionModel
        .find({
          patient: req.user.toString(),
          status: PrescriptionStatusEnum.DISPENSED,
        })
        .populate('patient')
        .populate('doctor')
        .populate('paidBy')
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        })
        .sort({ createdAt: -1 });
      const drugItems: any = [];
      const completedItems: any = [];
      prescriptions.forEach((prescription: any) => {
        prescription.items.forEach((item: any) => {
          //based on the nextDose, we want generate all the dates and time for the next doses based on the quantity available , the frequency, and the amount
          const { product, numberOfTimes, frequency, routeOfAdmin, duration, foodRelation, nextDose, remainingDays, quantity, amount } = item
          if (numberOfTimes > 0) {
            //we want to generate the list of DateTime for every prescription item based on the frequency, duration, and quantity
            const result = this.generateDosesForDrugItem(item,  prescription?.patient?._id);
            drugItems.push(...result);
          }
          else {
            completedItems.push(item);
          }
          // const result = this.generateDosesForDrugItem(item);
          // //loop through the result and push each dose with status pending to the drugItems array, if there are no more doses with status pending, push the item to the completedItems array
          // result.forEach((dose: any) => {
          //   if (dose.status === 'pending') {
          //     drugItems.push(dose);
          //   }
          //   else if(dose.status === 'completed'){
          //     completedItems.push(item);
          //   }
        });

      });

      //we want to sort the drugItems based on the time
      drugItems.sort((a: any, b: any) => {
        return a.time - b.time;
      });
      //we want to classify the drugItems into morning, afternoon and evening
      const morning: any = [];
      const afternoon: any = [];
      const evening: any = [];
      drugItems.forEach((item: any) => {
        //the time is in ISOString format
        const time = item.time;
        const hour = time.split('T')[1].split(':')[0];
        console.log(hour, 'hour')

        //if time is between 00:00 and 11:59am, it is morning
        //if time is between 12:00 and 17:59pm, it is afternoon
        //if time is between 18:00 and 23:59pm, it is evening

        if (hour >= 0 && hour <= 11) {
          morning.push(item);
        }
        else if (hour >= 12 && hour <= 17) {
          afternoon.push(item);
        }
        else if (hour >= 18 && hour <= 23) {
          evening.push(item);
        }
      });

     
      return { morning, afternoon, evening, completedItems };
    } catch (error) {
      throw error
    }
  };





  //we want to implement patient using one or more of their drug items from the above function
  async useDrugItemForPatient(req: Request, drugs: any): Promise<any> {
    try {
      // console.log(drugs, 'drugszzzzzz')
      const data = drugs.drugs;
      console.log(data, 'data')
      const { morning, afternoon, evening } = await this.getDrugItemUsageForPatient2(req);
      const allDrugs = [...morning, ...afternoon, ...evening];
      const usedDrugs: any = [];
      allDrugs.forEach((drug: any) => {
        if (data.includes(drug.product.id)) {
          usedDrugs.push(drug);
        }
      }
      );
      console.log(usedDrugs, 'usedDrugs')
      //now we want to update the numberOfTimes of each of the used drugs
      usedDrugs.forEach(async (drug: any) => {
        const { product, numberOfTimes, prescription } = drug;
        const updatedNumberOfTimes = numberOfTimes - 1;
        console.log('shhdhhdjjdknmsbnmnbcnbshjbkdsbcnjkbn')
        const drugItemToUpdate: any = await this.prescriptionModel.findById(
          prescription
        ).populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        });
        console.log(drugItemToUpdate, 'drugItemToUpdate')
        let check = drugItemToUpdate.items

        //filter out the drug item to update
        // const drugItemUpdated = prescription.items.filter((item: any) => item.product.id === product.id);
        // console.log(drugItemUpdated, 'drugItemUpdatedzzzzzzzzz')
        if (!drugItemToUpdate) {
          throw new NotFoundException('Drug item not found');
        }
        const drugItemToUpdated = check.find((item: any) => item.product.id === product.id);

        //now we want to update the nextDose of each of the used drugs
        const { frequency, duration, quantity, amount } = drugItemToUpdated;
        const drugFrequency = {
          OD: 24,
          BD: 12,
          TDS: 8,
          QDS: 6,
          QID: 4,
          QHS: 3,
          HS: 2,
          Q4H: 6,
          Q6H: 4,
          Q8H: 3,
          Q12H: 2,
          Q24H: 1,
        };
        //we want to find the exact drug item to update where the product id matches the product id of the drug item to update
        
        console.log(drugItemToUpdated, 'drugItemToUpdated')
        console.log(drugItemToUpdated, 'drugItemToUpd')


        //the next dose is the current date and time plus the frequency of the drug
        drugItemToUpdated.numberOfTimes = updatedNumberOfTimes;
        // const nextDose = new Date();
        // nextDose.setHours(nextDose.getHours() + drugFrequency[frequency]);
        // drugItemToUpdated.nextDose = nextDose;

        //then calculate the remaining days of each of the used drugs
        const remainingQuantity = quantity - amount;
        console.log(remainingQuantity, 'remainingQuantity')
        const remainingDays = Math.ceil(remainingQuantity / ((drugFrequency[frequency] / 24) * amount));
        console.log(remainingDays, 'remainingDays')
        drugItemToUpdated.remainingDays = remainingDays;
        check = check.map((item: any) => {
          if (item.product.id === product.id) {
            return drugItemToUpdated;
          }
          return item;
        });

        //now find prescription by id and update the items
        await this.prescriptionModel.findByIdAndUpdate(
          prescription,
          { items: check },
          { new: true }
        );

        // await drugItemToUpdate.save();
      }

      );
      return { message: 'Drug item(s) used successfully' };
    } catch (error) {
      throw error;
    }
  }


  //we want to implement drug item usage for a patient that tracks how they use each item of all the prescriptions they have as long as the numberOfTimes is not zero. then get the frequency of each of the times to calculate the next dose of each of the drug, and then we want to broadly classify each of drug items into 3 categories of morning, afternoon, and evening based on the calculated next dose date and time
  async getDrugItemUsageForPatient(req: Request): Promise<any> {
    try {
      const prescriptions = await this.prescriptionModel
        .find({
          patient: req.user.toString(),
          status: PrescriptionStatusEnum.DISPENSED,
        })
        .populate('patient')
        .populate('doctor')
        .populate('paidBy')
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            model: 'DrugProductEntity',
          },
        })
        .sort({ createdAt: -1 });
      const drugItems: any = [];
      const completedItems: any = [];
      prescriptions.forEach((prescription: any) => {
        prescription.items.forEach((item: any) => {
          const { product, numberOfTimes, frequency, routeOfAdmin, duration, foodRelation, nextDose, remainingDays, quantity, amount } = item
          if (numberOfTimes > 0) {

            drugItems.push({
              product,
              numberOfTimes,
              frequency,
              prescription: prescription.id,
              routeOfAdmin,
              duration,
              foodRelation,
              nextDose,
              quantity,
              amount,
              remainingDays
            });
          }
          else {
            completedItems.push({
              product,
              numberOfTimes,
              frequency,
              prescription: prescription.id,
              routeOfAdmin,
              duration,
              foodRelation,
              nextDose,
              quantity,
              amount,
              remainingDays
            });
          }
        });
      });
     
      //now classify each of the drug items into morning, afternoon, and evening if the nextDose falls within the time range of each of the categories
      const morning: any = [];
      const afternoon: any = [];
      const evening: any = [];

      drugItems.forEach((item: any) => {
        console.log(item, 'itemppprprfhhfh')
        const { nextDose } = item;

        const date = moment(nextDose);
        // const hour = date.hour();
        //we want to check if the hour is single digit or double digit, if it is single digit, then we want to add a zero before it
        const hour = date.hour() < 10 ? `0${date.hour()}` : date.hour();
        const minute = date.minute();
        const time = `${hour}:${minute}`;
        console.log(time, 'time')
        if (time >= '00:00' && time <= '11:59') {
          morning.push(item);
        }
        else if (time >= '12:00' && time <= '17:59') {
          afternoon.push(item);
        }
        else if (time >= '18:00' && time <= '23:59') {
          evening.push(item);
        }

      }
      );
      return { morning, afternoon, evening, completedItems };
     
    } catch (error) {
      throw error;
    }


*/
