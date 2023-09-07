import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestEntity } from 'src/laboratory/schema/test.schema';
import { InvestigationDocument } from 'src/patients/schema/investigation.schema';
import { Booking } from '../dto/investigation-booking.dto';
import {
  InvestigatioBookingEntity,
  InvestigationBookingDocument,
} from '../schema/investigation-booking.schema';

@Injectable()
export class InvestigationBookingService {
  constructor(
    @InjectModel(InvestigatioBookingEntity.name)
    private readonly InvestigationBookingModel: Model<InvestigationBookingDocument>,
  ) {}

  async createInvestigationBooking(
    investigationBooking: InvestigatioBookingEntity,
  ): Promise<InvestigationBookingDocument> {
    const newInvestigation = new this.InvestigationBookingModel({
      investigation: investigationBooking.investigation,
      patient: investigationBooking.patient,
      date: new Date(investigationBooking.date).toISOString(),
    });
    return await newInvestigation.save();
  }

  async getInvestigationBooking(): Promise<InvestigationBookingDocument[]> {
    return await this.InvestigationBookingModel.find().exec();
  }

  async getInvestigationBookingById(
    id: string,
  ): Promise<InvestigationBookingDocument> {
    return await this.InvestigationBookingModel.findById(id).exec();
  }

  //check if a date is available for any given investigation...and that will be when you get the maxDailyLimit of test inside investigations created for given date
  // async checkDateAvailability(date: string, testId: string): Promise<boolean> {
  //     //first get all the bookings for the given date
  //     const dateFormatted = new Date(date).toISOString();
  //     const bookings: any = await this.InvestigationBookingModel.find({ date: dateFormatted })
  //         .populate({
  //             path: "investigation",
  //             populate: {
  //                 path: "test",
  //                 model: TestEntity.name
  //             },
  //         })

  //         //then filter the bookings to get only the ones that match the given investigation in which case it would mean that the test in the given investigation matches the test in the booking
  //         .then((bookings) => {
  //             return bookings.filter((booking: any) => {
  //                 return booking.investigation.test._id === testId;
  //             }
  //         );

  //         });

  //     //then get the maxDailyLimit of the test in the given investigation
  //     const maxDailyLimit = bookings[0].investigation.test.maxDailyLimit;

  //     //then check if the number of bookings for the given date is less than the maxDailyLimit
  //     if (bookings.length < maxDailyLimit) {
  //         return true;
  //     }

  //     return false;
  // }

  async checkDateAvailability(date: string, testId: string): Promise<boolean> {
    // Format the given date to ISO string.
    const dateFormatted = new Date(date).toISOString();

    // Fetch bookings for the given date and populate the investigation's test field.
    const bookings = (await this.InvestigationBookingModel.find({
      date: dateFormatted,
    })
      .lean()
      .populate({
        path: 'investigation',
        populate: {
          path: 'test',
          model: TestEntity.name,
        },
      })
      .exec()) as unknown as Booking[];

    // Filter the bookings to get only the ones that match the given investigation.
    const matchingBookings = bookings.filter(
      (booking) =>
        // booking.investigation.test._id.toString() === testId;
        booking.investigation &&
        booking.investigation.test &&
        booking.investigation.test._id.toString() === testId,
    );

    // If there are no matching bookings, the test is available for the given date.
    if (!bookings || matchingBookings.length === 0) {
      return true;
    }

    // Get the maxDailyLimit of the test in the given investigation.
    const maxDailyLimit = matchingBookings[0].investigation.test.maxDailyLimit;

    return matchingBookings.length < maxDailyLimit;
  }


  async getFullyBookedDates(testId: string): Promise<string[]> {
    // Fetch all bookings and populate the investigation's test field.
    const bookings = (await this.InvestigationBookingModel.find().populate({
      path: 'investigation',
      populate: {
        path: 'test',
        model: TestEntity.name,
      },
    })) as unknown as Booking[];

    // Filter the bookings to get only the ones that match the given investigation.
    // const matchingBookings = bookings.filter((booking) => booking.investigation.test._id.toString() === testId)
    // Filter the bookings to get only the ones that match the given investigation.
    const matchingBookings = bookings.filter(
      (booking) =>
        booking.investigation &&
        booking.investigation.test &&
        booking.investigation.test._id.toString() === testId,
    );

    const fullyBookedDates: { [date: string]: number } =
      matchingBookings.reduce((acc, booking) => {
        acc[booking.date] = (acc[booking.date] || 0) + 1;
        return acc;
      }, {});

    // Filter the dates that have bookings equal to the maxDailyLimit of the test.
    const fullyBookedDatesArray = Object.keys(fullyBookedDates).filter((date) => {
      return matchingBookings[0] && fullyBookedDates[date] >= matchingBookings[0].investigation.test.maxDailyLimit;
    });
    
    return fullyBookedDatesArray;
  }
}
