import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { DepartmentEntity } from 'src/department/schema/department.schema';
import { PatientEntity } from 'src/patients/schema/patients.schema';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class WardEntity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  totalBeds: number;

  @Prop({ default: 0})
  usedBeds: number;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  headOfWard?: string;

  @Prop({ type: Types.ObjectId, ref: 'DepartmentEntity' })
  department: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'UserEntity' }])
  staff?: string[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'PatientEntity' }])
  patients: string[];

  @Prop()
  phoneNumber?: string;
}

export const WardSchema = SchemaFactory.createForClass(WardEntity);
export type WardDocument = WardEntity & Document;

//before we save each ward or at each update, we want to be able to get the percentage used of beds and percentage ununsed
