import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { DepartmentEntity } from 'src/department/schema/department.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class ShiftEntity {

  @Prop({ unique: true, required: true })
  name: Types.ObjectId;

  @Prop()
  startTime: string;

  @Prop()
  endTime: string;
}
export const ShiftSchema = SchemaFactory.createForClass(ShiftEntity);
export type ShiftDocument = ShiftEntity & Document;
