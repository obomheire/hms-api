import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { PatientEntity } from 'src/patients/schema/patients.schema';
import { UserEntity } from 'src/user/schema/user.schema';
import { PrescriptionStatusEnum } from 'src/utils/enums/patients/prescriptionStatus.enum';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { mongooseSchemaConfig } from '../../utils/database/schema.config';
import {
  PrescriptionEntity,
  PrescriptionSchema,
} from '../../utils/schemas/patients/prescription.schema';

@Schema(mongooseSchemaConfig)
export class PharmacyPrescriptionEntity {
  @Prop({ unique: true })
  uniqueCode: number;

  // @Prop([{ type: PrescriptionSchema, ref: 'PrescriptionEntity' }])
  // @Type(() => PrescriptionEntity)
  @Prop([{ type: PrescriptionEntity }])
  items: PrescriptionEntity[];

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  doctor: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  pharmacist: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  paidBy: string;

  @Prop()
  paidAt: Date;

  @Prop({ type: Types.ObjectId, ref: PatientEntity.name })
  patient: string;

  @Prop({ type: Number, default: 0 })
  totalCost: number;

  @Prop({ type: String, default: PrescriptionStatusEnum.PENDING })
  status: PrescriptionStatusEnum;

  @Prop({ type: String, enum: PaymentMethodEnum })
  paymentMethod: PaymentMethodEnum;

  @Prop()
  notes: string;

  @Prop()
  isRefill: boolean;

  @Prop()
  isPaid: boolean;

  @Prop()
  dispensedDate: Date;

  @Prop()
  receiptUrl: string;

  @Prop({ default: false })
  isIndividual: boolean;
}

export const PharmacyPrescriptionSchema = SchemaFactory.createForClass(
  PharmacyPrescriptionEntity,
);
export type PharmacyPrescriptionDocument = PharmacyPrescriptionEntity &
  Document;
