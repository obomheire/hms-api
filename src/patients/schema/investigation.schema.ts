import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { TestStatusEnum } from 'src/utils/enums/patients/testStatus.enum';
import { mongooseSchemaConfig } from '../../utils/database/schema.config';
import { DepartmentEntity } from 'src/department/schema/department.schema';
import { TestEntity } from 'src/laboratory/schema/test.schema';
import { Type } from 'class-transformer';
import { InvestigationResultEntity, InvestigationResultSchema } from '../../utils/schemas/patients/investigationResult.schema';
// import { VisitEntity } from 'src/patients/schema/visit-item.schema';
import { PatientEntity } from 'src/patients/schema/patients.schema';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { StockUsageEntity, StockUsageSchema } from 'src/laboratory/schema/recordUsage.schema';

@Schema(mongooseSchemaConfig)
export class InvestigationEntity {
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: TestEntity.name})
  test: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name })
  doctor: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name })
  paidBy: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PatientEntity.name })
  patient: string

  @Prop({ unique: true })
  uniqueCode: string;

  @Prop()
  note: string;

  @Prop()
  date: string

  @Prop({default: TestStatusEnum.PENDING})
  status: TestStatusEnum;

  @Prop({ type: String, enum: PaymentMethodEnum })
  paymentMethod: PaymentMethodEnum;

  @Prop()
  paidAt: Date;

  @Prop()
  totalCost: number;

  @Prop([{ type: StockUsageSchema }])
  @Type(() => StockUsageEntity)
  stockUsage: StockUsageEntity[];

  // @Prop([{ type: InvestigationResultSchema }])
  // @Type(() => InvestigationResultEntity)
  // result: InvestigationResultEntity[];

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  result: { [key: string]: string|number|boolean };


  @Prop()
  receiptUrl: string;

  @Prop()
  resultUrl: string;

  @Prop({
    default: false,
  })
  isIndividual: boolean;
}
export const InvestigationSchema =
  SchemaFactory.createForClass(InvestigationEntity);
export type InvestigationDocument = InvestigationEntity & Document;
