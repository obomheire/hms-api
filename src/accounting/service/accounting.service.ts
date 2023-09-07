import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  UseFilters,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InvestigationService } from 'src/patients/service/investigation.service';
import { PrescriptionService } from 'src/patients/service/precription.service';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import PDFKit from 'pdfkit';
import { createReadStream } from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { Request } from 'express';
import { AccountInput, PendingDto } from '../dto/account.dto';
import { MailsService } from 'src/providers/mails/mails.service';
// import pdfmake from 'pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// import * as puppeteer from 'puppeteer';
import { InjectModel } from '@nestjs/mongoose';
import { DisputeDocument, DisputeEntity } from '../schema/dispute.schema';
import { Model } from 'mongoose';
import * as pdf from 'html-pdf';
import htmlToPdf from 'html-pdf';

import Handlebars from 'handlebars';
import {
  AccountFilterDto,
  ApproveOrDeclineDisputeDto,
  CreateDisputeDto,
} from '../dto/dispute.dto';
import { DisputeStatus } from '../enum/dispute.enum';
import { RequisitionService } from 'src/pharmacy/service/requisition.service';
import { ItemRequisitionService } from 'src/inventory/service/itemRequisition.service';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import {
  approveRequisitionDto,
  FilterBodyDto,
  itemRequisitionDto,
} from 'src/inventory/dto/itemRequisition.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  disputeAccountRequsitionEnum,
  headApprovalEnum,
} from 'src/utils/enums/requisitionStatus';
import { RequisitionDisputeEntity } from 'src/utils/schemas/dispute-requisition.schema';
import moment from 'moment';
import { CalendarFilterEnum } from 'src/patients/enum/visit-status.enum';
import SmsService from 'src/sms/service/sms.service';
import { generatePdf } from 'src/utils/functions/generatePdf';
import { HttpExceptionFilter } from 'src/errors/error';
import pdfmake from 'pdfmake';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import * as htmlToText from 'html-to-text';

