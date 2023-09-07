import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { DoctorNoteEntity } from '../../utils/schemas/patients/doctorNote.schema';
import { PatientEntity } from './patients.schema';

@Schema(mongooseSchemaConfig)
class Response {
  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  responseBy: string;

  @Prop()
  response: string;

  @Prop()
  responseTime: Date;
}

export const ResponseSchema =
  SchemaFactory.createForClass(Response);
export type ResponseDocument = Response & Document;

@Schema(mongooseSchemaConfig)
export class AssessmentLogEntity {
  @Prop()
  topic?: string;

  // @Prop([{ type: DoctorNoteEntity }])
  // @Type(() => DoctorNoteEntity)
  @Prop()
  note: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name})
  noteBy: string;

  // @Prop()
  // noteTime: Date;
  // @Prop([{ type: ResponseSchema }])
  // @Type(() => Response)

  // @Prop({ type: Types.ObjectId, ref: 'PatientEntity' })
  // visitId: string;
  @Prop()
  tags: string[];
}

export const AssessmentLogSchema =
  SchemaFactory.createForClass(AssessmentLogEntity);
export type AssessmentLogDocument = AssessmentLogEntity & Document;
