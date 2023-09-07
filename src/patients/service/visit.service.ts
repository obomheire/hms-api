import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model } from 'mongoose';
import { CreateVisitItemDto, UpdateVisitItemDto } from '../dto/visit-item.dto';
import {
  CalendarFilterDto,
  CreateVisitDto,
  UpdateVisitDto,
} from '../dto/visit.dto';
import { VisitItem, VisitItemDocument } from '../schema/visit-item.schema';
import { VisitDocument, VisitEntity } from '../schema/visit.schema';
import { FilterPatientDto } from '../dto/filterPatient.dto';
import {
  AssessmentLogDocument,
  AssessmentLogEntity,
} from '../schema/assessmentlog.schema';
import {
  AssessmentLogDto,
  UpdateAssessmentLogDto,
} from '../dto/assessmentLog.dto';
import { PrescriptionService } from './precription.service';
import { InvestigationService } from './investigation.service';
import { CalendarFilterEnum, VisitStatusEnum } from '../enum/visit-status.enum';
import { PatientsService } from './patients.service';
import { RecommendationType } from 'src/utils/enums/patients/recommendation-type.enum';

@Injectable()
export class VisitService {
  constructor(
    @InjectModel(VisitEntity.name) private visitModel: Model<VisitDocument>,
    @InjectModel(VisitItem.name)
    private visitItemModel: Model<VisitItemDocument>,
    @InjectModel(AssessmentLogEntity.name)
    private assessmentLogModel: Model<AssessmentLogDocument>,
    private readonly prescriptionService: PrescriptionService,
    private readonly investigationService: InvestigationService,
    private readonly patientService: PatientsService,
  ) {}

  uniqueID = () => {
    const val = Math.floor(Math.random() * Date.now());
    return val.toString().substr(0, 7);
  };

  //create visit item to be used as visitDetails in visit schema
  async createVisitItem(
    visitItem: CreateVisitItemDto,
    req: Request,
  ): Promise<VisitItemDocument> {
    try {
      const newVisitItem = new this.visitItemModel({
        ...visitItem,
        doctor: req.user,
      });
      return await newVisitItem.save();
    } catch (error) {
      throw error;
    }
  }

  //update visit item
  async updateVisitItem(
    visitItem: UpdateVisitItemDto,
    visitItemId: string,
  ): Promise<VisitItemDocument> {
    try {
      const updatedVisitItem = await this.visitItemModel.findByIdAndUpdate(
        visitItemId,
        { ...visitItem },
        { new: true },
      );
      if (!updatedVisitItem) {
        throw new NotFoundException('Visit item not found');
      }
      return updatedVisitItem;
    } catch (error) {
      throw error;
    }
  }

  //get visit item
  async getVisitItem(visitItemId: string): Promise<VisitItemDocument> {
    try {
      const visitItem = await this.visitItemModel
        .findById(visitItemId)
        .populate('prescription')
        .populate('investigation');
      if (!visitItem) {
        throw new NotFoundException('Visit item not found');
      }
      return visitItem;
    } catch (error) {
      throw error;
    }
  }

  //delete visit item
  async deleteVisitItem(visitItemId: string): Promise<string> {
    try {
      const visitItemToDelete = await this.visitItemModel.findByIdAndDelete(
        visitItemId,
      );
      if (!visitItemToDelete) {
        throw new NotFoundException('Visit item not found');
      }
      return 'Visit item deleted successfully';
    } catch (error) {
      throw error;
    }
  }

  //create visit
  async createVisit(visit: CreateVisitDto): Promise<VisitDocument> {
    try {
      const val = this.uniqueID();
      const visitID = `VIS-${val}`;
      const newVisit = new this.visitModel({
        ...visit,
        visitID,
        visitDetails: [],
      });
      return await newVisit.save();
    } catch (error) {
      throw error;
    }
  }

