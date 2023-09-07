import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { UserEntity } from 'src/user/schema/user.schema';

@Schema(mongooseSchemaConfig)
export class ClinicEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name }])
  staff: Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name })
  headOfClinic: Types.ObjectId;


  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'DepartmentEntity'})
  department: Types.ObjectId

}
export const ClinicSchema = SchemaFactory.createForClass(ClinicEntity);
export type ClinicDocument = ClinicEntity & Document;