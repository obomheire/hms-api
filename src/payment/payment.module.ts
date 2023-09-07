import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './service/payment.service';
import { CardEncryptionService } from './service/card-encryption.service';
import { PaymentController } from './controller/payment.controller';
import { HttpModule } from '@nestjs/axios';
import { AccountingModule } from 'src/accounting/accounting.module';
import { WebhookController } from './controller/webhook.controller';
import { PharmacyModule } from 'src/pharmacy/pharmacy.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentEntity, PaymentSchema } from './schema/payment.schema';
import { TransactionTypeModule } from 'src/transaction-types/transaction-type.module';
import { PaymentListener } from './listeners/payment.listener';
import { PatientsModule } from 'src/patients/patients.module';
import { QuickHttpService } from './service/quick-http.service';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { MailsModule } from 'src/providers/mails/mails.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => AccountingModule),
    PharmacyModule,
    TransactionTypeModule,
    PatientsModule,
    AppointmentsModule,
    MailsModule,
    CloudinaryModule,
    // AccountingModule,
    MongooseModule.forFeatureAsync([
      {
        name: PaymentEntity.name,
        useFactory: () => {
          return PaymentSchema;
        },
      },
    ]),
  ],
  controllers: [PaymentController, WebhookController],
  providers: [PaymentService, CardEncryptionService, PaymentListener, QuickHttpService],
  exports: [PaymentService],
})
export class PaymentModule {}