  //update visit
  async updateVisit(
    visitId: string,
    visit?: CreateVisitItemDto,
    req?: Request,
  ): Promise<VisitDocument> {
    try {
      const updatedVisit = await this.visitModel.findById(visitId);

      if (!updatedVisit) {
        throw new NotFoundException('Visit not found');
      }

      if (visit.assessmentLog) {
        for (let i = 0; i < visit.assessmentLog.length; i++) {
          const newAssessmentLog = await this.assessmentLogModel.create({
            ...visit.assessmentLog[i],
            noteBy: req.user,
          });
          updatedVisit.assessmentLog.push(newAssessmentLog.id);
        }
      }
      if (visit.recommendation) {
        for (let i = 0; i < visit.recommendation.length; i++) {
          await this.visitModel.findByIdAndUpdate(
            visitId,
            { $push: { recommendation: visit.recommendation[i] } },
            { new: true },
          );
          //if visit.recommendation[i] contains type = WARD, then update the patient status to ADMISSION_PENDING
          if (visit.recommendation[i].type === RecommendationType.WARD) {
            const id = updatedVisit.patientId.toString();
            await this.patientService.updatePatientFormat(id);
          }
        }
      }
      // visit.recommendation = undefined;
      //push recommendation to visit

      //make visit.assessmentLog undefined so that it doesn't get saved as a visit item
      visit.assessmentLog = undefined;

      if (visit) {
        const newVisitItem = await this.createVisitItem(visit, req);
        updatedVisit.visitDetails.push(newVisitItem.id);
        await updatedVisit.save();
      }

      return updatedVisit;
    } catch (error) {
      throw error;
    }
  }

  //delete visit
  async deleteVisit(visitId: string): Promise<string> {
    try {
      const visitToDelete = await this.visitModel.findById(visitId);
      if (!visitToDelete) {
        throw new NotFoundException('Visit not found');
      }
      return 'Visit deleted successfully';
    } catch (error) {
      throw error;
    }
  }

  //get one visit
  async getVisit(visitId: string): Promise<VisitDocument> {
    try {
      const visit = await this.visitModel
        .findById(visitId)
        //populate visitDetails, prescription and investigation in the visitDetails. for investigation, populate the doctor and the test. for prescription, populate the doctor and the items' product
        .populate({
          path: 'visitDetails',
          populate: [
            { path: 'prescription', populate: { path: 'doctor' } },
            // { path: 'prescription', populate: [{ path: 'items.product' } ]},
            {
              path: 'prescription',
              populate: {
                path: 'items',
                populate: { path: 'product', model: 'DrugProductEntity' },
              },
            },

            { path: 'investigation', populate: { path: 'doctor' } },
            { path: 'investigation', populate: { path: 'test' } },
          ],
        })

        .populate('patientId')
        .populate('assessmentLog')
        .populate({
          path: 'assessmentLog',
          populate: { path: 'noteBy', populate: { path: 'role' } },
        })
        .exec();
      if (!visit) {
        throw new NotFoundException('Visit not found');
      }
      // const { visitDetails } = visit;
      // const { prescription } = visitDetails;
      // const items = prescription.items;
      // // retrieve product data for each item
      // const itemsWithProduct = await Promise.all(
      //   Object.entries(items).map(async ([itemId, productId]) => {
      //     const product = await this.productModel.findById(productId).exec();
      //     return { itemId, product };
      //   })
      // );
      // // attach product data to items object
      // prescription.items = itemsWithProduct.reduce((acc, { itemId, product }) => {
      //   acc[itemId] = product;
      //   return acc;
      // }, {});

      return visit;
    } catch (error) {
      throw error;
    }
  }

  //get all visits
  async getVisits(search?: string, date?: string): Promise<VisitDocument[]> {
    try {
      let visits: VisitDocument[];
      if (search) {
        visits = await this.visitModel
          .find({ visitID: { $regex: search, $options: 'i' } })
          .populate('visitDetails')
          .populate('patientId')
          .exec();
      } else {
        visits = await this.visitModel
          .find()
          .populate('visitDetails')
          .populate('patientId')
          .exec();
      }
      if (date) {
        const month = date.split('-')[0];
        const year = date.split('-')[1];
        visits = visits.filter(
          (visit) =>
            visit.createdAt.getMonth() + 1 == parseInt(month) &&
            visit.createdAt.getFullYear() == parseInt(year),
        );
      }
      return visits;
    } catch (error) {
      throw error;
    }
  }

