import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentEntity, DepartmentSchema } from 'src/department/schema/department.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { PatientsModule } from 'src/patients/patients.module';
import { PatientEntity, PatientSchema } from 'src/patients/schema/patients.schema';
import { PatientsService } from 'src/patients/service/patients.service';
import { TransactionTypeModule } from 'src/transaction-types/transaction-type.module';
import { UserModule } from 'src/user/user.module';
import { AppointmentsController } from './controller/appointments.controller';
import { AppointmentEntity, AppointmentSchema } from './schema/appointments.schema';
import { AppointmentsService } from './service/appointments.service';

@Module({
  imports: [
    UserModule,
    NotificationModule,
    TransactionTypeModule,
    forwardRef(() => PatientsModule), 
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
        name: DepartmentEntity.name,
        useFactory: () => {
          return DepartmentSchema;
        },
      },
    ]),
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}
