import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { InvestigationBookingModule } from 'src/investigation-booking/investigation-booking.module';
import { LaboratoryModule } from 'src/laboratory/laboratory.module';
import { NotificationModule } from 'src/notification/notification.module';
import { InvestigationEntity, InvestigationSchema } from 'src/patients/schema/investigation.schema';
import { PharmacyPrescriptionEntity, PharmacyPrescriptionSchema } from 'src/patients/schema/pharmacyPrescription.schema';
import { PharmacyModule } from 'src/pharmacy/pharmacy.module';
import { ProductOrderEntity, ProductOrderSchema } from 'src/pharmacy/schema/product-order.schema';
import { MailsModule } from 'src/providers/mails/mails.module';
import { UserModule } from 'src/user/user.module';
import { FollowUpController } from './controller/follow-up.controller';
import { InvestigationController } from './controller/investigation.controller';
import { PatientsController } from './controller/patients.controller';
import { PrescriptionController } from './controller/prescription.controller';
import { VisitController } from './controller/visit.controller';
import { AssessmentLogEntity, AssessmentLogSchema } from './schema/assessmentlog.schema';
import { DoseEntity, DoseSchema } from './schema/dose.schema';
import { FollowUpEntity, FollowUpSchema } from './schema/follow-up.schema';
import { PatientEntity, PatientSchema } from './schema/patients.schema';
import { VisitItem, VisitItemSchema } from './schema/visit-item.schema';
import { VisitEntity, VisitSchema } from './schema/visit.schema';
import { FollowUpService } from './service/follow-up.service';
import { InvestigationService } from './service/investigation.service';
import { PatientsService } from './service/patients.service';
import { PrescriptionService } from './service/precription.service';
import { VisitService } from './service/visit.service';

@Module({
  imports: [
    MailsModule,
    AuthModule,
    CloudinaryModule,
    NotificationModule,
    UserModule,
    InvestigationBookingModule,
    LaboratoryModule,
    PharmacyModule,
    MongooseModule.forFeatureAsync([
      {
        name: PatientEntity.name,
        useFactory: () => {
          return PatientSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: VisitEntity.name,
        useFactory: () => {
          return VisitSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: InvestigationEntity.name,
        useFactory: () => {
          return InvestigationSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ProductOrderEntity.name,
        useFactory: () => {
          return ProductOrderSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: PharmacyPrescriptionEntity.name,
        useFactory: () => {
          return PharmacyPrescriptionSchema;
        },
      },
    ]),

    MongooseModule.forFeatureAsync([
      {
        name: VisitItem.name,
        useFactory: () => {
          return VisitItemSchema;
        },
      },
    ]),

    MongooseModule.forFeatureAsync([
      {
        name: DoseEntity.name,
        useFactory: () => {
          return DoseSchema;
        },
      },
    ]),


    MongooseModule.forFeatureAsync([
      {
        name: AssessmentLogEntity.name,
        useFactory: () => {
          return AssessmentLogSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: FollowUpEntity.name,
        useFactory: () => {
          return FollowUpSchema;
        },
      },
    ]),
  ],
  providers: [
    PatientsService,
    VisitService,
    PrescriptionService,
    InvestigationService,
    FollowUpService
  ],
  controllers: [
    PatientsController,
    VisitController,
    PrescriptionController,
    InvestigationController,
    FollowUpController
  ],
  exports: [
    PatientsService,
    VisitService,
    PrescriptionService,
    InvestigationService,
    FollowUpService
  ],
})
export class PatientsModule {}