  //get all visits for a patient
  async getPatientVisits(
    patientId: string,
    search?: string,
    date?: string,
  ): Promise<VisitDocument[]> {
    try {
      let visits: VisitDocument[];
      if (search) {
        visits = await this.visitModel
          .find({
            patientId: patientId,
            visitID: { $regex: search, $options: 'i' },
          })
          .populate('visitDetails')
          .populate('patientId')
          .exec();
      } else {
        visits = await this.visitModel
          .find({ patientId: patientId })
          .populate('visitDetails')
          .populate('patientId')
          .exec();
      }
      if (date) {
        const month = date.split('-')[0];
        const year = date.split('-')[1];
        visits = visits.filter(
          (visit) =>
            visit.createdAt.getMonth() + 1 == parseInt(month) &&
            visit.createdAt.getFullYear() == parseInt(year),
        );
      }
      return visits;
    } catch (error) {
      throw error;
    }
  }

  // //get all visits for a doctor
  // async getDoctorVisits(doctorId: string, search?:string, date?:string): Promise<VisitDocument[]> {
  //     try {
  //         let visits: VisitDocument[];
  //         if (search) {
  //             visits = await this.visitModel
  //             .find({ doctorId: doctorId, visitID: { $regex: search, $options: 'i' } })
  //             .populate('visitDetails')
  //             .populate('patientId')
  //             .exec();
  //         } else {
  //             visits = await this.visitModel
  //             .find({ doctorId: doctorId })
  //             .populate('visitDetails')
  //             .populate('patientId')
  //             .exec();
  //         }
  //         if (date) {
  //             const month = date.split('-')[0];
  //             const year = date.split('-')[1];
  //             visits = visits.filter(
  //                 (visit) =>
  //                     visit.createdAt.getMonth() + 1 == parseInt(month) &&
  //                     visit.createdAt.getFullYear() == parseInt(year),
  //             );
  //         }
  //         return visits;
  //     } catch (error) {
  //         throw error;
  //     }
  // }