// import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import htmlToPdfmake from 'html-to-pdfmake';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);
  constructor(
    @InjectModel(DisputeEntity.name)
    private readonly disputeModel: Model<DisputeDocument>,
    private readonly prescriptionService: PrescriptionService,
    private readonly investigationService: InvestigationService,
    private readonly mailService: MailsService,
    private readonly pharmacyRequisitionService: RequisitionService,
    private readonly inventoryRequisitionService: ItemRequisitionService,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(RequisitionDisputeEntity.name)
    private readonly requisitionDisputeModel: Model<RequisitionDisputeEntity>,
    private readonly smsService: SmsService,
  ) {}

  async getAllTransactionsPending(input?: FilterPatientDto) {
    const { department, page, limit } = input;
    console.log('input', input);
    const prescriptions =
      await this.prescriptionService.getPrescriptionsForAccount(input);
    const investigations =
      await this.investigationService.getPendingInvestigationsForAccount(input);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    if (department === 'pharmacy') {
      results['count'] = prescriptions.length;
      results['totalPages'] = Math.ceil(prescriptions.length / limit);
      results['currentPage'] = page;
      results['data'] = prescriptions.slice(startIndex, endIndex);
      return results;
    }
    if (department === 'laboratory') {
      results['count'] = investigations.length;
      results['totalPages'] = Math.ceil(investigations.length / limit);
      results['currentPage'] = page;
      results['data'] = investigations.slice(startIndex, endIndex);
      return results;
    }
    const allTransactions = [...prescriptions, ...investigations];
    //sort the array by date
    allTransactions.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    //filter the array by status
    // const startIndex = (page - 1) * limit;
    //   const endIndex = page * limit;
    //   const results = {};
    results['count'] = allTransactions.length;
    results['totalPages'] = Math.ceil(allTransactions.length / limit);
    results['currentPage'] = page;
    results['data'] = allTransactions.slice(startIndex, endIndex);
    //return the length of the array
    return results;
  }

  //get all transactions that have been paid
  async getAllTransactionsPaid(data?: FilterPatientDto) {
    const prescriptions = await this.prescriptionService.getPrescriptionsPaid(
      data,
    );
    const investigations =
      await this.investigationService.getInvestigationsPaid(data);
    const allTransactions = [...prescriptions, ...investigations];
    //filter the array by status
    const paidTransactions = allTransactions.filter(
      (transaction) => transaction.status === 'PAID',
    );
    //return the length of the array
    const count = paidTransactions.length;
    return { transactions: paidTransactions, count };
  }

  //get a single transaction and mark it as paid
  // async getTransaction(id: string, input: AccountInput, req: any) {
  //   try {
  //     //check if the id is a prescription id
  //     console.log('gets here')
  //     const { method, amountPaid } = input;
  //     let data = {}
  //     const prescription = await this.prescriptionService.getPrescription(id);
  //     console.log('prescription', prescription)

  //     if (prescription) {
  //       data = prescription;
  //     }
  //     //check if the id is an investigation id
  //     const investigation = await this.investigationService.getInvestigation(
  //       id,
  //     );

  //get a single transaction
  //transaction can be a prescription or an investigation
  @UseFilters(HttpExceptionFilter)
  async getTransaction(id: string, input: AccountInput, req: any) {
    try {
      this.logger.log('gets here');
      console.log('gets here');
      //check if the id is a prescription id
      const { method, amountPaid } = input;
      // let data: any = {};
      console.log('gets here 2');
      const { isPharmacy, response } =
        await this.prescriptionService.getPrescriptionAccount(id);

      const cost = +response.totalCost;
      if (method === PaymentMethodEnum.CASH) {
        if (amountPaid < cost) {
          throw new Error('Insufficient amount paid');
        }
        //update the transaction status to PAID
        console.log(req.user.toString(), 'user');
        await this.prescriptionService.markAsPaid(id, req, method);

        // if (investigation) {
        //   await this.investigationService.markInvestigationAsPaid(id, req);
        // }
        const fullName = `${response.patient.firstName} ${response.patient.lastName}`;

        let html = ``;
        console.log('gsganajnhvbs');
        if (isPharmacy) {
          html = `
          <div>
        <h1>${fullName}</h1>
        <p>Unique Code: ${response.uniqueCode}</p>
        <p>Amount Paid: ${amountPaid}</p>
        <p>Change: ${amountPaid - cost}</p>
        <p>Transaction Date: ${new Date()}</p>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${response.items
              .map(
                (item) => `
              <tr>
                <td> ${item.product.drugName} ${item.product.brandName}</td>
                <td>${item.quantity}</td>
                <td>${item.totalCost}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        <p>HECKERCARE</p>
      </div>
    `;
        }
        if (!isPharmacy) {
          html = `
        <div>
        <h1>${fullName}</h1>
        <p>Unique Code: ${response.uniqueCode}</p>
        <p>Amount Paid: ${amountPaid}</p>
        <p>Change: ${amountPaid - cost}</p>
        <p>Transaction Date: ${new Date()}</p>
        <table>
          <thead>
            <tr>
              <th>Investigation</th>
              <th>Quantity</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>

              <tr>
                <td> ${response.test.testName}</td>
                <td>1</td>
                <td>${response.totalCost}</td>
              </tr>

          </tbody>
        </table>
        <p>HECKERCARE</p>
      </div>
    `;
        }

        //             const content = `
        //   <div>
        //     <h1>${fullName}</h1>
        //     <p>Unique Code: ${data.uniqueCode}</p>
        //     <p>Amount Paid: ${amountPaid}</p>
        //     <p>Change: ${amountPaid - cost}</p>
        //     <p>Transaction Date: ${new Date()}</p>
        //     <table>
        //       <thead>
        //         <tr>
        //           <th>Product</th>
        //           <th>Quantity</th>
        //           <th>Total Cost</th>
        //         </tr>
        //       </thead>
        //       <tbody>
        //         ${data.items.map(item => `
        //           <tr>
        //             <td>${item.product}</td>
        //             <td>${item.quantity}</td>
        //             <td>${item.totalCost}</td>
        //           </tr>
        //         `).join('')}
        //       </tbody>
        //     </table>
        //     <p>Facility: ${data.facility}</p>
        //   </div>
        // `;

        const pdf = await this.generatePdf(html);
        //send the pdf to the patient email
        await this.mailService.sendPdf(
          response?.patient?.email,
          'Receipt',
          pdf,
        );
        const uploadPdf = await this.cloudinaryService.uploadPdf(pdf);
        response.receiptUrl = uploadPdf.secure_url;
        console.log(uploadPdf.secure_url);
        if (isPharmacy) {
          await this.prescriptionService.updatePrescriptionReceiptUrl(
            id,
            uploadPdf.secure_url,
          );
        }
        if (!isPharmacy) {
          await this.investigationService.updateInvestigationReceiptUrl(
            id,
            uploadPdf.secure_url,
          );
        }
        // await this.smsService.sendSmsUsingAfricasTalking(
        //   '+2347065074554',
        //   `Your transaction was successful. Your receipt is available at ${uploadPdf.secure_url}`,
        // );

        return uploadPdf.secure_url;
      }
      // return 'success';
    } catch (error) {
      this.logger.error(error.message, error.stack);
      if (error.message === 'Insufficient amount paid') {
        throw new BadRequestException(error.message);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  //generate receipt

  // async generatePdf(content: any): Promise<Buffer> {
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();

  //   await page.setContent(content);
  //   const pdf = await page.pdf({ format: 'A4' });
  //   await browser.close();
  //   return pdf;
  // }

  // async generatePdf(content: string): Promise<Buffer> {
  //   return new Promise((resolve, reject) => {
  //     const options: pdf.CreateOptions = {
  //       format: 'A4',
  //     };

  //     pdf.create(content, options).toBuffer((error, buffer) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(buffer);
  //       }
  //     });
  //   });
  // }

  // async  generatePdf(content: string): Promise<Buffer> {
  //   return new Promise((resolve, reject) => {
  //     const doc = new PDFKit({
  //       size: 'A4'
  //     });
  //     const buffers: any[] = [];

  //     doc.on('data', buffers.push.bind(buffers));
  //     doc.on('end', () => {
  //       const pdfData = Buffer.concat(buffers);
  //       resolve(pdfData);
  //     });
  //     doc.on('error', (error) => reject(error));

  //     doc.text(content);
  //     doc.end();
  //   });
  // }

  // async generatePdf(content: string): Promise<Buffer> {
  //   return new Promise((resolve, reject) => {
  //     const html = `
  //       <html>
  //         <head>
  //           <style>
  //             h1 { font-size: 20px; }
  //             p { font-size: 16px; }
  //             table { width: 100%; border-collapse: collapse; }
  //             th, td { border: 1px solid black; padding: 5px; }
  //           </style>
  //         </head>
  //         <body>
  //           <h1>My Receipt</h1>
  //           ${content}
  //         </body>
  //       </html>
  //     `;

  //     const options = { format: 'Letter' };

  //     pdf.create(html).toBuffer((err, buffer) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(buffer);
  //       }
  //     });
  //   });
  // }

  async generatePdf(html: string) {
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

  // async generatePdf(html: string): Promise<Buffer> {
  //   const documentDefinition = { content: html };
  //   const options = {};
  //   const pdfDocGenerator = pdfMake.createPdf(documentDefinition, options);

  //   return new Promise<Buffer>((resolve, reject) => {
  //     pdfDocGenerator.getBuffer((buffer: Buffer) => {
  //       resolve(buffer);
  //     }, (error: any) => {
  //       reject(error);
  //     });
  //   });
  // }

  // async generatePdf(content: string): Promise<Buffer> {
  //   const pdfContent = await htmlToPdfmake(content);
  //   const documentDefinition = { content: pdfContent };
  //   const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

  //   return new Promise<Buffer>((resolve, reject) => {
  //     pdfDocGenerator.getBuffer((buffer: any) => {
  //       resolve(buffer);
  //     }, (error: any) => {
  //       reject(error);
  //     });
  //   });
  // }

  //get the total cost of all the transactions, number of transactions, and the method of payment and number of transactions still pending payment
  async getPaymentDetails(data?: FilterPatientDto): Promise<any> {
    
    //can we get the percentage increase or decrease in the number of transactions and the total cost of transactions since yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  
    const itemRequisitions =
      await this.inventoryRequisitionService.getAllRequisitionsApprovedByAccount(
        data,
      );
    const pharmacyRequisitions =
      await this.pharmacyRequisitionService.getAllApprovedRequisitions(data);

    const totalRequisitionCount =
      itemRequisitions.length + pharmacyRequisitions.length;

    //we want to calculate the percentage increase or decrease in the total cost  and total number of all of both item requisitions and pharmacy requisitions since yesterday
    const totalCostOfRequisitions =
      itemRequisitions.reduce((acc, curr) => {
        return acc + (+curr?.grandTotal || 0);
      }, 0) +
      pharmacyRequisitions.reduce((acc, curr) => {
        return acc + (+curr?.grandTotal || 0);
      }, 0);

    const itemRequisitionsYesterday =
      await this.inventoryRequisitionService.getAllRequisitionsApprovedByAccount(
        {
          ...data,
          startDate: yesterday,
        },
      );
    const pharmacyRequisitionsYesterday =
      await this.pharmacyRequisitionService.getAllApprovedRequisitions({
        ...data,
        startDate: yesterday,
      });
    const totalCostOfRequisitionsYesterday =
      itemRequisitionsYesterday.reduce((acc, curr) => {
        return acc + (+curr?.grandTotal || 0);
      }, 0) +
      pharmacyRequisitionsYesterday.reduce((acc, curr) => {
        return acc + (+curr?.grandTotal || 0);
      }, 0);
    const totalTransactionsOfRequisitionsYesterday =
      itemRequisitionsYesterday.length + pharmacyRequisitionsYesterday.length;
    const percentageIncreaseInRequisitionsTransactions =
      ((itemRequisitions.length +
        pharmacyRequisitions.length -
        totalTransactionsOfRequisitionsYesterday) /
        totalTransactionsOfRequisitionsYesterday) *
      100;
    const percentageIncreaseInRequisitionsCost =
      ((totalCostOfRequisitions - totalCostOfRequisitionsYesterday) /
        totalCostOfRequisitionsYesterday) *
      100;

    //we want to calculate the total cost of all of both item requisitions and pharmacy requisitions

    //get the number of transactions that are still pending payment
    // const pendingPrescriptions =
    //   await this.prescriptionService.getPrescriptionsForAccount(data);
    // const pendingInvestigations =
    //   await this.investigationService.getPendingInvestigationsForAccount(data);

    // const pendingTransactions =
    //   pendingPrescriptions.length + pendingInvestigations.length;

    

    return {
      
      totalExpenses: totalCostOfRequisitions || 0,
      requisitionCostPercentageIncrease: percentageIncreaseInRequisitionsCost || 0,
      requisitionPercentageIncrease:
        percentageIncreaseInRequisitionsTransactions || 0,
      totalRequisitionCount : totalRequisitionCount || 0,
      
    };
  }

  //get dispute counts for the dashboard
  async getDisputeCounts(data?: FilterPatientDto): Promise<any> {
    try {
      //get the total number of disputes then we want to calculate the percentage increase or decrease in disputes from the previous day
      const { startDate, endDate } = data;
      const query = {
        //status is resolved
        status: DisputeStatus.RESOLVED,
      };
      if (startDate) {
        let start = new Date(startDate)
          .toISOString()
          .replace(/T.*/, 'T00:00:00.000Z');
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        query['dateResolved'] = {
          $gte: start,
          $lte: end,
        };
      }
      const totalDisputes = await this.disputeModel.countDocuments(query);
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const disputesYesterday = await this.disputeModel
        .find({ dateResolved: { $gte: yesterday } })
        .countDocuments();
      if (disputesYesterday === 0)
        return { totalDisputes, percentageIncreaseInDisputes: 0 };
      const percentageIncreaseInDisputes =
        ((totalDisputes - disputesYesterday) / disputesYesterday) * 100;

      //return the count and the percentage increase or decrease
      return {
        totalDisputes,
        percentageIncreaseInDisputes,
      };
    } catch (error) {
      throw error;
    }
  }

  //get calendar filter for disputes resolved
  async getDisputesResolvedCalendarFilter(
    data?: CalendarFilterEnum,
  ): Promise<any> {
    try {
      const query = {
        status: DisputeStatus.RESOLVED,
      };

      // if (data === CalendarFilterEnum.WEEKLY) {
      //   let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
      //   let start = new Date(
      //     new Date().setDate(new Date().getDate() - 7),
      //   ).toISOString();

      //   const today = new Date();
      //   const oneWeekAgo = new Date();
      //   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      //   const result = await this.disputeModel
      //     .aggregate([
      //       {
      //         $match: {
      //           dateResolved: {
      //             $gte: oneWeekAgo,
      //             $lte: today,
      //           },
      //           status: DisputeStatus.RESOLVED,
      //         },
      //       },
      //       {
      //         $group: {
      //           _id: {
      //             $dateToString: { format: '%w', date: '$dateResolved' },
      //           },
      //           count: { $sum: 1 },
      //           totalAmount: { $sum: '$amount' },
      //           date: { $first: '$dateResolved' },
      //         },
      //       },
      //       {
      //         $project: {
      //           _id: 0,
      //           day: '$_id',
      //           count: 1,
      //           totalAmount: 1,
      //           date: 1,
      //         },
      //       },
      //     ])
      //     .exec();

      //   // const daysOfWeek = ['0', '1', '2', '3', '4', '5', '6'];
      //   const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      //   console.log(result, 'result')

      //   const formattedResult = daysOfWeek.map((day) => {
      //     const record = result.find((r) => {
      //       const date = new Date(r.date);
      //       const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
      //       return dayOfWeek === day;
      //     });
      //     return {
      //       day,
      //       count: record ? record.count : 0,
      //       totalAmount: record ? record.totalAmount : 0,
      //     };
      //   });

      if (data === CalendarFilterEnum.WEEKLY) {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const resultsToFilter = await this.disputeModel.find({
          dateResolved: {
            $gte: oneWeekAgo,
            $lte: today,
          },
        });

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

        const result = dates.map((date) => {
          const records = resultsToFilter.filter((r) => {
            const recordDate = new Date(r.dateResolved);
            return recordDate.toISOString().substring(0, 10) === date.date;
          });
          return {
            day: date.dayOfWeek,
            count: records.length,
            totalAmount: records.reduce((acc, curr) => acc + curr.amount, 0),
          };
        });

        return result;
      }

      if (data === CalendarFilterEnum.MONTHLY || !data) {
        const months = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleString('default', { month: 'long' });
          const yearMonth = date.toISOString().substring(0, 7);
          months.push({
            yearMonth: yearMonth,
            monthName: monthName,
          });
        }

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const disputesByMonth = await this.disputeModel
          .aggregate([
            {
              $match: {
                dateResolved: {
                  $gte: new Date(currentYear, currentMonth, 1),
                  $lt: new Date(currentYear, currentMonth + 1, 1),
                },
                status: DisputeStatus.RESOLVED,
              },
            },
            {
              $group: {
                _id: {
                  $substr: [
                    {
                      $dateToString: { format: '%Y-%m', date: '$dateResolved' },
                    },
                    0,
                    7,
                  ],
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
            {
              $project: {
                _id: 0,
                month: '$_id',
                count: 1,
                totalAmount: 1,
              },
            },
          ])
          .exec();

        const disputesByMonthFormatted = months.map((month) => {
          const dispute = disputesByMonth.find(
            (d) => d.month === month.yearMonth,
          );
          const count = dispute ? dispute.count : 0;
          const totalAmount = dispute ? dispute.totalAmount : 0;
          return {
            month: month.yearMonth,
            monthName: month.monthName,
            count: count,
            totalAmount: totalAmount,
          };
        });

        return disputesByMonthFormatted;
      }

      if (data === CalendarFilterEnum.YEARLY) {
        let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(
          new Date().setFullYear(new Date().getFullYear() - 10),
        ).toISOString();

        const years = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          years.push(date.toISOString().substring(0, 4));
        }

        const disputesByYear = await this.disputeModel
          .aggregate([
            {
              $match: {
                dateResolved: {
                  $gte: new Date(
                    new Date().setFullYear(new Date().getFullYear() - 5),
                  ),
                },
              },
            },
            {
              $group: {
                _id: {
                  $substr: [
                    { $dateToString: { format: '%Y', date: '$dateResolved' } },
                    0,
                    4,
                  ],
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
            {
              $project: {
                _id: 0,
                year: '$_id',
                count: 1,
                totalAmount: 1,
              },
            },
          ])
          .exec();

        const disputesByYearFormatted = years.map((year) => {
          const dispute = disputesByYear.find((d) => d.year === year);
          return {
            year,
            count: dispute ? dispute.count : 0,
            totalAmount: dispute ? dispute.totalAmount : 0,
          };
        });

        return disputesByYearFormatted;
      }
    } catch (error) {
      throw error;
    }
  }

  async testing(data: CalendarFilterEnum): Promise<any> {
    const bills = await this.prescriptionService.getCalendarFilter(data);
    const disputes = await this.getDisputesResolvedCalendarFilter(data);
    return {
      bills,
      disputes,
    };
  }

  async accountingReportFirstBoard(data?: FilterPatientDto): Promise<any> {
    const {
      // totalCost,
      // transactionCostPercentageIncrease,
      // transactionPercentageIncrease,
      totalRequisitionCount,
      requisitionCostPercentageIncrease,
      requisitionPercentageIncrease,
      prescriptionTransactions,
      investigationTransactions,
      // paymentMethods,
    } = await this.getPaymentDetails(data);
    const { totalDisputes, percentageIncreaseInDisputes } =
      await this.getDisputeCounts(data);
    return {
      // totalCost,
      // transactionCostPercentageIncrease,
      // transactionPercentageIncrease,
      totalRequisitionCount,
      requisitionCostPercentageIncrease,
      requisitionPercentageIncrease,
      prescriptionTransactions,
      investigationTransactions,
      totalDisputes,
      percentageIncreaseInDisputes,
      // paymentMethodCash: paymentMethods.cash,
      // paymentMethodCard: paymentMethods.card,
    };
  }

  async accountingReportSecondBoard(data?: CalendarFilterEnum): Promise<any> {
    const dispute = await this.getDisputesResolvedCalendarFilter(data);
    // const bills = await this.prescriptionService.getCalendarFilter(data);
    const expenses = await this.inventoryRequisitionService.getCalendarFilter(
      data,
    );
    return {
      dispute,
      // bills,
      expenses,
    };
  }

  async getRevenue(data?: CalendarFilterEnum): Promise<any> {
    return await this.prescriptionService.getCalendarFilter(data);
  }

  //we want to get the calendar filter for transactions based on monthly, yearly and weekly using the CalendarFilterEnum
  // async getCalendarFilter(
  //   data?: CalendarFilterEnum,
  // ): Promise<any> {
  //   try {
  //     const query = {};
  //     if (data === CalendarFilterEnum.WEEKLY) {
  //       let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
  //       let start = new Date(
  //         new Date().setDate(new Date().getDate() - 7),
  //       ).toISOString();

  //       const dates = [];
  //       for (let i = 0; i < 7; i++) {
  //         const date = new Date();
  //         date.setDate(date.getDate() - i);
  //         const dayOfWeek = [
  //           'Sunday',
  //           'Monday',
  //           'Tuesday',
  //           'Wednesday',
  //           'Thursday',
  //           'Friday',
  //           'Saturday',
  //         ][date.getDay()];
  //         dates.push({ date: date.toISOString().substring(0, 10), dayOfWeek });
  //       }

  //open dispute
  async openDispute(input: CreateDisputeDto): Promise<DisputeDocument> {
    try {
      const uniqueCode = Math.random().toString(36).substr(2, 9);
      const dispute = await this.disputeModel.create({
        ...input,
        uniqueCode,
      });
      return dispute;
    } catch (error) {
      throw error;
    }
  }

  //get all disputes
  async getDisputes(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
  ): Promise<any> {
    try {
      const query = {};
      // if (search) {
      //   query['$or'] = [
      //     { 'patient.firstName': { $regex: search, $options: 'i' } },
      //     { 'patient.lastName': { $regex: search, $options: 'i' } },
      //     { 'patient.email': { $regex: search, $options: 'i' } },
      //     { 'patient.phoneNumber': { $regex: search, $options: 'i' } },
      //     { 'patient.uniqueCode': { $regex: search, $options: 'i' } },
      //   ];
      // }
      if (status === 'PENDING') {
        query['status'] = DisputeStatus.PENDING;
      }
      if (status === 'RESOLVED') {
        query['status'] = DisputeStatus.RESOLVED;
      }
      const disputes = await this.disputeModel
        .find(query)
        .populate('patient')
        .sort({ createdAt: -1 });

      //we want to be able to search for disputes by patient name, email, phone number, unique code
      if (search) {
        const filteredDisputes = disputes.filter((dispute: any) => {
          const patient = dispute.patient;
          const patientName = `${patient.firstName} ${patient.lastName}`;
          const patientEmail = patient.email;
          const patientPhoneNumber = patient.phoneNumber;
          const patientUniqueCode = patient.ID;
          const patientSearch =
            patientName + patientEmail + patientPhoneNumber + patientUniqueCode;
          return patientSearch?.toLowerCase().includes(search?.toLowerCase());
        });
        //paginate the filtered disputes
        const totalPages = Math.ceil(filteredDisputes.length / limit);
        const count = filteredDisputes.length;
        const currentPage = page;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedDisputes = filteredDisputes.slice(startIndex, endIndex);
        return { disputes: paginatedDisputes, totalPages, currentPage, count };
      }
      //paginate the disputes
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedDisputes = disputes.slice(startIndex, endIndex);

      const count = await this.disputeModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;

      return { disputes: paginatedDisputes, totalPages, currentPage, count };
    } catch (error) {
      throw error;
    }
  }

  //get a single dispute
  async getDispute(id: string): Promise<DisputeDocument> {
    try {
      return await this.disputeModel.findById(id).populate('patient');
    } catch (error) {
      throw error;
    }
  }

  //close dispute
  async closeDispute(id: string): Promise<DisputeDocument> {
    try {
      const dispute = await this.disputeModel.findById(id).populate('patient');
      if (!dispute) {
        throw new NotFoundException('Dispute not found');
      }
      dispute.status = DisputeStatus.CLOSED;
      await dispute.save();
      return dispute;
    } catch (error) {
      throw error;
    }
  }

  //approve or decline dispute request
  async resolveDispute(
    id: string,
    input: ApproveOrDeclineDisputeDto,
  ): Promise<DisputeDocument> {
    try {
      const dispute = await this.disputeModel.findById(id).populate('patient');
      if (!dispute) {
        throw new NotFoundException('Dispute not found');
      }
      dispute.status = DisputeStatus.RESOLVED;
      if (input.approvalStatus === DisputeStatus.APPROVED) {
        dispute.isApproved = true;
      }
      if (input.approvalStatus === DisputeStatus.DECLINED) {
        dispute.isApproved = false;
        dispute.isRejected = true;
      }
      dispute.comment = input.comment;
      dispute.dateResolved = new Date();
      await dispute.save();
      return dispute;
    } catch (error) {
      throw error;
    }
  }

  //get all requisitions from the pharmacyRequisition and the inventoryRequisition
  async getRequisitions(data?: FilterBodyDto): Promise<any> {
    try {
      const { page, limit, department } = data;
      const pharmacyRequisitions =
        await this.pharmacyRequisitionService.getAllRequisitions(data);
      const inventoryRequisitions =
        await this.inventoryRequisitionService.getRequisitionsForAccount(data);
      let requisitions;
      if (department === 'pharmacy') {
        requisitions = pharmacyRequisitions;
      } else if (department === 'inventory') {
        requisitions = inventoryRequisitions;
      } else {
        //sort them by their createdAt

        requisitions = [...pharmacyRequisitions, ...inventoryRequisitions];
        //we want to sort the requisitions by their createdAt
        requisitions.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }

      //paginate the results, get the count, total pages, and the current page
      const count = requisitions.length;
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = requisitions.slice(startIndex, endIndex);
      return { results, count, totalPages, currentPage };
    } catch (error) {
      throw error;
    }
  }

  //create purchase order
  async createPurchaseOrder(
    input: itemRequisitionDto,
    req: Request,
  ): Promise<any> {
    try {
      const requisition =
        await this.inventoryRequisitionService.createItemRequisition(
          input,
          req,
        );
      return requisition;
    } catch (error) {
      throw error;
    }
  }

  //approve or reject purchase order
  async approveOrRejectPurchaseOrder(
    id: string,
    approvalStatus: headApprovalEnum,
  ) {
    try {
      // let isPharmacy: boolean;
      //a purchase order can be from the laboratory or pharmacy and must have headApproval to be APPROVED
      console.log(id, 'hi');
      const { requisition, isPharmacy } =
        await this.inventoryRequisitionService.processRequisition(id);

      console.log(requisition, 'requisition', isPharmacy, 'isPharmacy');

      console.log(requisition.headApproval, 'headApproval');
      if (requisition.headApproval !== headApprovalEnum.APPROVED) {
        throw new BadRequestException(
          'This requisition has to be approved by the head first',
        );
      }

      //if the approvalStatus is APPROVED, then check if the requisition is from the pharmacy or inventory
      if (isPharmacy) {
        //if the requisition is from the pharmacy, then update the pharmacy requisition
        const data =
          await this.pharmacyRequisitionService.accountApproveRequisition(
            id,
            approvalStatus,
          );
        console.log(data, 'data');
        return data;
      } else if (!isPharmacy) {
        //if the requisition is from the inventory, then update the inventory requisition
        const data =
          await this.inventoryRequisitionService.accountApproveRequisition(
            id,
            approvalStatus,
          );
        return data;
      }
    } catch (error) {
      throw error;
    }
  }

  //get both pharmacy and inventory requisition disputes
  async getRequisitionDisputes(data?: AccountFilterDto): Promise<any> {
    try {
      const { page, limit, department, status, search } = data;
      const pharmacyDisputes =
        await this.pharmacyRequisitionService.getAllRequisitionDisputes(
          status,
          search,
        );
      const inventoryDisputes =
        await this.inventoryRequisitionService.getAllRequisitionDisputes(
          status,
          search,
        );
      let disputes = [];
      if (department === 'pharmacy') {
        disputes = pharmacyDisputes;
      } else if (department === 'inventory') {
        disputes = inventoryDisputes;
      } else disputes = [...pharmacyDisputes, ...inventoryDisputes];
      //paginate the results, get the count, total pages, and the current page
      const count = disputes.length;
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = disputes.slice(startIndex, endIndex);
      return { results, count, totalPages, currentPage };
    } catch (error) {
      throw error;
    }
  }

  //get a single requisition dispute and change its status
  async getRequisitionDispute(
    id: string,
    status: disputeAccountRequsitionEnum,
  ): Promise<any> {
    try {
      console.log('hiiii');
      //a requisition dispute can be from the laboratory or pharmacy and must have status to be PENDING
      const dispute =
        await this.inventoryRequisitionService.changeRequisitionDisputeStatus(
          id,
          status,
        );

      //if dispute is found, return it. if not, then find it in the pharmacy dispute
      if (dispute) {
        console.log(dispute);
        return dispute;
      }
    } catch (error) {
      throw error;
    }
  }

  //
}
