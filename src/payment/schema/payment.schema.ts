import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { TransactionTypeNameEnum } from 'src/transaction-types/enums/transaction-type.enum';
import { TransactionTypeEntity } from 'src/transaction-types/schema/transaction-type.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { WardEntity } from 'src/wards/schema/wards.schema';
import { Pay } from 'twilio/lib/twiml/VoiceResponse';
import { PaymentStatusEnum } from '../enum/payment.enum';

@Schema(mongooseSchemaConfig)
export class PaymentEntity {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientEntity',
  })
  patient: string;

  @Prop()
  uniqueCode: string;

  @Prop()
  totalCost: number;

  @Prop()
  paidAmount: number;

  @Prop()
  dueAmount: number;

  @Prop()
  paymentDate: string;

  @Prop()
  paymentReference: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethodEnum),
  })
  paymentMethod: PaymentMethodEnum;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HmoEntity',
  })
  hmoProvider: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatusEnum),
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum;

  @Prop({
    type: String,
    enum: Object.values(TransactionTypeNameEnum),
  })
  transactionType: TransactionTypeNameEnum;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'model',
  })
  itemToPayFor: string;

  @Prop({
    type: String,
    enum: [
      'InvestigationEntity',
      'PharmacyPrescriptionEntity',
      'ProductOrderEntity',
      'TransactionTypeEntity',
      'AppointmentEntity',
      'WardEntity'
    ],
  })
  model: string;

  updatedAt: Date | string;

  @Prop()
  receiptUrl: string;
}

//we want to generate 8 digit unique code for each payment before save

export const PaymentSchema = SchemaFactory.createForClass(PaymentEntity);
export type PaymentDocument = PaymentEntity & Document;

PaymentSchema.pre<PaymentDocument>('save', async function (next) {
  const payment = this as PaymentDocument;
  if (!payment.uniqueCode) {
    payment.uniqueCode = Math.floor(
      10000000 + Math.random() * 90000000,
    ).toString();
  }
  next();
});
