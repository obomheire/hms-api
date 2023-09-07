import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  FilterPaymentListDto,
  PaymentDto,
  PaymentResponseDto,
  PaymentWebhookDto,
} from '../dto/payment.dto';
import { CardEncryptionService } from './card-encryption.service';
import Flutterwave from 'flutterwave-node-v3';
import axios from 'axios';
import moment from 'moment'; // Import the moment package
import * as crypto from 'crypto';
import PDFKit from 'pdfkit';
import * as htmlToText from 'html-to-text';
import qs from 'qs';
import { AccountingService } from 'src/accounting/service/accounting.service';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { PaymentDocument, PaymentEntity } from '../schema/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { PatientsService } from 'src/patients/service/patients.service';
import { ConfigService } from '@nestjs/config';
import { QuickHttpService } from './quick-http.service';
import { PaymentStatusEnum } from '../enum/payment.enum';
import { UserEntity } from 'src/user/schema/user.schema';
import { TestEntity } from 'src/laboratory/schema/test.schema';
import { DrugProductEntity } from 'src/pharmacy/schema/product.schema';
import { MailsService } from 'src/providers/mails/mails.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CalendarFilterEnum } from 'src/patients/enum/visit-status.enum';

@Injectable()
export class PaymentService {
  private flutterwave: any;

