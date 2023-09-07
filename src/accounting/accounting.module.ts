import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { PatientsModule } from 'src/patients/patients.module';
import { PaymentModule } from 'src/payment/payment.module';
import { PharmacyModule } from 'src/pharmacy/pharmacy.module';
import { MailsModule } from 'src/providers/mails/mails.module';
import { SmsModule } from 'src/sms/sms.module';
import { RequisitionDisputeEntity, RequisitionDisputeSchema } from 'src/utils/schemas/dispute-requisition.schema';
import { AccountingController } from './controller/accounting.controller';
import { DisputeEntity, DisputeSchema } from './schema/dispute.schema';
import { AccountingService } from './service/accounting.service';

@Module({
  imports: [
    PatientsModule,
    MailsModule,
    PharmacyModule,
    InventoryModule,
    CloudinaryModule,
    SmsModule,
    PaymentModule,
    MongooseModule.forFeatureAsync([
      {
        name: DisputeEntity.name,
        useFactory: () => {
          return DisputeSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: RequisitionDisputeEntity.name,
        useFactory: () => {
          return RequisitionDisputeSchema;
        },
      },
    ]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
