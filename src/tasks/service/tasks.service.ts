import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { AppointmentStatusEnum } from 'src/appointments/enum/appointment.enum';
import { AppointmentDocument, AppointmentEntity } from 'src/appointments/schema/appointments.schema';
import { InvestigationService } from 'src/patients/service/investigation.service';
import { UserDocument, UserEntity } from 'src/user/schema/user.schema';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    
    constructor(
         @InjectModel(AppointmentEntity.name)
        private appointmentModel: Model<AppointmentDocument>,

        @InjectModel(UserEntity.name)
        private userModel: Model<UserDocument>,

        private readonly investigationService: InvestigationService,
        
        ) {
        this.logger.log('TasksService instantiated'); 
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.log('Cron job executed');
        try {
            
            const result = await this.appointmentModel.updateMany(
                { 'department.name': 'General Outpatient Department' },
                { $set: { orderNumber: 0 } },
            );
            // console.log(result);
            Logger.log(result, 'TasksService');
        } catch (error) {
            Logger.error(error, 'TasksService');
        }
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    async handleCron2() {
        try {
            //it checks all the appointments for doctor field in each of the appointments and check the time date duration of the appointment relative to when this cron job runs. if their appointments have ended or have no running appointment at the point of running this cron task, it changes 'isFree' column in the userModel to true. but if they have running appointment at the point of running every task, it changes 'isFree' column in userModel to false

            const result = await this.appointmentModel.find(
                { 'doctor': { $exists: true } },
            );
            result.forEach(async (appointment) => {
                const doctor = await this.userModel.findOne
                ({ _id: appointment.doctor });
                
                //we want to check if the duration between each appointment startDate and endDateTime does not fall within the current time, if it falls, isFree is set to false, if not, isFree is true
                const currentDate = new Date();
                const startDate = new Date(appointment.startDateTime);
                const endDate = new Date(appointment.endDateTime);
                //if the present current date falls within datetime of appointment for any doctor, set isFree to false, if not set isFree to true
                if (currentDate >= startDate && currentDate <= endDate) {
                    doctor.isFree = false;
                    await doctor.save();
                } else {
                    doctor.isFree = true;
                    await doctor.save();
                }
                
            });
            Logger.log(result, 'TasksService');
        } catch (error) {
            Logger.error(error, 'TasksService');
        }
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    async handleCron3() {
        try {
            const res = await this.investigationService.checkInvestigationsWithStatusPendingLater();
            Logger.log(res, 'TasksService');
        } catch (error) {
            Logger.error(error, 'TasksService');
        }
    }

}