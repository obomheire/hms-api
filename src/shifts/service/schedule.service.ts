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
import { FilterQuery, Model, Types } from 'mongoose';
import {
  DepartmentDocument,
  DepartmentEntity,
} from 'src/department/schema/department.schema';
import { UnitDocument, UnitEntity } from 'src/department/schema/unit.schema';
import { UserDocument, UserEntity } from 'src/user/schema/user.schema';
import {
  CreateScheduleDto,
  DateDto,
  SwapShiftsDto,
  UpdateScheduleDto,
} from '../dto/schedule.dto';
import { ScheduleDocument, ScheduleEntity } from '../schema/schedule.schema';
import moment from 'moment';

@Injectable()
export class ScheduleService {
  constructor(
    // @InjectModel(UserEntity.name)
    // private UserModel: Model<UserDocument>,
    @InjectModel(DepartmentEntity.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(ScheduleEntity.name)
    private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(UnitEntity.name)
    private unitModel: Model<UnitDocument>,
  ) {}

  async scheduleShiftsToStaffs(createScheduleDto: CreateScheduleDto) {
    const { unitId, startDate, endDate, days, shifts, staffs } =
      createScheduleDto;

    const daysInWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const validDays = days.every((day) =>
      daysInWeek.includes(day.toLowerCase()),
    );
    if (!validDays) {
      throw new BadRequestException('Days must be between Monday to Sunday');
    }

    const startDateObj = moment(startDate);
    const endDateObj = moment(endDate);

    const dates = [];
    const currentDate = startDateObj.clone();

    while (currentDate.isSameOrBefore(endDateObj)) {
      const dayName = daysInWeek[currentDate.day()];
      if (days.includes(dayName.toLowerCase())) {
        dates.push(currentDate.toISOString());
      }
      currentDate.add(1, 'day');
    }

    const existingSchedules = await this.scheduleModel
      .find({
        staff: { $in: staffs },
        date: { $in: dates },
        shift: { $in: shifts },
      })
      .exec();

    if (existingSchedules.length > 0) {
      throw new BadRequestException(
        'Staff already assigned to shift on some dates',
      );
    }

    const staffSchedules = staffs.flatMap((staff) => {
      return dates.flatMap((date) => {
        return shifts.map((shift) => {
          return {
            staff,
            date,
            shift,
            unit: unitId,
          };
        });
      });
    });

    const schedules = await this.scheduleModel.insertMany(staffSchedules);
    return schedules;
  }

  async updateSchedule(id: string, updateScheduleDto: UpdateScheduleDto) {
    try {
      const schedule = await this.scheduleModel.findById(id);
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
        id,
        updateScheduleDto,
        {
          new: true,
        },
      );
      return updatedSchedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  //we want staffs to be able to swap shifts 24 hours earlier before the shift time
  // async swapShifts(id: string, swapShiftsDto: SwapShiftsDto) {
  //   try {
  //     const schedule = await this.scheduleModel.findById(id);
  //     if (!schedule) {
  //       throw new NotFoundException('schedule not found');
  //     }
  //     const { staffs, shifts } = swapShiftsDto;
  //     const staffsAlreadyScheduledForShifts = await this.scheduleModel.find({
  //       staffs: { $in: staffs },
  //       shifts: { $in: shifts },
  //     });
  //     if (staffsAlreadyScheduledForShifts.length > 0) {
  //       throw new BadRequestException(
  //         'some staffs are already scheduled for the same shifts',
  //       );
  //     }
  //     const shiftsAlreadyScheduledForStaffs = await this.scheduleModel.find({
  //       shifts: { $in: shifts },
  //       staffs: { $in: staffs },
  //     });
  //     if (shiftsAlreadyScheduledForStaffs.length > 0) {
  //       throw new BadRequestException(
  //         'some shifts are already scheduled for the same staffs',
  //       );
  //     }
  //     const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
  //       id,
  //       swapShiftsDto,
  //       {
  //         new: true,
  //       },
  //     );
  //     return updatedSchedule;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  exchangeSchedule = async (id: string, staffId: string) => {
    //we want staffs to be able to exchange or swap shifts scheduled to them, which means a staff can swap his schedule with another of another staff
    //we want staffs to be able to exchange or swap shifts scheduled to them, which means a staff can swap his schedule with another of another staff
    //there can be other staff assigned to that same shift, and we are just exchanging shift of a single staff for another. we want to make sure the staff now being assigned shift of another person does not have a similar shift running elsewhere at same date and duration
    //ensure the staff to now take the shift is free from shifts for the duration
    try {
      const schedule = await this.scheduleModel.findById(id);
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      const { date, shift, unit, staff } = schedule;
      //we want to check if the new staff has no similar shift on same date elsewhere. Meanwhile, we can have other staff still on that schedule shift
      const staffAlreadyScheduledForShift = await this.scheduleModel.find({
        staffId,
        date,
        shift,
      });
      if (staffAlreadyScheduledForShift.length > 0) {
        throw new BadRequestException(
          'staff is already scheduled for the same shift',
        );
      }
      //we then want to remove the staff existing on that schedule originally and add the new staff
      const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
        id,
        { staff: staffId },
        {
          new: true,
        },
      );
      return updatedSchedule;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //get all schedules for same unit and populate the staff and shift
  async getSchedulesForUnit(unitId: string): Promise<ScheduleDocument[]> {
    //get all schedules for same unit and populate the staff and shift
    try {
      const schedules = await this.scheduleModel
        .find({ unit: unitId })
        .populate('staff', 'firstName lastName gender phoneNumber')
        .populate('unit', 'name')
        .populate('shift', 'name startTime endTime');
      return schedules;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteSchedule(id: string) {
    try {
      const schedule = await this.scheduleModel.findById(id);
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      await this.scheduleModel.findByIdAndDelete(id);
      return 'schedule deleted successfully';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getScheduleByStaffId(staffId: string) {
    try {
      const schedule = await this.scheduleModel
        .find({ staff: staffId })
        .populate('staff', 'firstName lastName gender phoneNumber')
        .populate('unit', 'name')
        .populate('shift', 'name startTime endTime');
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getScheduleByDay(day: string) {
    try {
      const schedule = await this.scheduleModel.find({ days: day });
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getScheduleByDate(date: Date) {
    try {
      const schedule = await this.scheduleModel.find({ date });
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getScheduleByDateRange(
    unitId: string,
    body: DateDto,
  ): Promise<ScheduleDocument[]> {
    try {
      const { startDate, endDate, shift } = body;
      //we have to convert the startDate and endDate to ISOString
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();
      //GET SCHEDULES BETWEEN RANGE OF DATES AND IF OPTIONALLY SHIFT IS PROVIDED, IT SHOULD FILTER WITH SHIFT IN ADDITION, IF SHIFT IS NOT PROVIDED, THEN RETURN THE FILTER BETWEEN DATEs

      const schedules = await this.scheduleModel
        .find({
          unit: unitId,
          date: {
            $gte: start,
            $lte: end,
          },
          shift: shift ? shift : { $exists: true },
        })
        .populate('staff', 'firstName lastName')
        .populate('shift', 'name startTime endTime')
        .populate('unit', 'name');

      if (!schedules) {
        throw new NotFoundException('schedule not found');
      }

      return schedules;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getScheduleByStaffIdAndShiftId(staffId: string, shiftId: string) {
    try {
      const schedule = await this.scheduleModel.find({
        staffs: staffId,
        shifts: shiftId,
      });
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getScheduleByStaffIdAndDay(staffId: string, day: string) {
    try {
      const schedule = await this.scheduleModel.find({
        staffs: staffId,
        days: day,
      });
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getScheduleOfDepartmentByDate(
    departmentId: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      const schedule = await this.scheduleModel.find({
        department: departmentId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      if (!schedule) {
        throw new NotFoundException('schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
