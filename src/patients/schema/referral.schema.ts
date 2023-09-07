import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { UserEntity } from 'src/user/schema/user.schema';
import { ClinicEntity } from '../../wards/schema/clinic.schema';
import { DepartmentEntity } from '../../department/schema/department.schema';

@Schema(mongooseSchemaConfig)
export class ReferralEntity {
  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  referredBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  referredTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: ClinicEntity.name })
  clinic?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: DepartmentEntity.name })
  department?: Types.ObjectId;

  @Prop()
  reason?: string;
}
export const ReferralSchema = SchemaFactory.createForClass(ReferralEntity);
export type ReferralDocument = ReferralEntity & Document;
