import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DesignationEntity } from 'src/role/schema/designation.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { WardEntity } from 'src/wards/schema/wards.schema';
import { TransactionTypeNameEnum, TransactionTypeStatusEnum } from '../enums/transaction-type.enum';

@Schema(mongooseSchemaConfig)
export class TransactionTypeEntity {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: Object.values(TransactionTypeNameEnum),
  })
  type: string;

  @Prop({
    type: String,
    enum: Object.values(TransactionTypeStatusEnum),
    default: TransactionTypeStatusEnum.ACTIVE,
  })
  status: TransactionTypeStatusEnum;

  @Prop()
  amount: number;

  id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: WardEntity.name,
  })
  ward: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DesignationEntity.name,
  })
  specialty: string;
}
export const TransactionTypeSchema = SchemaFactory.createForClass(
  TransactionTypeEntity,
);
export type TransactionTypeDocument = TransactionTypeEntity & Document;
