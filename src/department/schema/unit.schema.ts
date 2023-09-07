import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class UnitEntity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'DepartmentEntity'})
  department: Types.ObjectId;

  @Prop()
  phoneNumber: string

  @Prop({type: Types.ObjectId, ref: UserEntity.name })
  headOfUnit: Types.ObjectId;

  @Prop([{type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name }])
  staff: Types.ObjectId[];
}
export const UnitSchema = SchemaFactory.createForClass(UnitEntity);
export type UnitDocument = UnitEntity & Document;