  constructor(
    private readonly cardEncryptionService: CardEncryptionService,
    private readonly configService: ConfigService,
    private readonly accountingService: AccountingService,
    private readonly patientService: PatientsService,
    private readonly httpService: QuickHttpService,
    private readonly mailService: MailsService,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(PaymentEntity.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    this.flutterwave = new Flutterwave(
      process.env.FLUTTERWAVE_API_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY,
      false,
    );
  }

  //initialize payment using paystack
  async initiatePayment(paymentDto: PaymentDto): Promise<PaymentResponseDto> {
    const [status, httpStatus, title, message, response] =
      await this.httpService.request(
        `${this.configService.get('PAYSTACK_URL')}/transaction/initialize`,
        'post',
        {
          amount: paymentDto.amount,
          email: paymentDto.email,
          // metadata: {
          //   payment_id: paymentDto.paymentId,
          // },
          channels: ['card'],
        },
        null,
        {
          authorization: `Bearer ${this.configService.get('PSK_SECRET_KEY')}`,
          accept: 'application/json',
          'content-type': 'application/json',
        },
      );
    if (!status) {
      return {
        status: httpStatus,
        paymentUrl: null,
        reference: null,
        access_code: null,
        message: 'unable to charge card',
      };
    }
    if (!response || !response?.data) {
      return {
        message: 'unable to charge card',
        status: httpStatus,
        paymentUrl: null,
        access_code: null,
        reference: null,
      };
    }
    console.log(response.data);
    return {
      paymentUrl: response.data?.authorization_url,
      reference: response.data?.reference,
      access_code: response.data?.access_code,
      message: 'payment initiated successfully',
      status: httpStatus,
    };
  }

  //verify
  async verifyPayment(
    reference: string,
    amount: number,
    currency = 'NGN',
  ): Promise<any> {
    const [status, httpStatus, title, message, response] =
      await this.httpService.request(
        `${this.configService.get(
          'PAYSTACK_URL',
        )}/transaction/verify/${reference}`,
        'get',
        null,
        null,
        {
          authorization: `Bearer ${this.configService.get('PSK_SECRET_KEY')}`,
          accept: 'application/json',
          'content-type': 'application/json',
        },
      );

    if (status !== true) {
      return [false, 'Payment', 'charge verification request failed'];
    }

    if (
      !response ||
      !response?.data ||
      !response?.data?.reference ||
      !response?.data?.status ||
      !response?.data?.amount ||
      !response?.data?.currency
    ) {
      return [false, 'Payment', 'Unable to verify your payment'];
    }

    if (response?.data?.reference != reference) {
      return [
        false,
        'Payment',
        'Request and response has different transaction reference',
      ];
    }

    if (response?.data?.status != 'success') {
      return [false, 'Payment', 'Payment verification was not successful'];
    }

    if (response?.data?.amount < amount) {
      return [
        false,
        'Payment',
        `The amount paid (${response?.data?.amount}) is less than the expected amount (${amount})`,
      ];
    }

    if (response?.data?.currency != currency) {
      return [
        false,
        'Payment',
        `You paid in ${response?.data?.currency}, NGN was expected`,
      ];
    }
    return [true, response];
  }

  async createPaymentEntity(
    data: Partial<PaymentEntity>,
  ): Promise<PaymentDocument> {
    const newPayment = new this.paymentModel(data);
    return await newPayment.save();
  }

  //get all payments for a given patient id
  async getPaymentsByPatientId(patientId: string): Promise<any> {
    try {
      const payments = await this.paymentModel
        .find({
          patient: patientId,
          status: { $in: ['PENDING', 'PROCESSING'] },
        })
        .populate('itemToPayFor')
        .sort({ createdAt: -1 });
      //get the total cost of all the payments
      const totalCost = payments.reduce((acc, curr) => acc + curr.totalCost, 0);

      return { payments, totalCost };
    } catch (error) {
      throw error;
    }
  }

  // async getListOfPatientsWithPayments(
  //   data: FilterPaymentListDto,
  // ): Promise<any> {
  //   try {
  //     const { search, page, limit, paymentMethod } = data;
  //     //we want to group all the payments by the patient, that is all payments made by a patient will be grouped together
  //     const query = {};
  //     if (paymentMethod) {
  //       query['paymentMethod'] = paymentMethod;
  //     }
  //     let patientQuery
  //     if (search) {
  //       //searching by patient name or patient ID
  //       patientQuery = {
  //         $or: [
  //           { firstName: { $regex: search, $options: 'i' } },
  //           { lastName: { $regex: search, $options: 'i' } },
  //           { ID: { $regex: search, $options: 'i' } },
  //         ],
  //       };
  //       query['$and'] = [patientQuery];
  //     }

  //     const patientIds = await this.paymentModel
  //       .find(query)
  //       .sort({ createdAt: -1 })
  //       .distinct('patient');

  //     const { patients, count, currentPage, totalPages} = await this.patientService.getPatientsByIds(
  //       patientIds,
  //       page,
  //       limit,
  //       patientQuery,
  //     );

  //     //then we want to get the total cost of all the payments made by each patient
  //     const patientPayments = await Promise.all(
  //       patients.map(async (patient) => {
  //         const payments = await this.paymentModel
  //           .find({
  //             patient: patient._id,
  //             status: { $in: ['PENDING', 'PROCESSING'] },
  //           })
  //           .sort({ createdAt: -1 });
  //         //get the total cost of all the payments
  //         const totalCost = payments.reduce(
  //           (acc, curr) => acc + curr.totalCost,
  //           0,
  //         );
  //         //get most recent payment status
  //         // const status = payments[0].status;
  //         //we are returning patients with totalCost greater than 0
  //         if (totalCost <= 0) {
  //           return null;
  //         }
  //         return { patient, totalCost};
  //       }),
  //     );

  //     return {patientPayments, count, currentPage, totalPages};
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async getListOfPatientsWithPendingOrProcessingPayments(
  //   data: FilterPaymentListDto,
  // ): Promise<any> {

  //   try {
  //     const { search, page, limit, paymentMethod } = data;

  //     const query = {
  //       status: { $in: ['PENDING', 'PROCESSING'] },
  //     };

  //     if(paymentMethod) {
  //       query['paymentMethod'] = paymentMethod;
  //     }

  //     if (search) {
  //       const searchConditions = [
  //         { 'patient.firstName': { $regex: search, $options: 'i' } },
  //         { 'patient.lastName': { $regex: search, $options: 'i' } },
  //         { 'patient.ID': { $regex: search, $options: 'i' } },
  //       ];
  //       //query.$or = searchConditions;

  //       query['$or'] = searchConditions;
  //     }
  //    if(search) {

  //     }

  //     const patientPayments = await this.paymentModel
  //       .aggregate([
  //         { $match: query },
  //         {
  //           $group: {
  //             _id: '$patient',
  //             totalCost: { $sum: '$totalCost' },
  //             payments: { $push: '$$ROOT' },
  //           },
  //         },
  //         { $sort: { totalCost: -1 } },
  //         { $skip: (page - 1) * limit },
  //         { $limit: limit },
  //       ])
  //       .exec();

  //     const count = await this.paymentModel.aggregate([
  //       { $match: query },
  //       { $group: { _id: '$patient' } },
  //     ]).count('count').exec();

  //     const totalPages = Math.ceil(count[0]?.count / limit) || 1;

  //     const patients = await this.patientService.getPatientsByIds(
  //       patientPayments.map((p) => p._id),

  //     );
  //     console.log(patients, 'patients')

  //     const result = patientPayments.map((p) => ({
  //       patient: patients.find((pat) => pat._id.equals(p._id)),
  //       totalCost: p.totalCost,
  //     }));

  //     return { patientPayments: result, count: count[0]?.count || 0, currentPage: page, totalPages };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async getListOfPatientsWithPendingOrProcessingPayments(
  //   data: FilterPaymentListDto,
  // ): Promise<any> {
  //   try {
  //     const { search, page, limit, paymentMethod } = data;

  //     const matchQuery = {
  //       status: { $in: ['PENDING', 'PROCESSING'] },
  //     };

  //     if (paymentMethod) {
  //       matchQuery['paymentMethod'] = paymentMethod;
  //     }

  //     const aggregatePipeline = [];
  //     let patientQuery = {}

  //     if (search) {
  //       const searchConditions = [
  //         { firstName: { $regex: search, $options: 'i' } },
  //         { lastName: { $regex: search, $options: 'i' } },
  //         { ID: { $regex: search, $options: 'i' } },
  //         { email: { $regex: search, $options: 'i' } },
  //       ];

  //       // aggregatePipeline.push({
  //       //   $match: {
  //       //     $or: searchConditions,
  //       //   },
  //       // });
  //       patientQuery['$or'] = searchConditions;
  //     }

  //     aggregatePipeline.push(
  //       {
  //         $match: matchQuery,
  //       },
  //       {
  //         $group: {
  //           _id: '$patient',
  //           totalCost: { $sum: '$totalCost' },
  //           payments: { $push: '$$ROOT' },
  //         },
  //       },
  //       { $sort: { totalCost: -1 } },
  //       { $skip: (page - 1) * limit },
  //       { $limit: limit }
  //     );

  //     const patientPayments = await this.paymentModel.aggregate(aggregatePipeline).exec();

  //     const countPipeline = [...aggregatePipeline];
  //     countPipeline.splice(2, 1); // Remove the $group stage for counting

  //     const countResult = await this.paymentModel.aggregate(countPipeline).count('count').exec();
  //     const count = countResult[0]?.count || 0;

  //     const totalPages = Math.ceil(count / limit);

  //     const patientIds = patientPayments.map((p) => p._id);

  //     const patients = await this.patientService.getPatientsByIds(patientIds, patientQuery);

  //     const result = patientPayments.map((p) => ({
  //       patient: patients.find((pat) => pat._id.equals(p._id)),
  //       totalCost: p.totalCost,
  //     }));

  //     return { patientPayments: result, count, currentPage: page, totalPages };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getListOfPatientsWithPendingOrProcessingPayments(
    data: FilterPaymentListDto,
  ): Promise<any> {
    try {
      const { search, page, limit, paymentMethod } = data;

      const matchQuery = {
        status: { $in: ['PENDING', 'PROCESSING'] },
      };

      if (paymentMethod) {
        matchQuery['paymentMethod'] = paymentMethod;
      }

      const aggregatePipeline: any = [
        {
          $match: matchQuery,
        },
        {
          $group: {
            _id: '$patient',
            totalCost: { $sum: '$totalCost' },
            payments: { $push: '$$ROOT' },
          },
        },
        { $sort: { totalCost: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];

      // if (search) {
      //   const searchConditions = [
      //     // { firstName: { $regex: search, $options: 'i' } },
      //     // { lastName: { $regex: search, $options: 'i' } },
      //     // { ID: { $regex: search, $options: 'i' } },
      //     // { email: { $regex: search, $options: 'i' } },
      //     { 'patient.firstName': { $regex: search, $options: 'i' } },
      //          { 'patient.lastName': { $regex: search, $options: 'i' } },
      //             { 'patient.ID': { $regex: search, $options: 'i' } },
      //   ];

      //   aggregatePipeline.unshift(
      //     {
      //       $lookup: {
      //         from: 'patient',
      //         localField: '_id',
      //         foreignField: '_id',
      //         as: 'patientInfo',
      //       },
      //     },
      //     {
      //       $match: {
      //         $or: searchConditions,
      //       },
      //     }
      //   );
      // }

      if (search) {
        const searchConditions = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { ID: { $regex: search, $options: 'i' } },
        ];

        aggregatePipeline.unshift(
          {
            $lookup: {
              from: 'patient',
              let: { patientId: '$_id' }, // Create a variable to store _id
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$patientId'] } } }, // Match documents with matching _id
                {
                  $project: {
                    firstName: 1,
                    lastName: 1,
                    ID: 1,
                    phoneNumber: 1,
                  },
                }, // Project the desired fields
              ],
              as: 'patientInfo',
            },
          },
          {
            $match: {
              $or: searchConditions,
            },
          },
        );
      }

      const [patientPayments, countResult] = await Promise.all([
        this.paymentModel.aggregate(aggregatePipeline).exec(),
        this.paymentModel
          .aggregate([...aggregatePipeline.slice(0, 2)])
          .count('count')
          .exec(),
      ]);

      const count = countResult[0]?.count || 0;
      const totalPages = Math.ceil(count / limit);

      const patientIds = patientPayments.map((p) => p._id);

      const patients = await this.patientService.getPatientsByIds(patientIds);

      const result = patientPayments.map((p) => ({
        patient: patients.find((pat) => pat._id.equals(p._id)),
        totalCost: p.totalCost,
      }));

      return { patientPayments: result, count, currentPage: page, totalPages };
    } catch (error) {
      throw error;
    }
  }

  //get all pending payments for a given patient id
  async getPendingPaymentsByPatientId(patientId: string): Promise<any> {
    try {
      const payments = await this.paymentModel
        .find({
          patient: patientId,
          status: { $in: ['PENDING', 'PROCESSING'] },
        })
        .populate('itemToPayFor')
        .sort({ createdAt: -1 });
      //get the total cost of all the payments
      const totalCost = payments.reduce((acc, curr) => acc + curr.totalCost, 0);

      return { payments, totalCost };
    } catch (error) {
      throw error;
    }
  }

  async getMobilePendingPaymentsByPatientId(patientId: string): Promise<any> {
    try {
      const payments = await this.paymentModel
        .find({
          patient: patientId,
          status: 'PENDING',
        })
        .populate('itemToPayFor')
        .sort({ createdAt: -1 });
      //get the total cost of all the payments
      const totalCost = payments.reduce((acc, curr) => acc + curr.totalCost, 0);

      return { payments, totalCost };
    } catch (error) {
      throw error;
    }
  }

  async processPaymentWithGateway(
    paymentIds: string[],
    reference: string,
  ): Promise<any> {
    try {
      const payments = await this.paymentModel.find({
        _id: { $in: paymentIds },
      });
      //verify the payment with paystack api and confirm the amount in the response is not less than the sum of totalCost of the payments
      const response = await this.verifyPayment(
        reference,
        payments.reduce((acc, curr) => acc + curr.totalCost, 0),
      );
      if (!response[0]) {
        throw new UnauthorizedException(response[2]);
      }

      //update the payment status
      const updated = await this.paymentModel.updateMany(
        { _id: { $in: paymentIds } },
        {
          status: PaymentStatusEnum.PAID,
          paymentReference: reference,
          paymentMethod: PaymentMethodEnum.CARD,
        },
        { new: true },
      );
      await this.generateReceipt(reference);
      return {
        status: true,
        message: 'Payment successful',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async processPaymentWithHmo(
    paymentIds: string[],
    hmoProvider: string,
  ): Promise<any> {
    try {
      //get all the payments
      const payments = await this.paymentModel.find({
        _id: { $in: paymentIds },
      });

      //update the payment status
      const updated = await this.paymentModel.updateMany(
        { _id: { $in: paymentIds } },
        { status: PaymentStatusEnum.PROCESSING, hmoProvider },
        { new: true },
      );
      return {
        status: true,
        message: 'Payment successful',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmPaymentWithHmo(
    paymentIds: string[],
    reference: string,
  ): Promise<any> {
    try {
      //if payments are not with status processing, return error
      const payments = await this.paymentModel.find({
        _id: { $in: paymentIds },
      });
      const paymentStatus = payments.every(
        (payment) => payment.status === PaymentStatusEnum.PROCESSING,
      );
      if (!paymentStatus) {
        throw new UnauthorizedException(
          'Payment is not processed for at least one of the payments with HMO',
        );
      }

      const updated = await this.paymentModel.updateMany(
        { _id: { $in: paymentIds } },
        {
          status: PaymentStatusEnum.PAID,
          paymentReference: reference,
          paymentMethod: PaymentMethodEnum.HMO,
        },
        { new: true },
      );
      await this.generateReceipt(reference);
      return {
        status: true,
        message: 'Payment successful',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  //reject payment with hmo and return the status back to pending
  async rejectPaymentWithHmo(paymentIds: string[]): Promise<any> {
    try {
      //if payments are not with status processing, return error
      const payments = await this.paymentModel.find({
        _id: { $in: paymentIds },
      });
      const paymentStatus = payments.every(
        (payment) => payment.status === PaymentStatusEnum.PROCESSING,
      );
      if (!paymentStatus) {
        throw new UnauthorizedException(
          'Payment is not processed for at least one of the payments with HMO',
        );
      }

      const updated = await this.paymentModel.updateMany(
        { _id: { $in: paymentIds } },
        {
          status: PaymentStatusEnum.PENDING,
          paymentMethod: PaymentMethodEnum.HMO,
        },
        { new: true },
      );
      return {
        status: true,
        message: 'Payment successful',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmPaymentWithCash(
    paymentIds: string[],
    reference?: string,
  ): Promise<any> {
    try {
      //update the payment status
      let paymentReference: string;
      if (reference) {
        paymentReference = reference;
      } else {
        paymentReference = `MC-${Date.now()}`;
      }
      const updated = await this.paymentModel.updateMany(
        { _id: { $in: paymentIds } },
        {
          status: PaymentStatusEnum.PAID,
          paymentMethod: PaymentMethodEnum.CASH,
          paymentReference,
        },
        { new: true },
      );
      //generate receipt
      await this.generateReceipt(paymentReference);

      return {
        status: true,
        message: 'Payment successful',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<PaymentDocument> {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      return payment;
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatusEnum,
  ): Promise<PaymentDocument> {
    try {
      const updatedPayment = await this.paymentModel.findByIdAndUpdate(
        paymentId,
        {
          status: status,
        },
        { new: true },
      );
      return updatedPayment;
    } catch (err) {
      throw err;
    }
  }

  //get payment history and filter by paymentMethod
  async getPaymentHistory(
    paymentMethod?: PaymentMethodEnum,
    page = 1,
    limit = 10,
  ) {
    try {
      const query = {
        status: PaymentStatusEnum.PAID,
      };
      if (paymentMethod) {
        query['paymentMethod'] = paymentMethod;
      }
      const payments = await this.paymentModel
        .find(query)
        .populate('patient')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 });
      const count = await this.paymentModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      return { payments, count, currentPage: page, totalPages };
    } catch (error) {
      throw error;
    }
  }

  //calculate total income for paid payments
  async getTotalIncome(): Promise<any> {
    try {
      const payments = await this.paymentModel.find({
        status: PaymentStatusEnum.PAID,
      });
      const totalIncome = payments.reduce(
        (acc, curr) => acc + curr?.totalCost,
        0,
      );
      const numberOfSuccessfulPayments = payments.length;
      const numberOfPendingOrders =
        await this.getTotalNumberOfPendingPayments();
      return { totalIncome, numberOfSuccessfulPayments, numberOfPendingOrders };
    } catch (error) {
      throw error;
    }
  }

  //calculate the total number of pending payments
  async getTotalNumberOfPendingPayments(): Promise<number> {
    try {
      const payments = await this.paymentModel.find({
        status: PaymentStatusEnum.PENDING,
      });
      const numberOfPendingPayments = payments.length;
      return numberOfPendingPayments;
    } catch (error) {
      throw error;
    }
  }

  //we want to get all payments with same payment reference and then populate the itemToPayFor field for purpose of generating invoice/receipt
  //for payment where transactionType is consultation, we want to populate the doctor field in the itemToPayFor field, if no doctor, then we use the transactionType of General Consultation
  //for paymentt where transactionType is LABORATORY, we want to populate the test field in the itemToPayFor field,
  //for payment where transactionType is PHARMACY, we want to populate the product field in the  items array of itemToPayFor field,and then match them with the quantity
  //for payment where transactionType is ADMISSION, we want to populate the ward field in the itemToPayFor field

  async getPaymentDetailsByReference(reference: string): Promise<any> {
    try {
      const payments: any = await this.paymentModel
        .find({ paymentReference: reference })
        .populate('itemToPayFor')
        .populate('patient');

      const paymentBreakdown = await Promise.all(
        payments.map(async (item) => {
          const paymentDetails = {
            date: item.updatedAt,
            transactionType: item.transactionType,
            totalCost: item.totalCost,
          };

          if (item.transactionType === 'CONSULTATION') {
            const payment: any = await this.paymentModel
              .findById(item._id)
              .populate({
                path: 'itemToPayFor',
                populate: {
                  path: 'doctor',
                  model: UserEntity.name,
                },
              });

            paymentDetails['doctor'] = payment.itemToPayFor.doctor
              ? `${payment.itemToPayFor.doctor.firstName} ${payment.itemToPayFor.doctor.lastName}`
              : 'General Consultation';
          } else if (item.transactionType === 'LABORATORY') {
            const payment: any = await this.paymentModel
              .findById(item._id)
              .populate({
                path: 'itemToPayFor',
                populate: {
                  path: 'test',
                  model: TestEntity.name,
                },
              });

            paymentDetails['test'] = payment.itemToPayFor.test?.testName;
          } else if (item.transactionType === 'PHARMACY') {
            const payment: any = await this.paymentModel
              .findById(item._id)
              .populate({
                path: 'itemToPayFor',
                model: 'PharmacyPrescriptionEntity', // Update with the correct model name
                populate: [
                  {
                    path: 'items',
                    // model: 'PrescriptionEntity', // Update with the correct model name
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
                  },
                  {
                    path: 'doctor',
                    model: 'UserEntity', // Update with the correct model name
                  },
                ],
              });

            paymentDetails['items'] = payment.itemToPayFor.items.map(
              (item) => ({
                genericName: item.product?.genericName?.activeIngredient,
                brandName: item.product?.brandName,
                strength: item.product?.strength,
                quantity: item?.quantity,
              }),
            );
          } else if (item.transactionType === 'ADMISSION') {
            const payment: any = await this.paymentModel
              .findById(item._id)
              .populate('itemToPayFor');

            paymentDetails['ward'] = payment.itemToPayFor?.name;
          }
          paymentDetails['patient'] = {
            firstName: payments[0]?.patient?.firstName,
            lastName: payments[0]?.patient?.lastName,
            ID: payments[0]?.patient?.ID,
            id: payments[0]?.patient?._id,
            email: payments[0]?.patient?.email,
          };
          return paymentDetails;
        }),
      );

      return paymentBreakdown;
    } catch (error) {
      throw error;
    }
  }

  async generateReceipt(reference: string): Promise<any> {
    try {
      const paymentDetails = await this.getPaymentDetailsByReference(reference);
      let html = '<html><body>';

      paymentDetails.forEach((payment) => {
        html += '<div>';
        html += `<p>Date: ${payment.date}</p>`;
        html += `<p>Transaction Type: ${payment.transactionType}</p>`;
        html += `<p>Total Cost: ${payment.totalCost}</p>`;

        if (payment.doctor) {
          html += `<p>Doctor: ${payment.doctor}</p>`;
        }

        if (payment.test) {
          html += `<p>Test: ${payment.test}</p>`;
        }

        if (payment.items) {
          html += '<ul>';
          payment.items.forEach((item) => {
            html += '<li>';
            html += `<p>Generic Name: ${item.genericName}</p>`;
            html += `<p>Brand Name: ${item.brandName}</p>`;
            html += `<p>Strength: ${item.strength}</p>`;
            html += `<p>Quantity: ${item.quantity}</p>`;
            html += '</li>';
          });
          html += '</ul>';
        }

        if (payment.ward) {
          html += `<p>Ward: ${payment.ward}</p>`;
        }

        html += '</div>';
      });

      html += '</body></html>';

      const pdfBuffer = await this.generatePdf(html);
      await this.mailService.sendPdf(
        paymentDetails?.patient?.email,
        'Receipt',
        pdfBuffer,
      );
      const uploadPdf = await this.cloudinaryService.uploadPdf(pdfBuffer);
      //now update all the payments with the paymentReference to be the reference with the receiptUrl
      await this.paymentModel.updateMany(
        {
          paymentReference: reference,
        },
        {
          receiptUrl: uploadPdf.secure_url,
        },
        { new: true },
      );
      return {
        status: true,
        message: 'Receipt generated successfully',
        data: uploadPdf.secure_url,
      };
    } catch (error) {
      throw error;
    }
  }

  private async generatePdf(html: string) {
    return new Promise((resolve, reject) => {
      const pdfDoc = new PDFKit();
      const chunks = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));

      pdfDoc.on('error', (err) => reject(err));

      pdfDoc.font('Helvetica').fontSize(12);
      const text = htmlToText.fromString(html, {
        wordwrap: 130,
      });
      pdfDoc.text(text);
      pdfDoc.end();
    });
  }

  async getPaymentMethodBreakdown(): Promise<any> {
    try {
      const paymentMethodBreakdown = await this.paymentModel.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            totalCost: { $sum: '$totalCost' },
            count: { $sum: 1 },
          },
        },
      ]);
      return paymentMethodBreakdown;
    } catch (error) {
      throw error;
    }
  }

  // async paymentReportBreakdown(data?: FilterPatientDto) {
  //   try {
  //     const { startDate, endDate } = data;
  //     const query = {
  //       status: PaymentStatusEnum.PAID,
  //     };
  //     let percentageIncreaseOrDecrease;
  //     let percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments
  //     let totalTransactionCost;

  //     if (startDate) {
  //       let end = endDate
  //         ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
  //         : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
  //       let start = new Date(startDate).toISOString();
  //       // query['updatedAt'] = { $gte: start, $lte: end };

  //     const payments = await this.paymentModel
  //       .find(query)
  //       .sort({ updatedAt: -1 });
  //     const totalCost = payments.reduce(
  //       (acc, curr) => acc + curr.totalCost,
  //       0,
  //     );
  //     const numberOfSuccessfulPayments = payments.length;
  //     //we want to get transaction percentage increase or decrease since yesterday by default or since the startDate if provided
  //     const yesterday = new Date(end);
  //     yesterday.setDate(yesterday.getDate() - 1);
  //     const yesterdayPayments = await this.paymentModel
  //       .find({
  //         status: PaymentStatusEnum.PAID,
  //         updatedAt: { $gte: start, $lte: end },
  //       })
  //       .sort({ updatedAt: -1 });

  //     const yesterdayTotalCost = yesterdayPayments.reduce(
  //       (acc, curr) => acc + curr.totalCost,
  //       0,
  //     );
  //     const yesterdayNumberOfSuccessfulPayments = yesterdayPayments.length;
  //     percentageIncreaseOrDecrease =
  //       ((totalCost - yesterdayTotalCost) / yesterdayTotalCost) * 100;

  //     percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments =
  //       ((numberOfSuccessfulPayments - yesterdayNumberOfSuccessfulPayments) /
  //         yesterdayNumberOfSuccessfulPayments) *
  //       100;

  //     totalTransactionCost = yesterdayTotalCost;

  //     }

  //     //if no startDate, we want to get all the above data and then get the percentage increase or decrease since yesterday
  //     if (!startDate) {
  //       const payments = await this.paymentModel
  //         .find(query)
  //         .sort({ updatedAt: -1 });
  //       const totalCost = payments.reduce(
  //         (acc, curr) => acc + curr.totalCost,
  //         0,
  //       );
  //       const numberOfSuccessfulPayments = payments.length;
  //       //we want to get transaction percentage increase or decrease since yesterday by default or since the startDate if provided
  //       const yesterday = new Date();
  //       yesterday.setDate(yesterday.getDate() - 1);
  //       const yesterdayPayments = await this.paymentModel
  //         .find({
  //           status: PaymentStatusEnum.PAID,
  //           updatedAt: { $gte: yesterday },
  //         })
  //         .sort({ updatedAt: -1 });

  //       const yesterdayTotalCost = yesterdayPayments.reduce(
  //         (acc, curr) => acc + curr.totalCost,
  //         0,
  //       );
  //       const yesterdayNumberOfSuccessfulPayments = yesterdayPayments.length;
  //       percentageIncreaseOrDecrease =
  //         ((totalCost - yesterdayTotalCost) / yesterdayTotalCost) * 100;

  //       percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments =

  //         ((numberOfSuccessfulPayments - yesterdayNumberOfSuccessfulPayments) /

  //           yesterdayNumberOfSuccessfulPayments) *
  //         100;

  //       totalTransactionCost = totalCost;

  //     }
  //     return {
  //       totalTransactionCost,
  //       percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments,
  //       percentageIncreaseOrDecrease
  //     }
  //   } catch (error) {
  //     throw error;
  //   }

  //       //
  // }

  async paymentReportBreakdown(data?: FilterPatientDto) {
    try {
      const { startDate, endDate } = data;
      const query = {
        status: PaymentStatusEnum.PAID,
      };

      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();

        return await this.processPaymentData(query, start, end);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return await this.processPaymentData(query, yesterday);
      }
    } catch (error) {
      throw error;
    }
  }

  private async processPaymentData(query: any, start: any, end?: any) {
    let cashNumber = 0;
    let cardNumber = 0;
    let hmoNumber = 0;
    let consultationNumber = 0;
    let laboratoryNumber = 0;
    let pharmacyNumber = 0;
    let admissionNumber = 0;
    const payments = await this.paymentModel
      .find(query)
      .sort({ updatedAt: -1 });

    const totalCost = payments.reduce((acc, curr) => acc + curr?.totalCost, 0);
    const numberOfSuccessfulPayments = payments.length;

    const paymentQuery: any = {
      status: PaymentStatusEnum.PAID,
      // updatedAt: { $gte: start },
    };

    if (end) {
      paymentQuery.updatedAt.$lte = end;
      paymentQuery.updatedAt.$gte = start;
    }

    const yesterdayPayments = await this.paymentModel
      .find(paymentQuery)
      .sort({ updatedAt: -1 });

    if (end) {
      cashNumber = await this.paymentModel.countDocuments({
        ...paymentQuery,
        paymentMethod: PaymentMethodEnum.CASH,
      });
      cardNumber = await this.paymentModel.countDocuments({
        ...paymentQuery,
        paymentMethod: PaymentMethodEnum.CARD,
      });
      hmoNumber = await this.paymentModel.countDocuments({
        ...paymentQuery,
        paymentMethod: PaymentMethodEnum.HMO,
      });
      payments.forEach((payment) => {
        if (payment.transactionType === 'CONSULTATION') {
          consultationNumber += 1;
        } else if (payment.transactionType === 'LABORATORY') {
          laboratoryNumber += 1;
        } else if (payment.transactionType === 'PHARMACY') {
          pharmacyNumber += 1;
        } else if (payment.transactionType === 'ADMISSION') {
          console.log('admission')
          admissionNumber += 1;
        }
      });
    } else {
      cashNumber = await this.paymentModel.countDocuments({
        status: PaymentStatusEnum.PAID,
        paymentMethod: PaymentMethodEnum.CASH,
      });
      cardNumber = await this.paymentModel.countDocuments({
        status: PaymentStatusEnum.PAID,
        paymentMethod: PaymentMethodEnum.CARD,
      });
      hmoNumber = await this.paymentModel.countDocuments({
        status: PaymentStatusEnum.PAID,
        paymentMethod: PaymentMethodEnum.HMO,
      });
      yesterdayPayments.forEach((payment) => {
        if (payment.transactionType === 'CONSULTATION') {
          consultationNumber += 1;
        } else if (payment.transactionType === 'LABORATORY') {
          laboratoryNumber += 1;
        } else if (payment.transactionType === 'PHARMACY') {
          pharmacyNumber += 1;
        } else if (payment.transactionType === 'ADMISSION') {
          admissionNumber += 1;
        }
      });
    }

    let yesterdayPayments2 = await this.paymentModel
    .find({
      status: PaymentStatusEnum.PAID,
      updatedAt: { $gte: start },
    })

    const yesterdayTotalCost = yesterdayPayments2.reduce(
      (acc, curr) => acc + curr?.totalCost,
      0,
    );
    const yesterdayNumberOfSuccessfulPayments = yesterdayPayments2.length;

    const percentageIncreaseOrDecrease =
      ((totalCost - yesterdayTotalCost) / yesterdayTotalCost) * 100;

    const percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments =
      ((numberOfSuccessfulPayments - yesterdayNumberOfSuccessfulPayments) /
        yesterdayNumberOfSuccessfulPayments) *
      100;

    const totalTransactionCost = end ? yesterdayTotalCost : totalCost;

    return {
      totalTransactionCost: totalTransactionCost || 0,
      percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments:
        percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments || 0,
      percentageIncreaseOrDecrease: percentageIncreaseOrDecrease || 0,
      cashNumber: cashNumber || 0,
      cardNumber: cardNumber || 0,
      hmoNumber: hmoNumber || 0,
      consultationNumber: consultationNumber || 0,
      laboratoryNumber: laboratoryNumber || 0,
      pharmacyNumber: pharmacyNumber || 0,
      admissionNumber: admissionNumber || 0,
    };
  }

  async getCalendarFilter(data?: CalendarFilterEnum): Promise<any> {
    try {
      const query = {
        status: PaymentStatusEnum.PAID,
      };
      const allPayments = await this.paymentModel.find(query);

      if (data === CalendarFilterEnum.WEEKLY) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        return this.generateCalendarFilterData(allPayments, startDate, 'day');
      }
      if (data === CalendarFilterEnum.MONTHLY || !data) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);
        return this.generateCalendarFilterData(allPayments, startDate, 'month');
      }

      if (data === CalendarFilterEnum.YEARLY) {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 10);
        return this.generateCalendarFilterData(allPayments, startDate, 'year');
      }
    } catch (err) {
      throw err;
    }
  }

  generateCalendarFilterData(
    payments: PaymentEntity[],
    startDate: Date,
    interval: 'day' | 'month' | 'year',
  ): any[] {
    const currentDate = new Date();
    const currentDateISOString = currentDate.toISOString();

    const intervals = interval
      ? this.generateIntervals(startDate, interval)
      : [startDate];
    console.log(intervals, 'intervals');

    const grouped = intervals.map((intervalStartDate) => {
      const intervalEndDate = new Date(intervalStartDate);
      intervalEndDate.setHours(23, 59, 59, 999);
      let transactionsPerInterval: any;
      if (interval === 'day') {
        transactionsPerInterval = payments.filter((payment) => {
          const paymentDate = new Date(payment.updatedAt);

          return (
            paymentDate >= intervalStartDate && paymentDate <= intervalEndDate
          );
        });
      }
      if (interval === 'month') {
        //we want to filter by month and year
        transactionsPerInterval = payments.filter((payment) => {
          const paymentDate = new Date(payment.updatedAt);

          return (
            paymentDate.getMonth() === intervalStartDate.getMonth() &&
            paymentDate.getFullYear() === intervalStartDate.getFullYear()
          );
        });
      }
      if (interval === 'year') {
        //we want to filter by year
        transactionsPerInterval = payments.filter((payment) => {
          const paymentDate = new Date(payment.updatedAt);

          return paymentDate.getFullYear() === intervalStartDate.getFullYear();
        });
      }
      const totalCost = transactionsPerInterval.reduce((acc, payment) => {
        return acc + payment.totalCost;
      }, 0);
      if (interval === 'month') {
        return {
          month: moment(intervalStartDate).format('MMMM'), // Format the month using moment
          totalCost,
        };
      }
      if (interval === 'day') {
        return {
          date: intervalStartDate.toISOString().substring(0, 10),
          dayOfWeek: moment(intervalStartDate).format('dddd'), // Use moment to format the day of the week
          totalCost,
        };
      }
      if (interval === 'year') {
        return {
          year: intervalStartDate.toISOString().substring(0, 4),
          totalCost,
        };
      }
    });
    return grouped.reverse();
  }

  // generateIntervals(startDate: Date, interval: 'day' | 'month' | 'year'): Date[] {
  //   const intervals = [];
  //   const currentDate = new Date();

  //   while (startDate <= currentDate) {
  //     intervals.push(new Date(startDate));
  //     if (interval === 'day') {
  //       startDate.setDate(startDate.getDate() + 1);
  //     } else if (interval === 'month') {

  //       startDate = moment(startDate).endOf('month').toDate();
  //       startDate.setDate(startDate.getDate() + 1);

  //     } else if (interval === 'year') {
  //       startDate.setFullYear(startDate.getFullYear() + 1);
  //     }
  //   }

  //   return intervals;
  // }

  generateIntervals(
    startDate: Date,
    interval: 'day' | 'month' | 'year',
  ): Date[] {
    const intervals = [];
    const currentDate = new Date();

    while (startDate <= currentDate) {
      if (interval === 'day') {
        intervals.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      } else if (interval === 'month') {
        const lastDayOfMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
        );
        intervals.push(lastDayOfMonth);
        startDate.setMonth(startDate.getMonth() + 1);
        startDate.setDate(1); // Set to the first day of the next month
      } else if (interval === 'year') {
        intervals.push(new Date(startDate));
        startDate.setFullYear(startDate.getFullYear() + 1);
      }
    }

    return intervals;
  }

  // generateIntervals(startDate: Date, interval: 'day' | 'month' | 'year'): Date[] {
  //   const intervals = [];
  //   const currentDate = new Date();

  //   while (startDate <= currentDate) {
  //     intervals.push(new Date(startDate));
  //     if (interval === 'day') {
  //       startDate.setDate(startDate.getDate() + 1);
  //     } else if (interval === 'month') {
  //       startDate.setMonth(startDate.getMonth() + 1);
  //       // Set the day to the last day of the month
  //       const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  //       startDate.setDate(lastDayOfMonth.getDate());

  //       console.log(startDate, 'startDate');
  //     } else if (interval === 'year') {
  //       startDate.setFullYear(startDate.getFullYear() + 1);
  //     }
  //   }

  //   return intervals;
  // }

  //   return intervals;
  // }
}

/*
const options = {
      method: 'POST',
      uri: 'https://api.flutterwave.com/v3/payments',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.FLUTTERWAVE_SECRET_KEY
      },
      body: paymentData,
      json: true // Automatically stringifies the body to JSON
    };
    
    //use httpService to make the request using the options variable above
    const paymentResponse = await this.httpService.post(options.uri, options.body, { headers: options.headers }).toPromise();
    console.log(paymentResponse.data, 'paymentResponse')
    return {
      paymentUrl: paymentResponse.data?.data?.link,
      flwRef: paymentResponse.data?.data?.flwRef,
    };
*/

// import { Injectable } from '@nestjs/common';
// import { Config } from './interfaces/config';
// import { RaveCardPaymentDTO } from './dtos/rave-payload.dto';

// import * as forge from 'node-forge';
// import * as md5 from 'md5';
// import * as request from 'request-promise-native';

// import { RaveCardPayload } from './models/rave-payload.model';
// import { RavePaymentOptions } from './interfaces/payment-options';

// @Injectable()
// export class RavePaymentService {
//   constructor(private readonly config: Config) {}

//   async makePayment(cardDetails: RaveCardPaymentDTO): Promise<any> {
//     let rave = new Rave(this.config.PBFPubKey, this.config.secretKey);
//     const payload: RaveCardPayload = {
//       currency: this.config.currency,
//       country: this.config.country,
//       txRef: `MC-${Date.now()}`,
//       redirect_url: `${this.config.hostURL}/rave/verify`,
//       // redirect_url: 'http://localhost:3000/rave/verify',
//       ...cardDetails,
//     };

//     return rave.initiatePayment(payload);
//     // .then(res => console.log(res))
//     // .catch(err => console.log(err));
//   }
// }

// export class Rave {
//   constructor(
//     private readonly publicKey: string,
//     private readonly secretKey: string,
//   ) {}

//   private encryptCardDetails(payload: RaveCardPayload) {
//     let cardDetails = JSON.stringify(payload);
//     let cipher = forge.cipher.createCipher(
//       '3DES-ECB',
//       forge.util.createBuffer(this.getKey()),
//     );
//     cipher.start({ iv: '' });
//     cipher.update(forge.util.createBuffer(cardDetails, 'utf8'));
//     cipher.finish();

//     let encrypted = cipher.output;
//     return forge.util.encode64(encrypted.getBytes());
//   }

//   private getKey(): string {
//     let secKey = this.secretKey;
//     let keymd5 = md5(secKey);
//     let keymd5last12 = keymd5.substr(-12);

//     let secKeyAdjusted = secKey.replace('FLWSECK-', '');
//     let secKeyAdjustedFirst12 = secKeyAdjusted.substr(0, 12);

//     return secKeyAdjustedFirst12 + keymd5last12;
//   }

//   public initiatePayment(payload: RaveCardPayload): Promise<any> {
//     return new Promise((resolve, reject) => {
//       let encryptedCardDetails = this.encryptCardDetails(payload);
//       let paymentOptions: RavePaymentOptions = {
//         url:
//           'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/charge',
//         // url: 'https://api.ravepay.co/flwv3-pug/getpaidx/api/charge',
//         // url: 'https://ravesandbox.flutterwave.com/pay/2oqbbld980mr',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: {
//           PBFPubKey: `${this.publicKey}`,
//           alg: '3DES-24',
//           client: `${encryptedCardDetails}`,
//         },
//         json: true,
//       };

//       request(paymentOptions)
//         .then(result => resolve(result))
//         .catch(err => reject(err));
//     });
//   }
// }

// // Get the payment amount and other details based on the unique code.

//   async initiatePayment(paymentDto: PaymentDto): Promise<any> {
//     const { paymentMethod, amount, txRef, redirectUrl, currency, customerId, customerEmail, customerName } = paymentDto;
//     // // Get the payment amount and other details based on the unique code.

//     // // Encrypt the card details
//     // // const encryptedCardDetails = this.cardEncryptionService.encrypt(
//     // //   paymentDto.cardDetails,
//     // // );

//     const paymentData: any = {
//       amount,
//       currency,
//       payment_method: paymentMethod,
//       tx_ref: txRef,
//       redirect_url: redirectUrl,
//       // customer: {
//       //   name: paymentDto.customerName,
//       //   email: paymentDto.customerEmail,
//       //   phone_number: paymentDto.customerPhoneNumber,
//       // },
//       // meta: {
//       //   unique_code: uniqueCode,
//       //   encrypted_card_details: encryptedCardDetails,
//       // },
//       // ...paymentDto.cardDetails,
//       meta: {
//         consumer_id: customerId,
//         consumer_mac: "92a3-912ba-1192a",
//       },
//       customer: {
//         email: customerEmail,
//         phone_number: "08102909304",
//         name: customerName,
//       },
//       customizations: {
//         title: "HMS",
//         logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
//     }
//     };

//     // Make the payment request
//     //make post request to https://api.flutterwave.com/v3/payments
//     //use httpService

//     const options = {
//       method: 'POST',
//       uri: 'https://api.flutterwave.com/v3/payments',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + process.env.FLUTTERWAVE_SECRET_KEY
//       },
//       body: paymentData,
//       json: true // Automatically stringifies the body to JSON
//     };

//     const requestData = JSON.stringify(paymentData);
//     //use httpService to make the request
//     const paymentResponse = await this.httpService.post('https://api.flutterwave.com/v3/payments', requestData, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + process.env.FLUTTERWAVE_SECRET_KEY
//       }
//     }).toPromise();
//     console.log(paymentResponse.data, 'paymentResponse')
//     return {
//       paymentUrl: paymentResponse.data?.data?.link,
//       flwRef: paymentResponse.data?.data?.flwRef,
//     };

// const reqBody = {
//   "tx_ref": "MC-158656-1",
//   "amount": "100",
//   "currency": "NGN",
//   "redirect_url": "https://webhook.site/7b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b",
//   "payment_options": "card",
//   "meta": {
//     "consumer_id": 23,
//     "consumer_mac": "92a3-912ba-1192a"
//   },
//   "customer": {
//     "email": "",
//     "phone_number": "08102909304",
//     "name": "yemi desola"
//   },
//   "customizations": {
//     "title": "My store",
//     "description": "Payment for items in cart",
//     "logo": "https://assets.piedpiper.com/logo.png"
//   }
// }

// /*
// json: {
//             tx_ref: "hooli-tx-1920bbtytty",
//             amount: "100",
//             currency: "NGN",
//             redirect_url: 'localhost:5000/api/v1/payment/complete',
//             meta: {
//                 consumer_id: 23,
//                 consumer_mac: "92a3-912ba-1192a"
//             },
//             customer: {
//                 email: "user@gmail.com",
//                 phonenumber: "08099894528",
//                 name: "Yemi Desola"
//             },
//             customizations: {
//                 title: "Pied Piper Payments",
//                 logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
//             }
//         }
// */
//     const response: any = await this.httpService.post("https://api.flutterwave.com/v3/payments", {
//         headers: {
//             Authorization: 'Bearer FLWSECK_TEST-a8e42e766b7157c8c98c1cdf949cf65c-X'
//         },
//         body: reqBody

//     }).toPromise();
//     console.log(response.data, 'paymentResponse')

// const paymentResponse: any =
//   await this.flutterwave.Card.charge(paymentData);
//   console.log(paymentResponse, 'paymentResponse')
// return {
//   paymentUrl: paymentResponse.data?.link,
//   flwRef: paymentResponse.data?.flwRef,
// };

/*
async initiatePayment(paymentDto: PaymentDto): Promise<any> {
    const {
      paymentMethod,
      amount,
      txRef,
      redirectUrl,
      currency,
      customerId,
      customerEmail,
      customerName,
      customerPhoneNumber,
    } = paymentDto;
    // const paymentData = {
    //   tx_ref: txRef,
    //   amount: amount,
    //   currency: currency,
    //   payment_options: paymentMethod,
    //   redirect_url: redirectUrl,
    //   customer: {
    //     email: customerEmail,
    //     phonenumber: customerPhoneNumber,
    //     name: customerName,
    //   },
    //   customizations: {
    //     title: 'HMS',
    //     logo: 'http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png',
    //   },
    //   meta: {
    //     consumer_id: customerId,
    //     consumer_mac: '92a3-912ba-1192a',
    //   },
    // };
    // console.log(process.env.FLUTTERWAVE_API_KEY, 'process.env.FLUTTERWAVE_API_KEY')
    // console.log(this.flutterwave, 'this.flutterwave')
    // const paymentResponse = await this.flutterwave.Payment.initialize(
    //   paymentData,
    // );
    // console.log(paymentResponse, 'paymentResponse')

    // return {
    //   paymentUrl: paymentResponse.data?.data?.link,
    //   flwRef: paymentResponse.data?.data?.flwRef,
    // };

    const paymentData = {
      tx_ref: txRef,
      amount: amount,
      currency: currency,
      payment_options: paymentMethod,
      redirect_url: redirectUrl,
      customer: {
        customer_id: customerId,
        email: customerEmail,
        phonenumber: customerPhoneNumber,
        name: customerName,
      },
      customizations: {
        title: 'HMS',
        description: 'Payment for items in cart',
        logo: 'http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png',
      },
      meta: {
        consumer_id: customerId,
        consumer_mac: '92a3-912ba-1192a',
      },
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    };

    const stringifiedData = qs.stringify(paymentData);
    const hashedPayload = crypto
      .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_KEY)
      .update(stringifiedData)
      .digest('hex');

    const paymentResponse = await axios.post(
      process.env.FLUTTERWAVE_PAYMENT_URL,
      paymentData,
      config,
    );
    console.log(paymentResponse, 'paymentResponse');
    return {
      paymentUrl: paymentResponse.data?.data?.link,
      flwRef: paymentResponse.data?.data?.flwRef,
    };
  }

  //validate webhook
  async validateWebhookEvent(verifHash: string, body: any): Promise<boolean> {
    const hash = this.flutterwave.Utils.generateHash(body);
    return hash === verifHash;
  }

  //handle webhook event
  async handleWebhookEvent(body: PaymentWebhookDto, req?: any): Promise<any> {
    const { data, event } = body;
    const { tx_ref, amount } = data;
    console.log(data, 'data');
    //handle event
    //if event is successful, call the getTransaction in accounting service, to update the transaction status, tx_ref is the id of the transaction, accountingInput will be the data from the webhook where paymentMethod is CARD and amountPaid is the amount paid
    switch (event) {
      case 'charge.success':
        const AccountingInput = {
          method: PaymentMethodEnum.CARD,
          amountPaid: amount,
        };
        await this.accountingService.getTransaction(
          tx_ref,
          AccountingInput,
          req,
        );
        break;
      case 'charge.failed':
        break;
      case 'charge.refund':
        break;
      case 'charge.dispute':
        break;
      case 'charge.chargeback':
        break;
      case 'charge.reversed':
        break;
      case 'charge.partial_refund':
        break;
      case 'charge.partial_refund':
        break;
      default:
        break;
    }
  }

  //initialize payment using paystack

 
  async verifyPayment(reference: string): Promise<any> {
    const verifyResponse = await this.flutterwave.verifyTransaction(reference);
    return verifyResponse;
  }

  async cancelPayment(reference: string): Promise<any> {
    const cancelResponse = await this.flutterwave.cancelTransaction(reference);
    return cancelResponse;
  }
  */
