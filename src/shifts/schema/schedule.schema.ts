import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { DepartmentEntity } from 'src/department/schema/department.schema';
import { UnitEntity } from 'src/department/schema/unit.schema';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { ShiftEntity } from './shifts.schema';

@Schema(mongooseSchemaConfig)
export class ScheduleEntity {
  @Prop({ type: Types.ObjectId, ref: ShiftEntity.name })
  shift: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  staff: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UnitEntity.name })
  unit: Types.ObjectId;

  // @Prop()
  // startDate: string

  // @Prop()
  // endDate: string

  @Prop()
  date: string;
}
export const ScheduleSchema = SchemaFactory.createForClass(ScheduleEntity);
export type ScheduleDocument = ScheduleEntity & Document;
