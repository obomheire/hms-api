import { Module } from '@nestjs/common';
import { TasksService } from './service/tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentEntity, AppointmentSchema } from 'src/appointments/schema/appointments.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ShiftEntity, ShiftSchema } from 'src/shifts/schema/shifts.schema';
import { UserEntity, UserSchema } from 'src/user/schema/user.schema';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  imports: [ScheduleModule.forRoot(),
    MongooseModule.forFeatureAsync([
      {
        name: AppointmentEntity.name,
        useFactory: () => {
          return AppointmentSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ShiftEntity.name,
        useFactory: () => {
          return ShiftSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: UserEntity.name,
        useFactory: () => {
          return UserSchema;
        },
      },
    ]),
    PatientsModule
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
