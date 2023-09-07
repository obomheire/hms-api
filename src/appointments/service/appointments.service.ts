import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  PatientDocument,
  PatientEntity,
} from 'src/patients/schema/patients.schema';
import {
  CreateAppointmentDto,
  FollowUpAppointmentDto,
  RescheduleAppointmentDto,
} from '../dto/appointment.dto';
import {
  AppointmentDocument,
  AppointmentEntity,
} from '../schema/appointments.schema';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  FilterAppointmentDto,
  UpcomingDoctorDto,
} from '../dto/filterAppointment.dto';
import {
  DepartmentDocument,
  DepartmentEntity,
} from 'src/department/schema/department.schema';
import {
  AppointmentFrequencyEnum,
  AppointmentStatusEnum,
} from '../enum/appointment.enum';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { UserService } from 'src/user/services/user.service';
import { errorMonitor } from 'events';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';
import { FollowUpService } from 'src/patients/service/follow-up.service';
import { PatientsService } from 'src/patients/service/patients.service';
import { NotificationsGateway } from 'src/notification/gateway/websocket';

type DoctorDetails = {
  firstName: string;
  lastName: string;
  // other properties
};

type Followup = {
  visitId: {
    visitID: string;
    // other properties
  };
  createdAt: Date;
  // other properties
};

