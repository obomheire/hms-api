import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from '../../database/schema.config';
import { DepartmentEntity } from 'src/department/schema/department.schema';

// @Schema(mongooseSchemaConfig)

export class DoctorNoteEntity {
  @Prop()
  diagnosis: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  doctor: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop()
  createdAt: Date;
}