  async getPatientVisitStatistics(patientId: string): Promise<any> {
    try {
      const monthlyVisits = await this.visitModel.aggregate([
        {
          $match: { patientId: new mongoose.Types.ObjectId(patientId) },
        },
        {
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
        },
        {
          $group: {
            _id: { year: '$year', month: '$month' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1,
          },
        },
      ]);
      return monthlyVisits;
    } catch (error) {
      throw error;
    }
  }

  // //create assessment log
  // async createAssessmentLog(assessmentLog: AssessmentLogDto, req: any): Promise<AssessmentLogDocument> {
  //     try {
  //         const newAssessmentLog = new this.assessmentLogModel({
  //             ...assessmentLog,
  //         });
  //         newAssessmentLog.notes.forEach((note) => {
  //             note.createdAt = new Date();
  //             note.doctor = req.user
  //         });
  //         return await newAssessmentLog.save();

  //     } catch (error) {
  //         throw error;
  //     }
  // }

  //update assessment log
  // async updateAssessmentLog(id: string, assessmentLog: UpdateAssessmentLogDto, user: string): Promise<AssessmentLogDocument> {
  //     try {
  //         const updatedAssessmentLog = await this.assessmentLogModel
  //             .findByIdAndUpdate(
  //                 id,
  //                 {
  //                     ...assessmentLog,
  //                 },
  //                 { new: true },
  //             )
  //             .exec();
  //         if (!updatedAssessmentLog) {

  //             throw new NotFoundException('Assessment log not found');
  //         }
  //         updatedAssessmentLog.responses.forEach((response) => {
  //             response.responseTime = new Date();
  //             response.responseBy = user;
  //         }
  //         );
  //         return await updatedAssessmentLog.save();
  //     } catch (error) {
  //         throw error;
  //     }
  // }

  async getAssessmentLogById(id: string) {
    try {
      //populate the doctor id in the notes and responseBy in the responses
      const assessmentLog = await this.assessmentLogModel
        .findById(id)
        .populate('notes.doctor')
        .populate('responses.responseBy')
        .exec();
      if (!assessmentLog) {
        throw new NotFoundException('Assessment log not found');
      }
      return assessmentLog;
    } catch (error) {
      throw error;
    }
  }

  //get most recent visit and then populate the assessment logs therein
  async getMostRecentVisit(patientId: string) {
    try {
      const visit = await this.visitModel
        .findOne({ patientId: patientId })
        .sort({ createdAt: -1 })
        // .populate('assessmentLog')
        .populate({
          path: 'visitDetails',
          populate: [
            { path: 'prescription', model: 'PharmacyPrescriptionEntity' },
            { path: 'investigation', model: 'InvestigationEntity' },
          ],
        })
        .populate({
          path: 'assessmentLog',
          populate: { path: 'noteBy', populate: { path: 'role' } },
        })
        .exec();
      // if (!visit) {
      //   throw new NotFoundException('No visit found');
      // }

      return visit;
    } catch (error) {
      throw error;
    }
  }

  //get the most recent visit item from most recent visit by patient id
  async getMostRecentVisitItem(patientId: string) {
    try {
      const visit = await this.getMostRecentVisit(patientId);
      if (!visit) throw new NotFoundException('No visit found');
      console.log(visit);
      const visitItem = visit.visitDetails[visit.visitDetails.length - 1];
      const assessmentLog = visit.assessmentLog;
      return { visitItem, assessmentLog };
    } catch (error) {
      throw error;
    }
  }

  //end visit
  async endVisit(visitId: string): Promise<VisitDocument> {
    try {
      //enddedAt to be new Date()
      //status to be ended
      const visit = await this.visitModel
        .findByIdAndUpdate(
          visitId,
          {
            endedAt: new Date(),
            status: VisitStatusEnum.ENDED,
          },
          { new: true },
        )
        .exec();
      if (!visit) {
        throw new NotFoundException('Visit not found');
      }
      return visit;
    } catch (error) {
      throw error;
    }
  }

  //get most recent visit item
  async getMostRecentVisitItemSelf(req: any) {
    try {
      return await this.getMostRecentVisitItem(req.user);
    } catch (error) {
      throw error;
    }
  }

  //patient get his most recent visit
  async getPatientMostRecentVisit(req: any): Promise<VisitDocument> {
    try {
      const visit = await this.visitModel
        .findOne({ patientId: req.user })
        .sort({ createdAt: -1 })
        .populate({
          path: 'visitDetails',
          populate: [
            { path: 'prescription', model: 'PharmacyPrescriptionEntity' },
            { path: 'investigation', model: 'InvestigationEntity' },
          ],
        })
        .populate({
          path: 'assessmentLog',
          populate: { path: 'noteBy', populate: { path: 'role' } },
        })
        .exec();
      if (!visit) {
        throw new NotFoundException('No visit found');
      }
      return visit;
    } catch (error) {
      throw error;
    }
  }

  //get all visits by patient id and sort by most recent
  async getVisitsPatient(req: any, data?: FilterPatientDto): Promise<any> {
    try {
      const { startDate, endDate } = data;
      const query = { patientId: req.user };
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
      }

      const visits = await this.visitModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate({
          path: 'visitDetails',
          populate: [
            {
              path: 'investigation',
              populate: {
                path: 'test',
                model: 'TestEntity',
              },
            },
            {
              path: 'prescription',
              populate: {
                path: 'items',
                populate: {
                  path: 'product',
                  model: 'DrugProductEntity',
                },
              },
            },
          ],
        })
        .populate('assessmentLog')
        .exec();
      if (!visits) {
        throw new NotFoundException('No visit found');
      }
      return visits;
    } catch (error) {
      throw error;
    }
  }

  // //get all visits and be able to filter by date
  // async getVisitsAdmin(data?: FilterPatientDto): Promise<any> {
  //   const { startDate, endDate } = data;
  //   const query = {};
  //   if (startDate) {
  //     let end = endDate
  //       ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
  //       : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
  //     let start = new Date(startDate).toISOString();
  //     query['createdAt'] = { $gte: start, $lte: end };
  //   }

  //   const [visits, count] = await Promise.all([
  //     this.visitModel

  //       .find(query)
  //       .sort({ createdAt: -1 })

  //       .populate({
  //         path: 'visitDetails',
  //         populate: [
  //           {
  //             path: 'investigation',
  //             populate: {
  //               path: 'test',
  //               model: 'TestEntity',
  //             },
  //           },
  //           {
  //             path: 'prescription',
  //             populate: {
  //               path: 'items',
  //               populate: {
  //                 path: 'product',
  //                 model: 'DrugProductEntity',
  //               },
  //             },
  //           },
  //         ],
  //       })
  //       .populate('assessmentLog')
  //       .exec(),