type PatientDetails = {
  firstName: string;
  lastName: string;
  // other properties
};

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(AppointmentEntity.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(DepartmentEntity.name)
    private departmentModel: Model<DepartmentDocument>, // @InjectModel(PatientEntity.name)
    private readonly userService: UserService, // private patientModel: Model<PatientDocument>,
    private readonly appNotificationService: AppNotificationService,
    private readonly followUpService: FollowUpService,
    private readonly patientService: PatientsService,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  async createAppointment(
    appointment?: CreateAppointmentDto,
  ): Promise<AppointmentDocument | AppointmentDocument[]> {
    let {
      startTime,
      startDate,
      endTime,
      doctor,
      timeAlot,
      frequency,
      endFrequency,
    } = appointment;

    let endDate = startDate;
    const startDateTime = new Date(`${startDate} ${startTime}`);
    let endDateTime = new Date(`${endDate} ${endTime}`);

    if (startDateTime < new Date()) {
      throw new ConflictException(
        'Appointment date and time cannot be in the past',
      );
    }
    if (startDateTime > endDateTime) {
      throw new ConflictException(
        'Appointment end date and time cannot be before start date and time',
      );
    }
    if (timeAlot) {
      const timeAlotInMinutes = timeAlot * 60 * 1000;
      const newEndDateTime = new Date(
        startDateTime.getTime() + timeAlotInMinutes,
      );

      endTime = newEndDateTime.toLocaleTimeString();
      endDate = newEndDateTime.toLocaleDateString();
      endDateTime = new Date(`${endDate} ${endTime}`);
    }

    try {
      const appointmentExists = await this.appointmentModel.findOne({
        doctor: doctor,
        startDateTime: {
          $gte: startDateTime,
          $lt: endDateTime,
        },
        endDateTime: {
          $gt: startDateTime,
          $lte: endDateTime,
        },
      });

      if (appointmentExists) {
        throw new ConflictException(
          'Appointment already exists for this doctor at this time',
        );
      }

      if (frequency) {
        const endFrequencyDate = endFrequency
          ? new Date(endFrequency)
          : new Date(new Date().setMonth(new Date().getMonth() + 3));
        const endFrequencyDateInMs = endFrequencyDate.getTime();
        const startDateTimeInMs = startDateTime.getTime();
        const endDateTimeInMs = endDateTime.getTime();
        const timeDifference = endDateTimeInMs - startDateTimeInMs;
        const appointments = [];
        let newStartDateTime = startDateTime;
        let newEndDateTime = endDateTime;
        let newStartDate = startDate;
        let newEndDate = endDate;
        let newStartTime = startTime;
        let newEndTime = endTime;
        let newAppointment;
        let newAppointmentExists;

        while (newStartDateTime.getTime() < endFrequencyDateInMs) {
          newAppointmentExists = await this.appointmentModel
            .findOne({
              doctor: doctor,
              startDateTime: {
                $gte: newStartDateTime,
                $lt: newEndDateTime,
              },
              endDateTime: {
                $gt: newStartDateTime,
                $lte: newEndDateTime,
              },
            })
            .exec();
          if (newAppointmentExists) {
            throw new ConflictException(
              'Appointment already exists for this doctor at this time',
            );
          }
          newAppointment = new this.appointmentModel({
            ...appointment,
            startDateTime: newStartDateTime.toISOString(),
            endDateTime: newEndDateTime.toISOString(),
            startDate: newStartDate,
            endDate: newEndDate,
            startTime: newStartTime,
            endTime: newEndTime,
          });
          appointments.push(newAppointment);
          if (frequency === AppointmentFrequencyEnum.DAILY) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }
          if (frequency === AppointmentFrequencyEnum.WEEKLY) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 7 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 7 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }
          if (frequency === AppointmentFrequencyEnum.MONTHLY) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 30 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 30 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }
          if (frequency === AppointmentFrequencyEnum.YEARLY) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 365 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 365 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }
          if (frequency === AppointmentFrequencyEnum.ALTERNATE_DAYS) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 2 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 2 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }

          if (frequency === AppointmentFrequencyEnum.ALTERNATE_WEEKS) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 14 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 14 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }

          if (frequency === AppointmentFrequencyEnum.ALTERNATE_MONTHS) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 60 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 60 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }

          if (frequency === AppointmentFrequencyEnum.ALTERNATE_YEARS) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 730 * 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 730 * 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
          }

          if (frequency === AppointmentFrequencyEnum.WEEKDAYS) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
            if (
              newStartDateTime.getDay() === 0 ||
              newStartDateTime.getDay() === 6
            ) {
              newStartDateTime = new Date(
                newStartDateTime.getTime() + 24 * 60 * 60 * 1000,
              );
              newEndDateTime = new Date(
                newEndDateTime.getTime() + 24 * 60 * 60 * 1000,
              );
              newStartDate = newStartDateTime.toLocaleDateString();
              newEndDate = newEndDateTime.toLocaleDateString();
              newStartTime = newStartDateTime.toLocaleTimeString();
              newEndTime = newEndDateTime.toLocaleTimeString();
            }
          }

          if (frequency === AppointmentFrequencyEnum.WEEKENDS) {
            newStartDateTime = new Date(
              newStartDateTime.getTime() + 24 * 60 * 60 * 1000,
            );
            newEndDateTime = new Date(
              newEndDateTime.getTime() + 24 * 60 * 60 * 1000,
            );
            newStartDate = newStartDateTime.toLocaleDateString();
            newEndDate = newEndDateTime.toLocaleDateString();
            newStartTime = newStartDateTime.toLocaleTimeString();
            newEndTime = newEndDateTime.toLocaleTimeString();
            if (
              newStartDateTime.getDay() !== 0 &&
              newStartDateTime.getDay() !== 6
            ) {
              newStartDateTime = new Date(
                newStartDateTime.getTime() + 24 * 60 * 60 * 1000,
              );
              newEndDateTime = new Date(
                newEndDateTime.getTime() + 24 * 60 * 60 * 1000,
              );
              newStartDate = newStartDateTime.toLocaleDateString();
              newEndDate = newEndDateTime.toLocaleDateString();
              newStartTime = newStartDateTime.toLocaleTimeString();
              newEndTime = newEndDateTime.toLocaleTimeString();
            }
          }
        }
        return await this.appointmentModel.insertMany(appointments);
      }
      const newAppointment = new this.appointmentModel({
        ...appointment,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        startDate,
        endDate,
        startTime,
        endTime,
      });
      return await newAppointment.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAppointmentById(id: string): Promise<AppointmentDocument> {
    try {
      const appointment = await this.appointmentModel.findById(id);
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAppointmentByPatient(
    patientId: string,
    data?: FilterPatientDto,
  ): Promise<any> {
    try {
      const { page, limit, startDate, endDate } = data;
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
      const appointments = await this.appointmentModel
        .find({
          patient: patientId,
          ...query,
        })
        .populate('patient', 'firstName lastName age gender')
        .populate('doctor', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await this.appointmentModel.countDocuments({
        patient: patientId,
        ...query,
      });
      const totalPages = Math.ceil(count / limit);
      return { appointments, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  async getPendingAppointmentByPatient(
    patientId: string,
    data?: FilterPatientDto,
  ): Promise<any> {
    try {
      const { page, limit, startDate, endDate } = data;
      //status is pending and isSc
      const query = {
        status: AppointmentStatusEnum.PENDING,
        isSeenCompleted: false,
      };
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
      const appointments = await this.appointmentModel
        .find({
          patient: patientId,
          ...query,
        })
        .populate('patient', 'firstName lastName age gender')
        .populate('doctor', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await this.appointmentModel.countDocuments({
        patient: patientId,
        ...query,
      });
      const totalPages = Math.ceil(count / limit);
      return { appointments, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }
  //get appointment history of a patient and filter by date. it is history when isSeenCompleted = true
  async getAppointmentHistoryByPatient(
    patientId: string,
    data?: FilterPatientDto,
  ): Promise<any> {
    try {
      const { page, limit, startDate, endDate } = data;
      const query = {
        isSeenCompleted: true,
      };
      if (startDate) {
        let start = new Date(startDate)
          .toISOString()
          .replace(/T.*/, 'T00:00:00.000Z');
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        query['startDateTime'] = {
          $gte: start,
          $lte: end,
        };
      }
      const appointments = await this.appointmentModel
        .find({
          patient: patientId,
          ...query,
        })
        .populate('patient', 'firstName lastName age')
        .populate('doctor', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await this.appointmentModel.countDocuments({
        patient: patientId,
        ...query,
      });
      const totalPages = Math.ceil(count / limit);
      return { appointments, count, totalPages, currentPage: page };
    } catch (error) {
      throw error;
    }
  }

  //get a running appointment for a patient which is marked by appointmentStatus = 'completed' and isSeenCompleted = false
  async getRunningAppointmentByPatient(
    patientId: string,
  ): Promise<AppointmentDocument | string> {
    try {
      const appointment = await this.appointmentModel.findOne({
        patient: patientId,
        appointmentStatus: 'completed',
        isSeenCompleted: false,
      });
      if (appointment === null) {
        return 'No running appointment';
      }
      return appointment;
    } catch (error) {
      throw error;
    }
  }

  async getAppointmentsByDoctor(
    doctorId: string,
    body: FilterAppointmentDto,
  ): Promise<AppointmentDocument[]> {
    try {
      let { startDate, endDate } = body;
      if (startDate && endDate === undefined) {
        endDate = new Date(startDate)
          .toISOString()
          .replace(/T.*/, 'T23:59:59.999Z');
      }
      const appointments = await this.appointmentModel
        .find({
          doctor: doctorId,
          appointmentStatus: 'pending',
          endDateTime: startDate
            ? {
                $gte: new Date(startDate).toISOString(),
                $lt: new Date(endDate).toISOString(),
              }
            : { $exists: true },
        })
        .populate('patient', 'firstName lastName age gender')
        .populate('doctor', 'firstName lastName age gender');
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      return appointments;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAppointmentByDepartment(
    department: string,
    page = 1,
    limit = 15,
  ): Promise<AppointmentDocument[] | any> {
    try {
      const appointments = await this.appointmentModel
        .find({ department: department })
        .skip((page - 1) * limit)
        .limit(limit);
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      const total = await this.appointmentModel.countDocuments({
        department: department,
      });
      const totalPages = Math.ceil(total / limit);
      const currentPage = page;

      return {
        appointments,
        total,
        totalPages,
        currentPage,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //filter appointment by dates and paginate using the paginator helper function imported
  //we want to be able to filter appointments for today, yesterday and for any body of startDate to endDate as well as paginate them
  async getAppointmentsByDate(
    page = 1,
    limit = 15,
    filterData?: FilterAppointmentDto,
  ): Promise<AppointmentDocument[] | any> {
    try {
      //we want to filter for today if no filter data is provided
      const { startDate, endDate } = filterData;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const start = startDate ? new Date(startDate) : yesterday;
      const end = endDate ? new Date(endDate) : tomorrow;
      const appointments = await this.appointmentModel
        .find({
          startDateTime: {
            $gte: start,
            $lt: end,
          },
        })
        .skip((page - 1) * limit)
        .limit(limit);
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      const count = await this.appointmentModel.countDocuments({
        startDateTime: {
          $gte: start,
          $lt: end,
        },
      });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments, count, totalPages, currentPage };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAppointmentByStatus(
    status: string,
    page = 1,
    limit = 15,
  ): Promise<AppointmentDocument[] | any> {
    try {
      const appointments = await this.appointmentModel
        .find({ status })
        .skip((page - 1) * limit)
        .limit(limit);
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      const count = await this.appointmentModel.countDocuments({ status });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments, count, totalPages, currentPage };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //GET ALL SPECIALIST APPOINTMENTS

  async filterUpcomingAppointments(
    body: FilterAppointmentDto,
  ): Promise<AppointmentDocument[] | any> {
    try {
      let { startDate, endDate, page, limit, search } = body;
      const query = {};
      if (startDate) {
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        let start = new Date(startDate).toISOString();
        query['endDateTime'] = { $gte: start, $lte: end };
      }
      let appointments = await this.appointmentModel
        .find({
          appointmentStatus: 'pending',
          doctor: { $ne: null },
          // endDateTime: startDate
          //   ? {
          //       $gte: new Date(startDate).toISOString(),
          //       $lt: new Date(endDate).toISOString(),
          //     }
          //   : { $exists: true },
          ...query,
        })
        .populate('patient', 'firstName lastName age gender')
        .populate({
          path: 'doctor',
          populate: [{
            path: 'role',
            model: 'RoleEntity',
          },
          {
            path: 'designation',
            model: 'DesignationEntity',
          },
        ],
        })
        .sort({ createdAt: -1 });
      if (search) {
        //search by patient name
        const filteredAppointments = appointments.filter((appointment: any) => {
          const patientName = `${appointment.patient?.firstName} ${appointment.patient?.lastName}`;
          return patientName.toLowerCase().includes(search.toLowerCase());
        });
        appointments = filteredAppointments;
      }
      const count = appointments.length;

      //paginate the appointments with page and limit provided
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      if (endIndex < appointments.length) {
        results['next'] = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        results['previous'] = {
          page: page - 1,
          limit,
        };
      }
      results['results'] = appointments.slice(startIndex, endIndex);
      appointments = results['results'];

      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments, currentPage, totalPages, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllAppointments(
    query: FilterQuery<AppointmentEntity>,
    page = 1,
    limit = 15,
  ): Promise<AppointmentDocument[] | any> {
    try {
      const appointments = await this.appointmentModel
        .find(query)
        .populate('patient', 'firstName lastName')
        .populate('department', 'name')
        .populate('doctor')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      const count = await this.appointmentModel.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments, currentPage, totalPages, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async rescheduleAppointment(
    appointmentId: string,
    rescheduleAppointmentDto: RescheduleAppointmentDto,
  ): Promise<AppointmentDocument> {
    //we want to be able to reschedule to another time, date, doctor, patient, department
    try {
      const {
        startDate,
        startTime,
        endDate,
        endTime,
        doctor,
        patient,
        department,
      } = rescheduleAppointmentDto;
      const startDateTime = new Date(`${startDate} ${startTime}`).toISOString();
      const endDateTime = new Date(`${startDate} ${endTime}`).toISOString();
      //we want to check if the date and time have another appointment existing already for the for the startDateTime and endDateTime and the interval between them
      const appointmentExists = await this.appointmentModel.findOne({
        startDateTime: {
          $gte: startDateTime,
          $lt: endDateTime,
        },
        endDateTime: {
          $gt: startDateTime,
          $lte: endDateTime,
        },
        doctor,
        patient,
        department,
      });
      if (appointmentExists) {
        throw new ConflictException('Appointment already exists');
      }
      //we can now update the appointment
      //we save the time and date together as ISOString()
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          ...rescheduleAppointmentDto,
          startDateTime,
          endDateTime,
        },
        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  cancelAppointment = async (
    appointmentId: string,
  ): Promise<AppointmentDocument> => {
    try {
      //we want to free the time and date alloted to the appointment so it can be taken by someone else
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          appointmentStatus: 'cancelled',
          startDateTime: null,
          endDateTime: null,
        },

        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      //we want to send a notification to the patient and doctor that the appointment has been cancelled
      //we want to make the start time, date and end date and time for this appointment so it can be free to be taken by another
      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
  //cancel appointment deletes the entry of the appointment from the database
  deleteAppointment = async (appointmentId: string): Promise<string> => {
    try {
      const appointment = await this.appointmentModel.findByIdAndDelete(
        appointmentId,
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return 'appointment deleted';
    } catch (error) {
      throw error;
    }
  };

  markAppointmentAsCompleted = async (
    appointmentId: string,
  ): Promise<string> => {
    try {
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { appointmentStatus: 'completed' },
        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return 'appointment started';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  cancelBulkAppointmentForASinglePatient = async (
    patientId: string,
  ): Promise<AppointmentDocument[] | any> => {
    try {
      const appointments = await this.appointmentModel.updateMany(
        { patient: patientId },
        {
          appointmentStatus: 'cancelled',
          startDateTime: null,
          endDateTime: null,
        },
        { new: true },
      );
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      return appointments;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  updateAppointmentStatus = async (
    appointmentId: string,
    appointmentStatus: string,
  ): Promise<AppointmentDocument> => {
    try {
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { appointmentStatus },
        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  updateAppointment = async (
    appointmentId: string,
  ): Promise<AppointmentDocument> => {
    try {
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: 'PAID' },
        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return appointment;
    } catch (error) {
      throw error
    }
  };


  //if department is general outpatient department, we want to create appointments that gives no startDateTime and no endDateTi,e but orderNumber to the appointment
  createGeneralistAppointment = async (
    patient: string,
  ): Promise<AppointmentDocument> => {
    try {
      //department.name will always be General Outpatient Department
      //we want to generate orderNumber in increasing order
      //only patient will be provided as request body
      const department = await this.departmentModel.findOne({
        name: 'General Outpatient Department',
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
      //check for the last orderNumber of the appointment in the document for only where department.name is General Outpatient Department.
      //we want to increment the orderNumber by 1
      const lastApptItem = await this.appointmentModel
        .findOne({
          department: department._id,
          orderNumber: { $ne: 0 },
        })
        .sort({ createdAt: -1 });
      const orderNumber = lastApptItem ? lastApptItem.orderNumber + 1 : 1;

      //we want to check for the averageTime of the last appointment in the document for only where department.name is General Outpatient Department
      const lastAvgTime = lastApptItem ? lastApptItem.averageTime + 15 : 15;

      //check if appointment exists for patient already at general outpatient department.
      //this is checked if an appointment exists with for same person in the department and must have orderNumber that is not 0;

      const appointmentExists = await this.appointmentModel.findOne({
        patient,
        department: department._id,
        orderNumber: { $ne: 0 },
        appointmentStatus: { $ne: 'completed' },
      });

      if (appointmentExists) {
        //we want to throw 409 conflict exception

        throw new ConflictException('Appointment already exists');
      }
      const appointment = await this.appointmentModel.create({
        patient,
        department: department._id,
        orderNumber,
        averageTime: lastAvgTime,
        isGeneralist: true,
      });
      return appointment;
    } catch (error) {
      throw error;
    }

    //we want to get all generalist appointments
  };
  getGeneralistAppointments = async (
    page = 1,
    limit = 15,
    search?: string,
  ): Promise<AppointmentDocument[] | any> => {
    try {
      const department = await this.departmentModel.findOne({
        name: 'General Outpatient Department',
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
      const query = {
        department: department._id,
        orderNumber: { $ne: 0 },
        appointmentStatus: 'pending',
      };

      let appointments = await this.appointmentModel
        .find(query)
        .populate('department', 'name')
        .populate('patient', 'lastName firstName middleName gender')
        .sort({ orderNumber: 1 });
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      if (search) {
        const filteredAppointments = appointments.filter((appointment) => {
          const patient: any = appointment.patient;
          const patientName = `${patient.lastName} ${patient.firstName} ${patient.middleName}`;
          return patientName.toLowerCase().includes(search.toLowerCase());
        });
        appointments = filteredAppointments;
      }
      const count = appointments.length;
      //we want to paginate the appointments using the page and limit provided
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      if (endIndex < appointments.length) {
        results['next'] = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        results['previous'] = {
          page: page - 1,
          limit,
        };
      }
      results['results'] = appointments.slice(startIndex, endIndex);
      appointments = results['results'];

      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments, totalPages, currentPage, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //DOCTOR DASHBOARD ENDPOINTS
  //we want to update appointment isOpenedBy and add doctor user entity that opens the appointment
  updateAppointmentIsOpenedBy = async (
    appointmentId: string,
    req: any,
  ): Promise<AppointmentDocument> => {
    try {
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { isOpenedBy: req.user },
        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      await this.userService.updateIsFree(req.user, false);
      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to update appointment isSeenCompleted and change it to true
  updateAppointmentIsSeenCompleted = async (
    appointmentId: string,
    req: any,
  ): Promise<AppointmentDocument> => {
    try {
      const appointment = await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        { 
          isSeenCompleted: true,
          isOpenedBy: req.user.toString()
        },
        { new: true },
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      await this.userService.updateIsFree(appointment?.isOpenedBy, true);
      return appointment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getUpcomingSpecialistAppointments = async (
    req: any,
    data: UpcomingDoctorDto,
  ): Promise<AppointmentDocument[] | any> => {
    try {
      const { page, limit, doctorId, searchTerm, startDate, endDate } = data;
      const query = {};
      if (startDate) {
        let start = new Date(startDate)
          .toISOString()
          .replace(/T.*/, 'T00:00:00.000Z');
        let end = endDate
          ? new Date(endDate).toISOString().replace(/T.*/, 'T23:59:59.999Z')
          : new Date(startDate).toISOString().replace(/T.*/, 'T23:59:59.999Z');
        query['startDateTime'] = {
          $gte: start,
          $lte: end,
        };
      }

      let appointments = await this.appointmentModel
        .find({
          doctor: req.user.toString(),
          isSeenCompleted: false,
          ...query,
        })
        .populate('patient', 'firstName lastName ID')
        .populate({
          path: 'doctor',
          populate: {
            path: 'role',
            model: 'RoleEntity',
          },
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      if (searchTerm !== '') {
        const filteredAppointments = appointments.filter((appointment: any) => {
          return (
            appointment.patient?.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            appointment.patient?.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            appointment.patient?.ID.toLowerCase().includes(
              searchTerm.toLowerCase(),
            )
          );
        });
        appointments = filteredAppointments;
      }
      const count = appointments.length;
      //now paginate using page and limit

      const result = appointments.slice((page - 1) * limit, page * limit);
      // const count = await this.appointmentModel.countDocuments({
      //   doctor: doctorId,
      //   isSeenCompleted: false,
      //   ...query,
      // });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments: result, totalPages, currentPage, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get history of specialist appointments and be able to search through with patient ID and or name. History appointments are determined isSeenCompleted being true
  //we want to get for appointments owned by a specific doctor only

  getHistoryAppointments = async (
    req: any,
    data?: UpcomingDoctorDto,
  ): Promise<AppointmentDocument[] | any> => {
    try {
      console.log(data);
      const query = {};
      // if(data.searchTerm !== '') {
      //   query['$or'] = [
      //     { 'patient.firstName': { $regex: data.searchTerm, $options: 'i' } },
      //     { 'patient.lastName': { $regex: data.searchTerm, $options: 'i' } },
      //     { 'patient.ID': { $regex: data.searchTerm, $options: 'i' } },
      //   ];
      // }
      const { page, limit, doctorId, searchTerm } = data;
      let appointments = await this.appointmentModel
        .find({
          doctor: req.user.toString(),
          isSeenCompleted: true,
          ...query,
        })
        .populate('patient', 'firstName lastName ID')
        .populate('doctor', 'firstName lastName ID')
        .sort({ createdAt: -1 });
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      if (searchTerm !== '') {
        const filteredAppointments = appointments.filter((appointment: any) => {
          return (
            appointment.patient?.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            appointment.patient?.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            appointment.patient?.ID.toLowerCase().includes(
              searchTerm.toLowerCase(),
            )
          );
        });
        appointments = filteredAppointments;
      }
      const count = appointments.length;
      //now paginate using page and limit

      const result = appointments.slice((page - 1) * limit, page * limit);

      // const count = await this.appointmentModel.countDocuments({
      //   doctor: doctorId,
      //   isSeenCompleted: true,
      //   ...query,
      // });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments: result, totalPages, currentPage, count };
    } catch (error) {
      throw error;
    }
  };

  //we want to get total number of patients seen by a doctor. This is gotten where doctorId is equal to isOpenedBy
  getTotalPatientsSeenByDoctor = async (doctorId: string): Promise<any> => {
    try {
      //we want to get total number of patients seen by a doctor. This is gotten where doctorId is equal to isOpenedBy
      const totalPatientsSeen = await this.appointmentModel.countDocuments({
        isOpenedBy: doctorId,
      });
      //we want to get total number of appointments that have the doctorId
      const totalAppointments = await this.appointmentModel.countDocuments({
        doctor: doctorId,
      });

      return { totalPatientsSeen, totalAppointments };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getLoggedInDoctorStat = async (req: any): Promise<any> => {
    try {
      const { totalPatientsSeen, totalAppointments } =
        await this.getTotalPatientsSeenByDoctor(req.user.toString());
      return { totalPatientsSeen, totalAppointments };
    } catch (error) {
      throw error;
    }
  };

  //get total patients seen by all doctors
  getTotalPatientsSeenByAllDoctors = async (): Promise<any> => {
    try {
      //we want to get total number of patients seen by a doctor. This is gotten where doctorId is equal to isOpenedBy
      const totalPatientsSeen = await this.appointmentModel.countDocuments({
        isOpenedBy: { $ne: null },
      });
      const appointments = await this.appointmentModel
        .find({
          isOpenedBy: { $ne: null },
        })
        .populate('patient', 'firstName lastName')
        .sort({ createdAt: -1 });
      //we want to populate the patients

      //we want to select just the doctorsNote field from these patients and sort them by most recent
      // const doctorsNotes = patients.map((patient) => patient.doctorsNote);

      return { totalPatientsSeen, appointments };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get upcoming generalist appointments and be able to search with patient name and or ID
  getUpcomingGeneralistAppointments = async (
    page = 1,
    limit = 15,
    searchTerm: string,
  ): Promise<AppointmentDocument[] | any> => {
    try {
      const appointments = await this.appointmentModel
        .find({
          isSeenCompleted: false,
          $or: [
            { 'patient.firstName': { $regex: searchTerm, $options: 'i' } },
            { 'patient.lastName': { $regex: searchTerm, $options: 'i' } },
            { 'patient.ID': { $regex: searchTerm, $options: 'i' } },
          ],
        })
        .populate('patient', 'firstName lastName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      const count = await this.appointmentModel.countDocuments({
        isSeenCompleted: false,
        $or: [
          { 'patient.firstName': { $regex: searchTerm, $options: 'i' } },
          { 'patient.lastName': { $regex: searchTerm, $options: 'i' } },
          { 'patient.ID': { $regex: searchTerm, $options: 'i' } },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { appointments, totalPages, currentPage, count };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get total number of specialist appointments(that is appointments that do not belong to the general outpatient department)

  getTotalSpecialistAppointments = async (): Promise<any> => {
    try {
      const totalSpecialistAppointments =
        await this.appointmentModel.countDocuments({
          department: { $ne: 'General Outpatient Department' },
        });
      return totalSpecialistAppointments;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //start appoinment, by that you mean set appointmentStatus to COMPLETED
  startAppointment = async (appointmentId: string): Promise<string> => {
    try {
      const appointment: any = await this.appointmentModel.findById(
        appointmentId,
      )
      
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      if(!appointment.status || appointment.status !== 'PAID') {
        throw new BadRequestException('Appointment has not been paid for');
      }
      //first check if the appointment department name is general outpatient department
      if (appointment.isGeneralist === true ) {
        appointment.averageTime = 0;
        appointment.appointmentStatus = AppointmentStatusEnum.COMPLETED;
        await appointment.save();
        //then decrement all other appointments following this particular appointment, decrement averageTime of each of them by 15 minutes
        const appointments = await this.appointmentModel.find({
          doctor: appointment.doctor,
          appointmentStatus: AppointmentStatusEnum.PENDING,
          orderNumber: { $gt: appointment?.orderNumber },
        });
        appointments.forEach(async (appointment) => {
          appointment.averageTime = appointment.averageTime - 15;
          await appointment.save();
        });
      }
      //if appointment .isGeneralist is false
      if (!appointment.isGeneralist) {
        const [doctorDetails, patientDetails]: any[] = await Promise.all([
          this.userService.getStaff(appointment.doctor),
          this.patientService.getPatient(appointment.patient),
        ]);
        const message = `Your appointment with Dr ${doctorDetails.firstName} ${doctorDetails.lastName} has started . Thank you.`;
        const title = 'Appointment Started';
        const notifications = await Promise.all([
          this.appNotificationService.createNotification({
            userId: appointment.patient,
            message,
            title,
            to: 'PATIENT'
          }),
          this.appNotificationService.createNotification({
            userId: appointment.doctor,
            message: `You have an appointment with ${patientDetails.firstName} ${patientDetails.lastName} has started.`,
            title,
            to: 'DOCTOR'
          }),
        ]);
        appointment.appointmentStatus = AppointmentStatusEnum.COMPLETED;
        await appointment.save();
      }

      return 'Appointment started';
    } catch (error) {
      throw error;
    }
  };

  //patient book generalist appointment by themselves
  bookGeneralistAppointment = async (
    req: any,
  ): Promise<AppointmentDocument> => {
    try {
      const appointment = await this.createGeneralistAppointment(req.user);
      return appointment;
    } catch (error) {
      throw error;
    }
  };

  //get logged in user booked appointments that the orderNumber is not 0
  getLoggedInUserBookedAppointments = async (req: any): Promise<any> => {
    try {
      const appointments = await this.appointmentModel
        .find({
          patient: req.user,
          orderNumber: { $ne: 0 },
          appointmentStatus: AppointmentStatusEnum.PENDING,
          //and also where the department name is equal to general outpatient department
          // 'department.name': 'General Outpatient Department',
        })
        .populate('doctor');
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      return appointments;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //get upcoming specialist appointments for a logged in user
  loggedInUpcomingSpecialistAppointments = async (req: any): Promise<any> => {
    try {
      const appointments = await this.appointmentModel
        .find({
          patient: req.user.toString(),
          //and also where the department name is not equal to general outpatient department
          'department.name': { $ne: 'General Outpatient Department' },
          appointmentStatus: AppointmentStatusEnum.PENDING,
        })
        .populate({
          path: 'doctor',
          populate: {
            path: 'role',
            model: 'RoleEntity',
          },
        });
      if (!appointments) {
        throw new NotFoundException('Appointment not found');
      }
      return appointments;
    } catch (error) {
      throw error.message;
    }
  };

  //create a specialist appointment following a follow up request
  // createFollowUpAppointment = async (
  //   followUpId: string,
  //   data: CreateAppointmentDto,
  // ): Promise<any> => {
  //   try {
  //     const { patient, doctor, endTime, startDate , startTime} = data;
  //   const appointment: any = await this.createAppointment(data);
  //   const doctorDetails = await this.userService.getStaff(doctor);
  //   const followup:any = await this.followUpService.getFollowUpById(followUpId);
  //   await this.followUpService.updateFollowUp(followUpId, appointment.id);

  //   const VisitCode = followup?.visitId?.visitID;
  //   const patientDetails = await this.patientService.getPatient(patient);
  //   //then create notification for the patient
  //   const notification = await this.appNotificationService.createNotification({
  //     userId: patient,
  //     message: `Your appointment with Dr ${doctorDetails.firstName} ${doctorDetails.lastName} has been booked. This is a follow up to the case of visit code ${VisitCode} created on ${followup.createdAt} . Please be at the hospital at ${startTime} on ${startDate} and be ready for your appointment. Thank you.`,
  //     title: 'Appointment booked',
  //   });
  //   //then create notification for the doctor
  //   const notification2 = await this.appNotificationService.createNotification({
  //     userId: doctor,
  //     message: `You have an appointment with ${patientDetails.firstName} ${patientDetails.lastName} on ${startDate} at ${startTime}. This is a follow up to the case of visit code ${VisitCode}. Please be at the hospital at ${startTime} on ${startDate} and be ready for your appointment. Thank you.`,
  //     title: 'Appointment booked',
  //   });
  //   return appointment;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  createFollowUpAppointment = async (
    followUpId: string,
    data: CreateAppointmentDto,
  ): Promise<any> => {
    const { patient, doctor, endTime, startDate, startTime } = data;

    try {
      const appointment: any = await this.createAppointment(data);
      const [doctorDetails, followup, patientDetails]: any[] =
        await Promise.all([
          this.userService.getStaff(doctor),
          this.followUpService.getFollowUpById(followUpId),
          this.patientService.getPatient(patient),
        ]);
      const followUpUpdate: any = followup;

      await this.followUpService.updateFollowUp(followUpId, appointment.id);

      const VisitCode = followUpUpdate?.visitId?.visitID;
      const message = `Your appointment with Dr ${doctorDetails.firstName} ${doctorDetails.lastName} has been booked. This is a follow up to the case of visit code ${VisitCode} created on ${followup.createdAt} . Please be at the hospital at ${startTime} on ${startDate} and be ready for your appointment. Thank you.`;
      const title = 'Appointment booked';
      const notifications = await Promise.all([
        this.appNotificationService.createNotification({
          userId: patient,
          message,
          title,
          key: appointment.id,
          to: 'PATIENT',
          otherId: followUpId,
          otherFields: {
            doctorFirstName: doctorDetails.firstName,
            doctorLastName: doctorDetails.lastName,
            visitCode: VisitCode,
            visitDate: followup.createdAt,
            appointmentDate: new Date(startDate),
            apointmentEndTime: endTime,
            appointmentStartTime: startTime,
          },
        }),
        this.appNotificationService.createNotification({
          userId: doctor,
          message: `You have an appointment with ${patientDetails.firstName} ${patientDetails.lastName} on ${startDate} at ${startTime}. This is a follow up to the case of visit code ${VisitCode}. Please be at the hospital at ${startTime} on ${startDate} and be ready for your appointment. Thank you.`,
          title,
          to: 'DOCTOR',
        }),
      ]);

      return appointment;
    } catch (error) {
      throw error;
    }
  };
}
