import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { DepartmentEntity } from 'src/department/schema/department.schema';
import { PatientEntity } from 'src/patients/schema/patients.schema';
import { PaymentStatusEnum } from 'src/payment/enum/payment.enum';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import {
  AppointmentStatusEnum, AppointmentFrequencyEnum
} from '../enum/appointment.enum';

@Schema(mongooseSchemaConfig)
export class AppointmentEntity {
  @Prop({ type: Types.ObjectId, ref: 'PatientEntity' })
  patient: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  doctor: string;

  @Prop({ type: Types.ObjectId, ref: 'DepartmentEntity' })
  department: string;

  @Prop()
  startDateTime: string;

  @Prop()
  startDate: string

  @Prop()
  endDate: string

  @Prop()
  startTime: string

  @Prop()
  endTime: string

  @Prop()
  orderNumber: number;

  @Prop()
  notes: string;

  @Prop({ type: String, default: AppointmentStatusEnum.PENDING })
  appointmentStatus: AppointmentStatusEnum;

  @Prop({
    type: String,
    enum: PaymentStatusEnum
  })
  status: string;

  @Prop({ type: String})
  frequency: AppointmentFrequencyEnum;

  @Prop()
  endFrequency: string;

  @Prop()
  endDateTime: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  isOpenedBy: string;

  @Prop({default: false})
  isSeenCompleted: boolean;

  @Prop({ type: String, enum: PaymentMethodEnum })
  paymentMethod: PaymentMethodEnum;

  @Prop({ type: Number, default: 0 })
  totalCost: number;

  @Prop({ type: Number })
  averageTime: number;

  @Prop({ default: false })
  isGeneralist: boolean;

}
export const AppointmentSchema =
  SchemaFactory.createForClass(AppointmentEntity);
export type AppointmentDocument = AppointmentEntity & Document;