  //     this.visitItemModel.countDocuments(query).exec(),
  //   ]);

  //   return { visits, count };
  // }
  // catch(error) {
  //   throw error;
  // }

  //implement calendar filter for visits, make a default of the current year.
  //if we pass yearly, then it should filter by year, if we pass monthly, then it should filter by month, if we pass weekly, then it should filter by week and all filtering by createdAt

  async getVisitsAdminCalendar(data?: CalendarFilterEnum): Promise<any> {
    try {
      const currentYear = new Date().getFullYear().toString();
      // const {
      //   startDate,
      //   endDate,
      //   yearly,
      //   year = currentYear,
      //   monthly,
      //   weekly,
      // } = data;

      const query = {};

      if (data === CalendarFilterEnum.WEEKLY) {
        let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(
          new Date().setDate(new Date().getDate() - 7),
        ).toISOString();

        // const visits = await this.visitModel
        //   .aggregate([
        //     {
        //       $match: {
        //         createdAt: {
        //           $gte: new Date(start),
        //           $lte: new Date(end),
        //         },
        //       },
        //     },
        //     {
        //       $group: {
        //         _id: {
        //           $dateToString: {
        //             format: '%Y-%m-%d',
        //             date: '$createdAt',
        //           },
        //         },
        //         count: { $sum: 1 },
        //       },
        //     },
        //     {
        //       $project: {
        //         _id: 0,
        //         day: {
        //           $dateToString: {
        //             format: '%A',
        //             date: '$_id',
        //           },
        //         },
        //         count: 1,
        //       },
        //     },
        //     {
        //       $group: {
        //         _id: '$day',
        //         count: { $sum: '$count' },
        //       },
        //     },
        //     {
        //       $project: {
        //         _id: 0,
        //         day: '$_id',
        //         count: 1,
        //       },
        //     },
        //   ])
        //   .exec();
        //   console.log(visits)
        // return visits;
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

        const visitsByDay = await this.visitModel
          .aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(start),
                  $lte: new Date(end),
                },
              },
            },
            {
              $group: {
                _id: { $dayOfWeek: '$createdAt' },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                dayOfWeek: '$_id',
                count: 1,
              },
            },
          ])
          .exec();

        const visitsByDate = dates.map(({ date, dayOfWeek }) => {
          const visit = visitsByDay.find((v) => v.dayOfWeek === dayOfWeek);
          return {
            name: dayOfWeek,
            count: visit ? visit.count : 0,
          };
        });

        return visitsByDate;
      }
      //monthly means each of the 12 months
      if (data === CalendarFilterEnum.MONTHLY) {
       return await this.monthlyVisits();
      }

      //yearly means each of the years from the current year to the year 2020
      if (data === CalendarFilterEnum.YEARLY) {
        let end = new Date().toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(
          new Date().setFullYear(new Date().getFullYear() - 10),
        ).toISOString();
        query['createdAt'] = { $gte: start, $lte: end };
        //we want to get the count of each month of that year and the corresponding month of the year
        const visits = await this.visitModel

          .aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(start),
                  $lte: new Date(end),
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y',
                    date: '$createdAt',
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: '$_id',
                count: 1,
              },
            },
          ])
          .exec();
        //we want to return default values for the years that have no visits
        const years = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          years.push(date.toISOString().substring(0, 4));
        }
        const visitsByYearFormatted = years.map((year) => {
          const visit = visits.find((v) => v.date === year);
          return {
            name: year,
            count: visit ? visit.count : 0,
          };
        });
        return visitsByYearFormatted;
      }

     return await this.monthlyVisits();
    } catch (error) {
      throw error;
    }
  }

  private async monthlyVisits() {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().substring(0, 7));
    }

    const visitsByMonth = await this.visitModel
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1),
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              $substr: [
                { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                0,
                7,
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            count: 1,
          },
        },
      ])
      .exec();

    const visitsByMonthFormatted = months.map((month) => {
      const visit = visitsByMonth.find((v) => v.month === month);
      const date = new Date(`${month}-01`);
      const monthName = date.toLocaleString('default', { month: 'long' });
      return {
        name: monthName,
        count: visit ? visit.count : 0,
      };
    });

    return visitsByMonthFormatted;
  }
}
