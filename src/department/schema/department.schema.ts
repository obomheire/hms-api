import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { ClinicEntity } from 'src/wards/schema/clinic.schema';
import { WardEntity } from 'src/wards/schema/wards.schema';
import { UnitEntity } from './unit.schema';

@Schema(mongooseSchemaConfig)
export class DepartmentEntity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  headOfDept?: string;

  // @Prop([{ type: Types.ObjectId, ref: WardEntity.name }])
  // wards?: Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name }])
  staff: Types.ObjectId[];

  // @Prop([{ type: Types.ObjectId, ref: ClinicEntity.name }])
  // clinics?: Types.ObjectId[];

  // @Prop([{ type: Types.ObjectId, ref: UnitEntity.name }])
  // units?: Types.ObjectId[];
}

export const DepartmentSchema = SchemaFactory.createForClass(DepartmentEntity);
export type DepartmentDocument = DepartmentEntity & Document;
